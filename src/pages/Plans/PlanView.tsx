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

function PlanView() {
  const [getStagesData, setGetStagesData] = useState<boolean>(false);
  const [selectedPlanImgUrl, setSelectedPlanImgUrl] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { id: projectId } = useParams();
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();

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

    refetchOnWindowFocus: false,
    staleTime: 6000,
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
      <div className="flex  justify-between  my-10 mx-10  min-h-full">
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
      {/* You can use selectedPlan and selectedDate for further actions */}
    </DefaultLayout>
  );
}

export default PlanView;
