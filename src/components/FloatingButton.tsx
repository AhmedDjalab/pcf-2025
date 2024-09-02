import React, { useState, ReactNode, ReactElement, useEffect } from "react";
import {
  ViewColumnsIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

export interface MenuPropsType {
  title: string;
  Icon: ReactElement;
  onClick: () => void;
  disabled: boolean;
  color?: string;
}

type FloatingButtonProps = {
  children: MenuPropsType[] | ReactNode;
  position: "left" | "right";
  disabled: boolean;
  color?: string;
};

const FloatingButton: React.FC<FloatingButtonProps> = ({
  children,
  position,
  disabled,
  color,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const isArrayOfButtons =
    Array.isArray(children) &&
    (children as MenuPropsType[]).every(
      (child) =>
        (child as MenuPropsType).Icon && (child as MenuPropsType).onClick
    );

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <div
      className={`fixed ${
        position === "left" ? "left-10 " : "right-10"
      } bottom-10 z-[3000] `}
    >
      <div
        className={`rounded-full ${
          position === "left" ? "bg-blue-400" : "bg-green-400"
        } text-white w-15 h-15 flex items-center justify-center cursor-pointer `}
        onClick={toggleOpen}
      >
        {position === "left" ? (
          <WrenchScrewdriverIcon className="p-2" />
        ) : (
          <ViewColumnsIcon className="p-2" />
        )}
      </div>
      {isOpen && (
        <div
          className={`absolute w-full bottom-16 ${
            position === "left" ? "left-5 " : "right-50"
          } rounded-lg p-3 transition-all duration-200 ease-in-out z-[3000]`}
        >
          {isArrayOfButtons ? (
            <div className="relative z-[3000] flex flex-col items-center space-y-4 w-65 bg-white dark:bg-boxdark shadow-md p-5 rounded-xl">
              {(children as MenuPropsType[])
                .map(({ title, Icon, onClick, disabled, color }, index) => (
                  <div
                    key={index}
                    className={`flex items-center w-full cursor-pointer ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    } p-2 rounded-lg`}
                    onClick={!disabled ? onClick : undefined}
                  >
                    <p className="flex-grow text-black dark:text-white text-xl whitespace-nowrap overflow-hidden text-ellipsis">
                      {title}
                    </p>
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full ${
                        color || "bg-orange-300"
                      } flex items-center justify-center text-white dark:text-boxdark`}
                    >
                      {Icon}
                    </div>
                  </div>
                ))
                .reverse()}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-xl w-[800px] z-[3000]  border-2">
              {children as ReactNode[]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingButton;
