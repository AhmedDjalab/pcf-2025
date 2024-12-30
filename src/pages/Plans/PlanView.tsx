//@ts-nocheck

import React, { useEffect, useMemo, useState } from "react";
import DefaultLayout from "src/components/DefaultLayout";
import "react-datepicker/dist/react-datepicker.css";
import { getPlans, getStagesDataByPlanId } from "src/Services/PlanService";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Dropdown from "src/components/DropDown";
import DatePickerDefault from "src/components/DatePicker";
import { useTranslation } from "react-i18next";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { RootState } from "src/state";
import { StageData } from "src/state/currentStageData";
import { Plan } from "src/state/slices/graphSlice";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "src/context/UserContext";
import useStage from "src/hooks/useStage";
import jsPDF from "jspdf";
import PaperSizeModal from "src/components/PaperSizeModal";
import html2canvas from "html2canvas";
import moment from "moment";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import ReadLayout from "src/libs/image-editor/layout/ReadLayout";
import View from "src/libs/image-editor/view";
import Frame from "src/libs/image-editor/view/frame";
import ImageItem from "src/libs/image-editor/view/object/image";
import TextItem from "src/libs/image-editor/view/object/text";
import ShapeItem from "src/libs/image-editor/view/object/shape";
import IconItem from "src/libs/image-editor/view/object/icon";
import LineItem from "src/libs/image-editor/view/object/line";
import PolygonItem from "src/libs/image-editor/view/object/polygon";
import ActivityTable from "src/libs/image-editor/view/object/Activity/ActivityTable";
import useTransformer from "src/hooks/useTransformer";
import useItem from "src/hooks/useItem";
import useTab from "src/hooks/useTab";
import useStageDataList from "src/hooks/useStageDataList";
import useWorkHistory from "src/hooks/useWorkHistory";
import { initialStageDataList } from "src/state/initilaStageDataList";

const normalizeCoordinates = (shape: StageData, referenceImage: StageData) => {
  const { width: imageWidth, height: imageHeight } = referenceImage.attrs;
  const { x, y, width, height, scaleX, scaleY, ...restAttrs } = shape.attrs;

  if (shape.className === "sample-image") return shape;

  return {
    ...shape,
    attrs: {
      ...restAttrs,
      x: x / imageWidth,
      y: y / imageHeight,
      width: width / imageWidth,
      height: height / imageHeight,
      scaleX: scaleX ? scaleX / (imageWidth / imageHeight) : 1,
      scaleY: scaleY ? scaleY / (imageHeight / imageWidth) : 1,
    },
  };
};

const denormalizeCoordinates = (
  shape: StageData,
  referenceImage: StageData
) => {
  const { width: imageWidth, height: imageHeight } = referenceImage.attrs;
  const { x, y, width, height, scaleX, scaleY, ...restAttrs } = shape.attrs;

  if (shape.className === "sample-image") return shape;

  return {
    ...shape,
    attrs: {
      ...restAttrs,
      x: x * imageWidth,
      y: y * imageHeight,
      width: width * imageWidth,
      height: height * imageHeight,
      scaleX: scaleX ? scaleX * (imageWidth / imageHeight) : 1,
      scaleY: scaleY ? scaleY * (imageHeight / imageWidth) : 1,
    },
  };
};

function PlanView() {
  const [selectedPlanImgUrl, setSelectedPlanImgUrl] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPlanEntity, setSelectedPlanEntity] = useState<Plan | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [incrementType, setIncrementType] = useState("d");
  const [paperSizeModalOpen, setPaperSizeModalOpen] = useState(false);

  const { id: projectId } = useParams();
  const { t } = useTranslation();
  const stage = useStage();
  const transformer = useTransformer();
  const { stageData, alterItems, clearItems, createItem } = useItem();
  const [past, setPast] = useState<StageData[][]>([]);
  const [future, setFuture] = useState<StageData[][]>([]);

  const { goToFuture, goToPast, recordPast } = useWorkHistory(
    past,
    future,
    setPast,
    setFuture
  );
  const { tabList, onClickTab, onCreateTab } = useTab(transformer, () => {});
  const { initializeFileDataList, updateFileData } = useStageDataList();

  // Queries
  const {
    data: plansData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["plans", projectId],
    queryFn: () =>
      getPlans({
        fromvalue: 0,
        takevalue: 0,
        projectId: projectId!,
      }),
    refetchOnWindowFocus: false,
    staleTime: 6000,
    enabled: !!projectId,
  });

  const { data: stagesData } = useQuery({
    queryKey: ["stagesData", projectId, selectedPlan, selectedDate],
    queryFn: () =>
      getStagesDataByPlanId({
        planId: selectedPlan!,
        date: selectedDate!,
      }),
    refetchOnWindowFocus: false,
    staleTime: 1000,
    enabled: !!selectedPlan && !!selectedDate,
  });

  // Initial image data
  const initialImgData = useMemo<StageData>(
    () => ({
      id: uuidv4(),
      attrs: {
        name: "label-target",
        "data-item-type": "image",
        x: 10,
        y: 10,
        width: 800,
        height: 536.0406091,
        src: selectedPlanEntity?.planImageUrl,
        draggable: false,
        zIndex: 0,
        brightness: 0,
        _filters: ["Brighten"],
        updatedAt: Date.now(),
      },
      className: "sample-image",
      children: [],
    }),
    [selectedPlanEntity]
  );

  // Process stage data
  const processedStageData = useMemo(() => {
    if (!stagesData || !initialImgData) return [];

    return stagesData
      .map((item) => ({
        ...item,
        attrs: {
          ...item.attrs,
          "data-item-type": item.attrs.dataItemType,
        },
      }))
      .map((item) => denormalizeCoordinates(item, initialImgData));
  }, [stagesData, initialImgData]);

  // Unique activities
  const uniqueActivities = useMemo(() => {
    const seenIds = new Set();
    return stagesData
      ?.flatMap((sd) => sd.activities || [])
      .filter((activity) => {
        return (
          activity?.id && !seenIds.has(activity.id) && seenIds.add(activity.id)
        );
      });
  }, [stagesData]);

  // Date handlers
  const incrementDate = () => {
    setSelectedDate((prevDate) => {
      if (!prevDate) return new Date();
      const newDate = new Date(prevDate);
      if (incrementType === "d") newDate.setDate(newDate.getDate() + 1);
      else if (incrementType === "m") newDate.setMonth(newDate.getMonth() + 1);
      else if (incrementType === "y")
        newDate.setFullYear(newDate.getFullYear() + 1);
      return newDate;
    });
  };

  const decrementDate = () => {
    setSelectedDate((prevDate) => {
      if (!prevDate) return new Date();
      const newDate = new Date(prevDate);
      if (incrementType === "d") newDate.setDate(newDate.getDate() - 1);
      else if (incrementType === "m") newDate.setMonth(newDate.getMonth() - 1);
      else if (incrementType === "y")
        newDate.setFullYear(newDate.getFullYear() - 1);
      return newDate;
    });
  };

  // Plan selection handler
  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value;
    setSelectedPlan(planId);
    const plan = plansData?.plans.find((x) => x.id === planId);
    if (plan) {
      setSelectedPlanEntity(plan);
      setSelectedPlanImgUrl(plan.planImageUrl);
    }
  };

  // Shape rendering
  const renderObject = (item: StageData) => {
    if (item.className === "sample-image") return null;

    switch (item.attrs["data-item-type"]) {
      case "frame":
        return (
          <Frame
            key={`frame-${item.id}`}
            data={item}
            onSelect={() => {}}
            readOnly={true}
          />
        );
      case "text":
        return (
          <TextItem
            key={`text-${item.id}`}
            data={item}
            transformer={transformer}
            onSelect={() => {}}
            readOnly={true}
          />
        );
      case "shape":
        return (
          <ShapeItem
            key={`shape-${item.id}`}
            data={item}
            transformer={transformer}
            onSelect={() => {}}
            readOnly={true}
          />
        );
      case "icon":
        return (
          <IconItem
            key={`icon-${item.id}`}
            data={item}
            transformer={transformer}
            onSelect={() => {}}
            readOnly={true}
          />
        );
      case "line":
        return (
          <LineItem
            key={`line-${item.id}`}
            data={item}
            transformer={transformer}
            onSelect={() => {}}
            readOnly={true}
          />
        );
      case "polygon":
        return (
          <PolygonItem
            key={`polygon-${item.id}`}
            data={item}
            transformer={transformer}
            onSelect={() => {}}
            readOnly={true}
          />
        );
      default:
        return null;
    }
  };

  // Initialize stage
  useEffect(() => {
    if (!stage.stageRef.current) return;

    // Initialize stage position
    stage.stageRef.current.setPosition({
      x: Math.max(Math.ceil(stage.stageRef.current.width() - 1280) / 2, 0),
      y: Math.max(Math.ceil(stage.stageRef.current.height() - 760) / 2, 0),
    });

    // Clear and add new items
    clearItems();
    if (initialImgData) {
      createItem(initialImgData);
    }

    processedStageData.forEach((shape) => {
      if (shape.className !== "sample-image") {
        createItem(shape);
      }
    });

    stage.stageRef.current.batchDraw();
  }, [processedStageData, initialImgData, stage.stageRef]);

  return (
    <DefaultLayout>
      <div className="h-full w-full overflow-hidden">
        <div className="flex justify-between my-10 mx-10">
          {/* Plan Dropdown */}
          <div className="w-[40%]">
            <Dropdown
              id="planId"
              name="planId"
              label={t("plansForm.plans")}
              labelClassName="w-[40%]"
              onChange={handlePlanChange}
              value={selectedPlan}
              optionValue="id"
              optionLabel="name"
              className="w-[60%] rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              options={plansData?.plans ?? []}
            />
          </div>

          {/* PDF Export Button */}
          <div className="mt-8">
            <button
              className="focus:outline-none text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-8 py-2.5"
              onClick={() => setPaperSizeModalOpen(true)}
            >
              PDF
            </button>
          </div>

          {/* Date Navigation */}
          <div className="relative w-[30%] flex gap-2 items-end">
            <ArrowLeftIcon
              className="h-10 w-10 text-gray-500 border border-gray-500 p-2 mb-2 cursor-pointer"
              onClick={decrementDate}
            />

            <select
              className="border p-2 mb-2"
              value={incrementType}
              onChange={(e) => setIncrementType(e.target.value)}
            >
              <option value="d">{t("dateOptions.day")}</option>
              <option value="m">{t("dateOptions.month")}</option>
              <option value="y">{t("dateOptions.year")}</option>
            </select>

            <DatePickerDefault
              id="date"
              name="date"
              label={t("plansForm.date")}
              labelClassName=" -mt-2 w-[70%]!"
              value={selectedDate}
              defaultDate={selectedDate ?? new Date()}
              onChange={setSelectedDate}
            />

            <ArrowRightIcon
              className="h-10 w-10 text-gray-500 border border-gray-500 p-2 mb-2 cursor-pointer"
              onClick={incrementDate}
            />
          </div>
        </div>

        {/* Konva Stage */}
        <ReadLayout
          settingBar={<ActivityTable activities={uniqueActivities ?? []} />}
        >
          <View onSelect={() => {}} stage={stage}>
            {selectedPlanImgUrl && initialImgData && (
              <ImageItem
                key={`image-${initialImgData.id}`}
                data={initialImgData}
                onSelect={() => {}}
              />
            )}

            {stageData.length > 0 &&
              stageData
                .filter((item) => item.className !== "sample-image")
                .map(renderObject)}
          </View>
        </ReadLayout>

        {/* PDF Size Modal */}
        {paperSizeModalOpen && (
          <div className="w-[60%]">
            <PaperSizeModal
              isOpen={paperSizeModalOpen}
              onClose={() => setPaperSizeModalOpen(false)}
              onSave={(paperSize, orientation) => {
                // Implement your PDF save logic here
                setPaperSizeModalOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}

export default PlanView;
