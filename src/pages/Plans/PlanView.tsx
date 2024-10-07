//@ts-nocheck

import React, { useEffect, useMemo, useState } from "react";

import DefaultLayout from "src/components/DefaultLayout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getPlans,
  getStagesDataByPlanId,
  PlansResponse,
} from "src/Services/PlanService";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Dropdown from "src/components/DropDown";
import DatePickerDefault from "src/components/DatePicker";
import { useTranslation } from "react-i18next";
import PlanSelectEditor from "src/PlanSelectEditor";
import ImageEditor from "src/libs/image-editor/ImageEditor";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { RootState } from "src/state";
import { StageData } from "src/state/currentStageData";
import {
  addStageDataToPlan,
  StageDataModel,
} from "src/state/slices/graphSlice";
import { v4 as uuidv4 } from "uuid";
import { Spinner } from "react-bootstrap";
import { useAuth } from "src/context/UserContext";
import useStage from "src/hooks/useStage";
import jsPDF from "jspdf";
import PaperSizeModal from "src/components/PaperSizeModal";
import html2canvas from "html2canvas";
import moment from "moment";

function PlanView() {
  const [getStagesData, setGetStagesData] = useState<boolean>(false);
  const [selectedPlanImgUrl, setSelectedPlanImgUrl] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { id: projectId } = useParams();
  const [paperSizeModalOpen, setPaperSizeModalOpen] = useState(false);
  const stage = useStage();
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const { user, canWrite, isAdmin } = useAuth();
  const handleSaveAsPdfOrImage = (paperSize: string, orientation: string) => {
    // Call the updated function here
    saveAsPdfOrImage("pdf", paperSize, orientation);
  };
  const saveAsPdfOrImage = async (
    format: string,
    paperSize: string = "A4",
    orientation: string = "portrait"
  ) => {
    const graph = document.querySelector(".konvajs-content");
    const legend = document.querySelector("aside");
    var fileName = `${selectedPlan}.${moment(new Date()).format("DD/MM/YYYY")}`;

    if (!graph || !legend) {
      console.error("SVG container, graph, or legend not found");
      return;
    }

    try {
      const sizes: Record<string, [number, number]> = {
        A3: [297, 420],
        A4: [210, 297],
        A5: [148, 210],
      };

      let [pageWidthMM, pageHeightMM] = sizes[paperSize];
      if (orientation === "landscape") {
        [pageWidthMM, pageHeightMM] = [pageHeightMM, pageWidthMM];
      }

      const pageWidthPx = pageWidthMM * 3.7795275591;
      const pageHeightPx = pageHeightMM * 3.7795275591;

      // Helper function to capture element as canvas using iframe
      const captureElement = async (element: HTMLElement) => {
        const iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.top = "-9999px";
        document.body.appendChild(iframe);

        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow?.document;
        iframeDocument?.open();
        iframeDocument?.write(element.outerHTML);
        iframeDocument?.close();

        const iframeElement = iframeDocument?.body?.firstChild as HTMLElement;
        iframeElement.style.overflow = "visible";

        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for rendering

        const canvas = await html2canvas(iframeElement, {
          useCORS: true,
          allowTaint: false,
          scale: 2,
          logging: true,
          width: element.scrollWidth, // Capture full width
          height: element.scrollHeight, // Capture full height
        });

        document.body.removeChild(iframe);
        return canvas;
      };

      const graphCanvas = await captureElement(graph);
      const graphDataURL = graphCanvas.toDataURL("image/png", 2.0);

      const legendCanvas = await captureElement(legend);
      const legendDataURL = legendCanvas.toDataURL("image/png", 2.0);

      const scaleToFit = (
        canvas: HTMLCanvasElement,
        pageWidth: number,
        pageHeight: number
      ) => {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const scaleX = pageWidth / canvasWidth;
        const scaleY = pageHeight / canvasHeight;
        const scale = Math.min(scaleX, scaleY);

        return {
          width: canvasWidth * scale,
          height: canvasHeight * scale,
          scale,
        };
      };

      if (format === "pdf") {
        const pdf = new jsPDF(orientation, "mm", [pageWidthMM, pageHeightMM]);
        const { width: graphWidth, height: graphHeight } = scaleToFit(
          graphCanvas,
          pageWidthPx,
          pageHeightPx
        );

        pdf.addImage(
          graphDataURL,
          "PNG",
          0,
          0,
          graphWidth / 3.7795275591,
          graphHeight / 3.7795275591
        );

        pdf.addPage();
        const { width: legendWidth, height: legendHeight } = scaleToFit(
          legendCanvas,
          pageWidthPx,
          pageHeightPx
        );

        pdf.addImage(
          legendDataURL,
          "PNG",
          0,
          0,
          legendWidth / 3.7795275591,
          legendHeight / 3.7795275591
        );

        pdf.save(`${fileName}.pdf`);
      } else if (format === "image") {
        const combinedCanvas = document.createElement("canvas");
        const combinedCtx = combinedCanvas.getContext("2d");

        if (!combinedCtx) {
          console.error("Failed to get canvas context");
          return;
        }

        combinedCanvas.width = Math.max(graphCanvas.width, legendCanvas.width);
        combinedCanvas.height = graphCanvas.height + legendCanvas.height;

        combinedCtx.drawImage(graphCanvas, 0, 0);
        combinedCtx.drawImage(legendCanvas, 0, graphCanvas.height);

        const combinedDataURL = combinedCanvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = combinedDataURL;
        link.download = `${fileName}.png`;
        link.click();
      }
    } catch (error) {
      console.error("Error capturing content:", error);
    }
  };

  const { t } = useTranslation();
  // React Query to fetch plans
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

  const {
    data: stagesData,
    isLoading: stagesDataLoading,
    isError: stagesDataError,
    refetch: refetchStageData,
  } = useQuery({
    queryKey: ["stagesData", projectId, selectedPlan, selectedDate],
    queryFn: () =>
      getStagesDataByPlanId({
        planId: selectedPlan!,
        date: selectedDate!,
      }),

    refetchOnWindowFocus: true,
    staleTime: 3000,
  });

  // Handle plan selection
  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlan(e.target.value);
    var plan = plansData?.plans.filter((x) => x.id == e.target.value)[0]!;
    setSelectedPlanImgUrl(plan.planImageUrl);
  };

  // Handle date selection
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };
  const handleGetStageData = (e: any) => {
    // setGetStagesData(true);
    // refetchStageData();
  };

  const initialData = useMemo<StageData[]>(
    () => [
      {
        id: uuidv4(),

        attrs: {
          name: "label-target",
          "data-item-type": "image",
          x: 10,
          y: 10,
          width: 800,
          height: 536.0406091,
          src: selectedPlanImgUrl,
          draggable: false,
          zIndex: 0,
          brightness: 0,
          _filters: ["Brighten"],
          updatedAt: Date.now(),
        },
        className: "sample-image",
        children: [],
      },
    ],
    [selectedPlanImgUrl]
  );

  const seenIds = new Set();

  const uniqueActivities = useMemo(
    () =>
      stagesData
        ?.flatMap((sd) => sd.activities || [])
        .filter((activity) => {
          // Filter to only allow unique IDs
          return (
            activity?.id &&
            !seenIds.has(activity.id) &&
            seenIds.add(activity.id)
          );
        }),
    [seenIds, stagesData]
  );
  return (
    <DefaultLayout>
      <div className="  h-full w-full overflow-hidden">
        <div className="flex  justify-between my-10 mx-10 ">
          {/* Dropdown for plans */}
          <div className="w-[40%]">
            {isLoading ? (
              <p>Loading plans...</p>
            ) : isError ? (
              <p>Error loading plans</p>
            ) : (
              <Dropdown
                id="planId"
                name="planId"
                label={t("plansForm.plans")}
                labelClassName="w-[40%]"
                onChange={handlePlanChange}
                value={selectedPlan}
                optionValue="id"
                optionLabel="name"
                className=" w-[60%]  rounded-lg border border-gray-300 bg-gray-50  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                options={plansData?.plans ?? []}
              />
            )}
          </div>

          {/* <button
            // disabled
            className="focus:outline-none mt-5  text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 flex items-center"
            // onClick={() => saveAsPdfOrImage("pdf")}
            onClick={() => setPaperSizeModalOpen(true)}
          >
            PDF
          </button>
          <button
            // disabled
            className="focus:outline-none mt-5  text-white bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-900 flex items-center"
            onClick={() => saveAsPdfOrImage("image")}
          >
            Image
          </button> */}

          <div className="relative w-[30%] ">
            <DatePickerDefault
              id="date"
              name="date"
              label={t("plansForm.date")}
              labelClassName="-mt-[0.5rem] w-[50%]"
              value={selectedDate}
              defaultDate={selectedDate ?? new Date()}
              onChange={handleDateChange}
            />
          </div>
          {/* <div className="mt-7">
          <button
            type="button"
            onClick={handleGetStageData}
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 focus:outline-none focus:ring focus:ring-violet-300 disabled:bg-gray-600"
          >
            {t("importFileForm.SaveFilter")}
          </button>
        </div> */}
        </div>
        {stagesData &&
          (stagesDataLoading ? (
            <Spinner />
          ) : (
            <ImageEditor
              key={selectedPlan}
              onSaveState={(data) => {}}
              initialStageData={
                stagesData.length > 0
                  ? stagesData.map<StageData[]>((s) => {
                      return {
                        ...s,
                        attrs: {
                          ...s.attrs,

                          "data-item-type": s.attrs.dataItemType,
                        },
                      };
                    })
                  : initialData
              }
              imgUrl={""}
              activities={[]}
              readOnly={true}
              stageActivities={uniqueActivities}
            />
          ))}

        {paperSizeModalOpen && (
          <PaperSizeModal
            isOpen={paperSizeModalOpen}
            onClose={() => setPaperSizeModalOpen(false)}
            onSave={handleSaveAsPdfOrImage}
          />
        )}
      </div>
    </DefaultLayout>
  );
}

export default PlanView;
