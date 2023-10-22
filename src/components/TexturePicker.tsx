import React, { useCallback, useEffect, useRef, useState } from "react";
import useClickOutside from "../hooks/useClickOutside";
import texturesData, { TextureData } from "../const/texturesArray";
import * as d3 from "d3";

export interface ITexturePickerProps {
  rowId: string;
  onSelectTexture: any;
  texturetype: TextureData;
  color?: string;
}

const TexturePicker = ({
  rowId: key,
  color,
  onSelectTexture,
  texturetype,
}: ITexturePickerProps) => {
  const popover = useRef(null);
  const svgRef = useRef<SVGSVGElement | null>(null); // Ref for the SVG element

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTexture, setSelectedTexture] = useState(texturetype);

  const sanitizeClassName = (key: string): string => {
    // Replace any characters that are not letters, numbers, hyphens, or underscores with hyphens
    return key.replace(/[^a-zA-Z0-9-_]/g, "-");
  };

  const close = useCallback(() => setIsOpen(false), []);

  const handleTextureClick = (texture: any) => {
    setSelectedTexture(texture);
    onSelectTexture(texture.id);
    close();
  };

  useEffect(() => {
    // Access the SVG element using the ref
    const svg = d3.select(svgRef.current);

    // Continue with your D3 operations on 'svg'
    const texture = selectedTexture.configuration.id(
      selectedTexture.id + sanitizeClassName(key)
    );
    svg.call(texture.stroke(color));

    // Apply textures to all texture options
    texturesData.forEach((textureOption) => {
      const optionTexture = textureOption.configuration
        .id(textureOption.id + sanitizeClassName(key))
        .stroke(color);
      svg.call(optionTexture);
    });
  }, [selectedTexture, color, key]);

  useClickOutside(popover, close);

  return (
    <div className="relative" ref={popover} key={key}>
      {/* Assign ref to the SVG element */}
      <div
        className="cursor-pointer rounded-lg border-[3px] border-solid border-white"
        onClick={() => setIsOpen(true)}
      >
        <svg
          ref={svgRef} // Attach the ref to the SVG element
          className={".svg-" + sanitizeClassName(key.trim())}
          width="40"
          height="40"
        >
          <rect
            x="5"
            y="5"
            width="40"
            height="40"
            style={{
              fill: selectedTexture.configuration
                .id(selectedTexture.id + sanitizeClassName(key))
                .url(),
            }}
          />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-20 shadow-[0_6px_12px_rgba(0,0,0,0.15)] rounded-[9px] left-0 top-[calc(100%_+_2px)]">
          <div className="grid grid-cols-3 gap-4 px-4 justify-start bg-white p-2 ">
            {texturesData.map((texture) => (
              <div
                key={texture.id + sanitizeClassName(key)}
                className="cursor-pointer rounded-lg border-[3px] border-solid border-white"
                onClick={() => handleTextureClick(texture)}
              >
                <svg
                  ref={svgRef} // Attach the ref to the SVG element
                  width="40"
                  height="40"
                >
                  <rect
                    x="5"
                    y="5"
                    width="40"
                    height="40"
                    style={{
                      fill: texture.configuration
                        .id(texture.id + sanitizeClassName(key))
                        .url(),
                    }}
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
