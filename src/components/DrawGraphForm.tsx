import React, { useState } from "react";
import ShapesForm from "./ShapesForm";
import { ImportFileForm } from "./ImportFileForm";
import Stepper from "./Stepper";
import DrawGraphStep from "./DrawGraphStep";
const steps = [
  {
    stepNumber: 1,
    title: "Import File",
    description: "Import File and add settings",
  },
  {
    stepNumber: 2,
    title: "Shapes",
    description: "Add Shapes to your graph",
  },
  {
    stepNumber: 3,
    title: "Chart",
    description: "Draw your chart",
  },
];
export interface MultiStepFormProps {
  currentStep: number;
  stepsLength: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export const DrawGraphForm = ({}) => {
  const [currentStep, setCurrentStep] = useState(1);
  return (
    <div className="rounded-sm border border-stroke p-10 bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <Stepper steps={steps} currentStep={currentStep} />
      {currentStep === 1 && (
        <ImportFileForm
          currentStep={currentStep}
          stepsLength={steps.length}
          setCurrentStep={setCurrentStep}
        />
      )}
      {currentStep === 2 && (
        <ShapesForm
          currentStep={currentStep}
          stepsLength={steps.length}
          setCurrentStep={setCurrentStep}
        />
      )}
      {currentStep === 3 && <DrawGraphStep />}
    </div>
  );
};
