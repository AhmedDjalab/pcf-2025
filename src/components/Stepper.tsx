import React from "react";

interface Step {
  stepNumber: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <ol className="w-[100%] items-center space-y-4 sm:flex sm:space-x-8 sm:space-y-0">
      {steps.map((step) => (
        <li
          key={step.stepNumber}
          className={`flex items-center ${
            step.stepNumber <= currentStep
              ? "text-blue-600 dark:text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          } space-x-2.5`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center border ${
              step.stepNumber <= currentStep
                ? "border-blue-600 dark:border-blue-500"
                : "border-gray-500 dark:border-gray-400"
            } shrink-0 rounded-full`}
          >
            {step.stepNumber}
          </span>
          <span>
            <h3 className="font-medium leading-tight">{step.title}</h3>
            <p className="text-sm">{step.description}</p>
          </span>
        </li>
      ))}
    </ol>
  );
};

export default Stepper;
