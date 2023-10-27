import React, { useCallback, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import useClickOutside from "../hooks/useClickOutside";

export const PopoverColorPicker = ({
  color,
  onChange,
  isOpen,
  toggle,
  onChangeComplete,
}: any) => {
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
    <div className="relative w-full">
      <div
        className="w-7 h-7 shadow-[0_0_0_1px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(0,0,0,0.1)] cursor-pointer rounded-lg border-[3px] border-solid border-white"
        style={{ backgroundColor: currentColor }}
        onClick={() => toggle(true)}
      />

      {isOpen && (
        <div
          className="absolute z-10 shadow-[0_6px_12px_rgba(0,0,0,0.15)] rounded-[9px] left-0 top-[calc(100%_+_2px)]"
          ref={popover}
        >
          <HexColorPicker color={color} onChange={handleChangeColor} />
        </div>
      )}
    </div>
  );
};
