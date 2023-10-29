import React, { useCallback, useEffect, useRef, useState } from "react";
import useClickOutside from "../hooks/useClickOutside";
import texturesData, { TextureData } from "../const/texturesArray";
import * as d3 from "d3";

export interface ITexturePickerProps {
  rowId: string;
  onSelectTexture: any;
  texturetype: TextureData;
  color?: string;
  label?: string;
  id?: string;
  className?: string;
  width?: number;
  height?: number;
}

const TexturePicker = ({
  rowId: key,
  color,
  onSelectTexture,
  texturetype,
  label,
  id,
  className,
  height = 40,
  width = 40,
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
    console.log("ti ham been called ", color);

    // Access the SVG element using the ref
    const svg = d3.select(svgRef.current);
    svg.selectAll(`${".svg-" + sanitizeClassName(key.trim())}`).remove();

    // Continue with your D3 operations on 'svg'
    const texture = selectedTexture.configuration
      .id(selectedTexture.id + sanitizeClassName(key))
      .stroke(color);
    svg.call(texture);

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
    <div className="relative " ref={popover} key={key}>
      {label && (
        <label
          htmlFor={id}
          className={`
        mb-2 block  text-sm font-medium text-gray-900 dark:text-white     
        `}
        >
          {label}
        </label>
      )}
      {/* Assign ref to the SVG element */}
      <div
        className="cursor-pointer flex justify-center items-center rounded-lg border-[3px] border-solid border-transparent  dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        onClick={() => setIsOpen(true)}
      >
        <svg
          ref={svgRef} // Attach the ref to the SVG element
          className={".svg-" + sanitizeClassName(key.trim())}
          width={width}
          height={height}
        >
          <rect
            x="5"
            y="5"
            width={width}
            height={height}
            style={{
              fill: selectedTexture.configuration
                .id(selectedTexture.id + sanitizeClassName(key))
                .url(),
            }}
          />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-20 max-h-40 overflow-y-auto shadow-[0_6px_12px_rgba(0,0,0,0.15)] rounded-[9px] left-0 top-[calc(100%_+_2px)] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
          <div className="grid grid-cols-3  gap-4 px-4  justify-start bg-white p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
            {texturesData.map((texture) => (
              <div
                key={texture.id + sanitizeClassName(key)}
                className="cursor-pointer rounded-lg border-[3px] border-solid border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                onClick={() => handleTextureClick(texture)}
              >
                <svg
                  ref={svgRef} // Attach the ref to the SVG element
                  width={40}
                  height={40}
                >
                  <rect
                    x="5"
                    y="5"
                    width={40}
                    height={40}
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
