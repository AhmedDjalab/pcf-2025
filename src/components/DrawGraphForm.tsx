import React, { useContext, useEffect, useState } from "react";
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
  useRoutes,
} from "react-router-dom";
const steps = [
  {
    stepNumber: 1,
    title: "Entête du planning",
    description: "Entrez le titre du projet & Logo",
  },
  {
    stepNumber: 2,
    title: "Importer le fichier Excel",
    description: "Faites Glissez ou importez votre fichier",
  },
  {
    stepNumber: 3,
    title: "Définition des Styles",
    description: "Définissez le style des activités",
  },
  {
    stepNumber: 4,
    title: "Définition des tronçons",
    description: "Définissez le début et la fin de chaque tronçon",
  },
  // {
  //   stepNumber: 4,
  //   title: "Chart",
  //   description: "Draw your chart",
  // },
];
export interface MultiStepFormProps {
  currentStep: number;
  stepsLength: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export const DrawGraphForm = ({}) => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="rounded-sm  p-10 bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
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
      {/* {currentStep === 4 && <DrawGraphStep />} */}
    </div>
  );
};
