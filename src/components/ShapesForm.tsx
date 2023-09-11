import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useTable,
  useRowSelect,
  usePagination,
  useSortBy,
  Column,
  Row,
} from "react-table";
import { RootState } from "../state";
import { ShapeType, updateShapesValue } from "../state/slices/graphSlice";
import CirclePicker, { HexColorPicker } from "react-colorful";
import { MultiStepFormProps } from "./DrawGraphForm";
import { PopoverColorPicker } from "./PopoverColorPicker";
import * as d3 from "d3";
import textures from "textures";
import TexturePicker from "./TexturePicker";
import TextureDrawing from "./TexturePicker";

// Import the ShapeType interface
const shapeTypes = ["line", "rect", "triangle"];
type LineType = "line" | "rect" | "triangle";
function ShapesForm({ setCurrentStep, currentStep }: MultiStepFormProps) {
  const graphSettings = useSelector((state: RootState) => state.graph.shapes);
  const dispatch = useDispatch();

  // Define the table columns based on ShapeType

  const [shapesList, setShapesList] = useState<ShapeType[]>(
    graphSettings.shapesData
  );

  const columns: Column[] = React.useMemo(
    () => [
      {
        Header: "Type",
        accessor: "type",
        Cell: ({ row }) => {
          const handleTypeChange = (newType: LineType) => {
            // Update the underlying data (shapesList) with the new type
            let clonedShapes = [...shapesList];
            const updatedShapesList = clonedShapes.map((shape) => {
              if (shape.id === row.id) {
                return { ...shape, type: newType };
              }
              return shape;
            });
            setShapesList(updatedShapesList);
          };

          return (
            <select
              value={row.values["type"]}
              onChange={(e) => handleTypeChange(e.target.value as LineType)}
            >
              {shapeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        Header: "Background Texture",
        accessor: "backgroundTexture",
        Cell: ({ row }) => {
          const handleTextureChange = (newTexture: string) => {
            // Update the underlying data (shapesList) with the new color
            let clonesShapes = [...shapesList];
            const updatedShapesList = clonesShapes.map((shape) => {
              if (shape.id === row.id) {
                return { ...shape, backgroundTexture: newTexture };
              }
              return shape;
            });
            setShapesList((prev) => (prev = updatedShapesList));
          };
          return (
            <TexturePicker
              texturetype={row.values["backgroundTexture"]}
              onSelectTexture={handleTextureChange}
            />
          );
        },
      },
      {
        Header: "Color",
        accessor: "color",
        Cell: ({ row }) => {
          const [isOpen, toggle] = useState(false);
          const [currentColor, setCurrentColor] = useState(row.values["color"]);
          const handleColorChange = (newColor: string) => {
            console.log(
              "🚀 ~ file: ShapesForm.tsx:96 ~ handleColorChange ~ newColor:",
              newColor
            );
            setCurrentColor(newColor);
            setShapesList((prevShapesList) => {
              return prevShapesList.map((shape) => {
                if (shape.id === row.id) {
                  return { ...shape, color: newColor };
                }
                return shape;
              });
            });
          };
          return (
            <PopoverColorPicker
              isOpen={isOpen}
              toggle={toggle}
              color={currentColor}
              onChangeComplete={handleColorChange}
            />
          );
        },
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <input
            type="text"
            value={row.values["name"]}
            onChange={(e) => handleNameChange(row, e.target.value)}
          />
        ),
      },
    ],
    [shapesList]
  );

  // Create a table instance
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: shapesList,
      },
      useSortBy,
      usePagination,
      useRowSelect
    );

  // Handle changes for texture selection
  const handleTextureChange = (row: Row, value: string) => {
    // Implement your logic to update the selected row's background texture
  };

  // Handle changes for color selection
  const handleGoToDraw = () => {
    dispatch(
      updateShapesValue({
        shapesForm: {
          shapesData: shapesList,
        },
      })
    );
    setCurrentStep(currentStep + 1);
  };

  // Handle changes for name input
  const handleNameChange = (row: Row, value: string) => {
    // Implement your logic to update the selected row's name
  };

  return (
    <div>
      <table
        {...getTableProps()}
        className="min-w-full divide-y divide-gray-200"
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getHeaderProps())}
                  className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          {...getTableBodyProps()}
          className="divide-y divide-gray-200 bg-white dark:border-gray-700 dark:bg-boxdark-2 dark:text-bodydark   "
        >
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      className="whitespace-nowrap px-6 py-4"
                      role="cell"
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="my-4 flex justify-end ">
        <button
          type="button"
          onClick={handleGoToDraw}
          className="px-4 py-2 bg-blue-500
             text-white rounded-lg
              hover:bg-blue-600
               focus:outline-none focus:ring
                focus:ring-blue-300
                 disabled:bg-gray-600
                "
        >
          Draw
        </button>
      </div>
    </div>
  );
}

export default ShapesForm;
