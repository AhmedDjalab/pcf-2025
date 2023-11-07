import React, { useCallback, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import useClickOutside from "../hooks/useClickOutside";
import { classNames } from "src/const/vars";

export interface PopoverColorPickerProps {
  color: string;
  onChange?: any;
  isOpen: boolean;
  toggle: any;
  onChangeComplete: any;
  label?: string;
  id?: string;
  classname?: string;
}

export const PopoverColorPicker = ({
  id,
  color,
  onChange,
  isOpen,
  toggle,
  onChangeComplete,
  label,
  classname,
}: PopoverColorPickerProps) => {
  const [currentColor, setCurrentColor] = useState(color);
  const popover = useRef<HTMLDivElement>(null);

  const close = useCallback(
    (event: MouseEvent) => {
      toggle(false);
      onChangeComplete(currentColor);
    },
    [currentColor, onChangeComplete, toggle]
  );

  const handleChangeColor = (color: string) => {
    setCurrentColor(color);
  };
  useClickOutside(popover, close);

  return (
    <div className="relative w-full justify-center items-center flex">
      {label && (
        <label
          htmlFor={id}
          className={`
        mb-2 block text-sm font-medium text-gray-900 dark:text-white     
        `}
        >
          {label}
        </label>
      )}
      <div
        className={` ${
          classname ? classname : "w-7 "
        }  h-7 shadow-[0_0_0_1px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(0,0,0,0.1)] cursor-pointer rounded-lg border-[3px] border-solid border-transparent`}
        style={{ backgroundColor: currentColor }}
        onClick={() => toggle(true)}
      />

      {isOpen && (
        <div
          className="absolute min-h-60 overflow-y-auto max-h-80  z-10 shadow-[0_6px_12px_rgba(0,0,0,0.15)] rounded-[9px] left-0 top-[calc(100%_+_2px)]"
          ref={popover}
        >
          <HexColorPicker color={color} onChange={handleChangeColor} />
        </div>
      )}
    </div>
  );
};
