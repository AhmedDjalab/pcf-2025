import React, { useContext, useEffect, useMemo, useState } from "react";
import ShapesForm from "./ShapesForm";
import { ImportFileForm } from "./ImportFileForm";
import Stepper from "./Stepper";
import DrawGraphStep from "./DrawGraphStep";
import TaskSlotsStep from "./TaskSlotsStep";
import ProjectSettingForm from "./ProjectSettingForm";

import {
  UNSAFE_NavigationContext,
  useLocation,
  useNavigate,
  useParams,
  useRoutes,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import TaskSlotsLevelTwoList from "./TaskSlotStepLevelTwo";
import DefaultLayout from "./DefaultLayout";

export interface MultiStepFormProps {
  currentStep: number;
  stepsLength: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export const DrawGraphForm = ({}) => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => setCurrentStep(id ? parseInt(id) : 1), [id]);

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
        {/* {currentStep === 4 && <DrawGraphStep />} */}
      </div>
    </DefaultLayout>
  );
};
