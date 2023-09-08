import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTable, useRowSelect, usePagination, useSortBy } from "react-table";
import { RootState } from "../state";
import { ShapeType } from "../state/slices/graphSlice";
import { CirclePicker } from "react-colorful";

// Import the ShapeType interface

function ShapesForm({}: MultiStepFormProps) {
  const graphSettings = useSelector((state: RootState) => state.graph.settings);
  const dispatch = useDispatch();

  // Define the table columns based on ShapeType
  const uniqueStyles = useMemo(() => {
    const styles = new Set<string>();
    graphSettings.graphData.forEach((data) => {
      styles.add(data.style);
    });
    return Array.from(styles);
  }, [graphSettings.graphData]);

  const [shapesList, setShapesList] = useState<ShapeType[]>(
    uniqueStyles.map((style) => ({
      type: "line",
      backgroundTexture: "",
      color: "",
      name: style,
      Id: "",
    }))
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Type",
        accessor: "type",
      },
      {
        Header: "Background Texture",
        accessor: "backgroundTexture",
        Cell: ({ row }) => (
          <TexturePicker
            value={row.original.backgroundTexture}
            onChange={(value) => handleTextureChange(row, value)}
          />
        ),
      },
      {
        Header: "Color",
        accessor: "color",
        Cell: ({ row }) => {
          const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
          const [currentColor, setCurrentColor] = useState(row.original.color);

          return (
            <div
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              style={{ cursor: "pointer" }}
            >
              {isColorPickerOpen ? (
                <CirclePicker
                  color={currentColor}
                  onChange={(selectedColor: any) => {
                    setCurrentColor(selectedColor.hex);
                    setIsColorPickerOpen(false);
                  }}
                />
              ) : (
                <span>{currentColor}</span>
              )}
            </div>
          );
        },
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <input
            type="text"
            value={row.original.name}
            onChange={(e) => handleNameChange(row, e.target.value)}
          />
        ),
      },
    ],
    []
  );

  // Create a table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data: shapesList,
      initialState: { pageSize: 10 }, // Set your initial state here
    },
    useSortBy,
    usePagination,
    useRowSelect
  );

  // Handle changes for texture selection
  const handleTextureChange = (row, value) => {
    // Implement your logic to update the selected row's background texture
  };

  // Handle changes for color selection
  const handleColorChange = (row, value) => {
    // Implement your logic to update the selected row's color
  };

  // Handle changes for name input
  const handleNameChange = (row, value) => {
    // Implement your logic to update the selected row's name
  };

  return (
    <div>
      <table {...getTableProps()} className="your-table-styles">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="your-header-cell-styles"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="your-row-styles">
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()} className="your-cell-styles">
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ShapesForm;
