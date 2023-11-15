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
import texturesData from "../const/texturesArray";
import { lineStyles } from "../const/linesArray";
import LineStylePicker from "./LineStylePicker";
import { animateScroll as scroll } from "react-scroll";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { BackToTopHeightSize } from "../const/vars";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/context/UserContext";
// Import the ShapeType interface
const shapeTypes = [
  { value: "line", text: "Ligne" },
  { value: "rect", text: "Rectangle" },
  { value: "triangle", text: "Triangle" },
];
type LineType = "line" | "rect" | "triangle";
function ShapesForm({ setCurrentStep, currentStep }: MultiStepFormProps) {
  const { user, canWrite, isAdmin } = useAuth();

  const graphSettings = useSelector((state: RootState) => state.shapes);
  const dispatch = useDispatch();
  const [rowColors, setRowColors] = useState<{ [key: string]: string }>({});
  const [showBackToTopButton, setShowBackToTopButton] = useState(false);
  const { t } = useTranslation();

  // Define the table columns based on ShapeType
  useEffect(() => {
    const handleScroll = () => {
      // Check the scroll position, e.g., if the user scrolls down by 100 pixels, show the button
      if (window.scrollY > BackToTopHeightSize) {
        setShowBackToTopButton(true);
      } else {
        setShowBackToTopButton(false);
      }
    };

    // Add the scroll event listener when the component mounts
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const [shapesList, setShapesList] = useState<ShapeType[]>(
    graphSettings.shapesData
  );

  const columns: Column<ShapeType>[] = React.useMemo(
    () => [
      {
        Header: t("shapesForm.headers.formatStyle"),
        accessor: "type",
        Cell: ({ row }) => {
          const handleTypeChange = (newType: LineType) => {
            // Update the underlying data (shapesList) with the new type
            let clonedShapes = [...shapesList];
            const updatedShapesList = clonedShapes.map((shape) => {
              if (shape.id === row.original["id"]) {
                return { ...shape, type: newType };
              }
              return shape;
            });
            setShapesList(updatedShapesList);
          };

          return (
            <select
              value={row.values["type"]}
              disabled={!canWrite && !isAdmin}
              className=" rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              onChange={(e) => handleTypeChange(e.target.value as LineType)}
            >
              {shapeTypes.map(({ value, text }) => (
                <option key={value} value={value}>
                  {t(`shapesForm.${text}`)}
                </option>
              ))}
            </select>
          );
        },
      },

      {
        Header: t("shapesForm.headers.lineType"),
        accessor: "lineType",
        Cell: ({ row }) => {
          const handleTypeChange = (newType: string) => {
            // Update the underlying data (shapesList) with the new type
            let clonedShapes = [...shapesList];
            const updatedShapesList = clonedShapes.map((shape) => {
              if (shape.id === row.original["id"]) {
                return { ...shape, lineType: newType };
              }
              return shape;
            });
            setShapesList((prev) => (prev = updatedShapesList));
          };
          let lineType = lineStyles.find(
            (x) => x.id === row.values["lineType"]
          )!;

          return (
            <LineStylePicker
              rowId={row["id"]}
              color={row.original["color"]}
              lineStyles={lineStyles}
              onSelectLineStyle={handleTypeChange}
              selectedLineStyle={lineType ?? lineStyles[0]}
            />
          );
        },
      },
      {
        Header: t("shapesForm.headers.rectangleTriangleType"),
        accessor: "backgroundTexture",
        Cell: ({ row }) => {
          const handleTextureChange = (newTexture: string) => {
            // Update the underlying data (shapesList) with the new color

            let clonesShapes = [...shapesList];
            const updatedShapesList = clonesShapes.map((shape) => {
              if (shape.id === row.original["id"]) {
                return { ...shape, backgroundTexture: newTexture };
              }
              return shape;
            });
            setShapesList((prev) => (prev = updatedShapesList));
          };

          let rowTexture = texturesData.find(
            (x) => x.id === row.values["backgroundTexture"]
          )!;
          return (
            <TexturePicker
              rowId={row.original["id"]}
              color={row.values["color"]}
              texturetype={rowTexture}
              onSelectTexture={handleTextureChange}
            />
          );
        },
      },
      {
        Header: t("shapesForm.headers.color"),
        accessor: "color",
        Cell: ({ row }) => {
          const [isOpen, toggle] = useState(false);
          const [currentColor, setCurrentColor] = useState(row.values["color"]);
          const handleColorChange = (newColor: string) => {
            setCurrentColor(newColor);
            setShapesList((prevShapesList) => {
              return prevShapesList.map((shape) => {
                if (shape.id === row.original["id"]) {
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
        Header: t("shapesForm.headers.styleName"),
        accessor: "name",
        Cell: ({ row }) => (
          <input
            type="text"
            className=" rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            value={row.values["name"]}
            onChange={(e) => handleNameChange(row, e.target.value)}
          />
        ),
      },
    ],
    [shapesList, t]
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
  const handleNameChange = (row: Row<ShapeType>, value: string) => {
    // Implement your logic to update the selected row's name
  };

  return (
    <div className="relative h-[100vh]  overflow-x-auto">
      <div className="my-4 flex justify-between ">
        <button
          type="button"
          onClick={() => setCurrentStep(currentStep - 1)} // Handle going back to the previous step
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300 disabled:bg-gray-600"
        >
          {t("shapesForm.backButton")}
        </button>
        <button
          type="button"
          onClick={handleGoToDraw}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-600"
        >
          {t("shapesForm.nextButton")}
        </button>
      </div>
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
                  className="group text-center px-6 py-3  text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          {...getTableBodyProps()}
          className="divide-y divide-gray-200  bg-white dark:border-gray-700 dark:bg-boxdark-2 dark:text-bodydark   "
        >
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      className="whitespace-nowrap px-6 py-4 text-center "
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
      {showBackToTopButton && (
        <button
          type="button"
          className="back-to-top-button flex justify-end items-end self-end w-full"
          onClick={() => {
            scroll.scrollToTop(); // Scroll to the top when the button is clicked
          }}
        >
          <ArrowUpCircleIcon className=" h-20 w-20  text-blue-500 opacity-40" />{" "}
          {/* Use the Heroicon here */}
        </button>
      )}
      {/* <div className="my-4 flex justify-end ">
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
          Next
        </button>
      </div> */}
    </div>
  );
}

export default ShapesForm;
