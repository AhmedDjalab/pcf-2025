import React, { useCallback, useEffect, useRef, useState } from "react";
import useClickOutside from "../hooks/useClickOutside";
import texturesData from "../const/texturesArray";
import * as d3 from "d3";

export interface ITexturePickerProps {
  onSelectTexture: any;
  texturetype: string;
}

const TexturePicker = ({
  onSelectTexture,
  texturetype,
}: ITexturePickerProps) => {
  const popover = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedTextureFromId =
    texturesData.find((x) => x.id == texturetype) ?? texturesData[0];
  const [selectedTexture, setSelectedTexture] = useState(selectedTextureFromId);

  const close = useCallback(() => setIsOpen(false), []);

  const handleTextureClick = (texture: any) => {
    setSelectedTexture(texture);
    onSelectTexture(texture.id);
    close();
  };

  useEffect(() => {
    const svg = d3.select("svg");

    // Clear any previous textures
    //svg.selectAll("*").remove();

    // Apply the selected texture
    const texture = selectedTexture.configuration;
    svg.call(texture);

    // Apply textures to all texture options
    texturesData.forEach((textureOption) => {
      const optionTexture = textureOption.configuration;
      svg.call(optionTexture);
    });

    // // Notify the parent component of the selected texture
    // onSelectTexture(selectedTexture.id);
  }, [selectedTexture]);

  useClickOutside(popover, close);

  return (
    <div className="relative" ref={popover}>
      {/* Assign ref to the wrapper div */}
      <div
        className="cursor-pointer rounded-lg border-[3px] border-solid border-white"
        onClick={() => setIsOpen(true)}
      >
        <svg width="40" height="40">
          <rect
            x="5"
            y="5"
            width="40"
            height="40"
            style={{ fill: selectedTexture.configuration.url() }}
          />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute  z-20 shadow-[0_6px_12px_rgba(0,0,0,0.15)] rounded-[9px] left-0 top-[calc(100%_+_2px)]">
          <div className="grid grid-cols-3 gap-4 px-4 justify-start bg-white p-2 ">
            {texturesData.map((texture) => (
              <div
                key={texture.id}
                className=" cursor-pointer rounded-lg border-[3px] border-solid border-white "
                onClick={() => handleTextureClick(texture)}
              >
                <svg width="40" height="40">
                  <rect
                    x="5"
                    y="5"
                    width="40"
                    height="40"
                    style={{ fill: texture.configuration.url() }}
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TexturePicker;
