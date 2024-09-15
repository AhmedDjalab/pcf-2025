import React, { useEffect, useState } from "react";
import ShapesForm from "./ShapesForm";
import { ImportFileForm } from "./ImportFileForm";
import Stepper from "./Stepper";
import TaskSlotsStep from "./TaskSlotsStep";
import ProjectSettingForm from "./ProjectSettingForm";

import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TaskSlotsLevelTwoList from "./TaskSlotStepLevelTwo";
import DefaultLayout from "./DefaultLayout";
import { useDispatch } from "react-redux";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { RootState } from "src/state";
import {
  applyFilter,
  fetchAllProjectsOptions,
  fetchProjectByIdThunk,
} from "src/state/slices/graphSlice";
import PlansList from "./PlansStep";

export interface MultiStepFormProps {
  currentStep: number;
  stepsLength: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export const DrawGraphForm = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  // useEffect(() => setCurrentStep(id ? parseInt(id) : 1), [id]);
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectByIdThunk(id));
    }
  }, [dispatch, id]);
  //? fetch all project options
  useEffect(() => {
    dispatch(fetchAllProjectsOptions());
  }, [dispatch]);
  const steps = [
    {
      stepNumber: 1,
      title: t("DrwMultiStepForm.step1.title"),
      description: t("DrwMultiStepForm.step1.description"),
    },
    {
      stepNumber: 2,
      title: t("DrwMultiStepForm.step2.title"),
      description: t("DrwMultiStepForm.step2.description"),
    },
    {
      stepNumber: 3,
      title: t("DrwMultiStepForm.step3.title"),
      description: t("DrwMultiStepForm.step3.description"),
    },
    {
      stepNumber: 4,
      title: t("DrwMultiStepForm.step4.title"),
      description: t("DrwMultiStepForm.step4.description"),
    },
    {
      stepNumber: 5,
      title: t("DrwMultiStepForm.step5.title"),
      description: t("DrwMultiStepForm.step5.description"),
    },
    {
      stepNumber: 6,
      title: t("DrwMultiStepForm.step6.title"),
      description: t("DrwMultiStepForm.step6.description"),
    },
  ];
  return (
    <DefaultLayout>
      <div className="rounded-sm w-full overflow-x-auto p-10 bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <Stepper steps={steps} currentStep={currentStep} />

        {currentStep === 1 && (
          <ProjectSettingForm
            currentStep={currentStep}
            stepsLength={steps.length}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 2 && (
          <ImportFileForm
            currentStep={currentStep}
            stepsLength={steps.length}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 3 && (
          <ShapesForm
            currentStep={currentStep}
            stepsLength={steps.length}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 4 && (
          <TaskSlotsStep
            currentStep={currentStep}
            stepsLength={steps.length}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 5 && (
          <TaskSlotsLevelTwoList
            currentStep={currentStep}
            stepsLength={steps.length}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 6 && (
          <PlansList
            currentStep={currentStep}
            stepsLength={steps.length}
            setCurrentStep={setCurrentStep}
          />
        )}
        {/* {currentStep === 4 && <DrawGraphStep />} */}
      </div>
    </DefaultLayout>
  );
};
