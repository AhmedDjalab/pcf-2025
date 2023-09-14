import React, { useState } from "react";
import TaskSlotsPopUp from "./TaskSlotsPopUp";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../state";
import { TaskSlot, updateTaskSlotsValue } from "../state/slices/graphSlice";
import { MultiStepFormProps } from "./DrawGraphForm";
import { v4 as uuidv4 } from "uuid";

const TaskSlotsList = ({ setCurrentStep, currentStep }: MultiStepFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<TaskSlot | null>(null);
  const [isNew, setIsNew] = useState(false);
  const taskSlots: TaskSlot[] = useSelector(
    (state: RootState) => state.graph.taskSlots
  );
  const [formFieldValues, setFormFieldValues] = useState(taskSlots);

  const minDistance: number = useSelector(
    (state: RootState) => state.graph.settings.fromDistance
  );
  const maxDistance: number = useSelector(
    (state: RootState) => state.graph.settings.toDistance
  );
  const dispatch = useDispatch();

  const handleAddClick = () => {
    setIsNew(true);
    setIsModalOpen(true);
  };

  const handleEditClick = (row: any) => {
    setEditRow(row);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (rowId: string) => {
    // Find the index of the row to be deleted
    const rowIndex = formFieldValues.findIndex((row) => row.id === rowId);

    if (rowIndex !== -1) {
      // Create a copy of the task slots array without the deleted row
      const updatedTaskSlots = [
        ...formFieldValues.slice(0, rowIndex),
        ...formFieldValues.slice(rowIndex + 1),
      ];

      // Update the state with the new task slots list
      setFormFieldValues(updatedTaskSlots);

      // // Dispatch the updated task slots to your Redux store
      // dispatch(
      //   updateTaskSlotsValue({
      //     taskSlots: updatedTaskSlots,
      //   })
      // );
    }

    // Close the modal (if it's open)
    //closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditRow(null);
  };

  const handleAddTaskSlot = (data: TaskSlot) => {
    const newTask = {
      id: uuidv4(),
      name: data.name,
      start: data.start,
      end: data.end,
    };
    const updatedTaskSlots = [...formFieldValues, newTask];
    setFormFieldValues(updatedTaskSlots);
    // dispatch(
    //   updateTaskSlotsValue({
    //     taskSlots: updatedTaskSlots,
    //   })
    // );
    closeModal();
  };

  const handleEditTaskSlot = (data: TaskSlot) => {
    console.log(
      "🚀 ~ file: TaskSlotsStep.tsx:86 ~ handleEditTaskSlot ~ data:",
      data
    );
    const updatedTaskSlots = formFieldValues.map((taskSlot) =>
      taskSlot.id === data.id ? { ...taskSlot, ...data } : taskSlot
    );
    setFormFieldValues(updatedTaskSlots);
    // dispatch(
    //   updateTaskSlotsValue({
    //     taskSlots: updatedTaskSlots,
    //   })
    // );
    closeModal();
  };

  const handleGoToDraw = () => {
    // update the store
    dispatch(
      updateTaskSlotsValue({
        taskSlots: formFieldValues,
      })
    );
    setCurrentStep(currentStep + 1);
  };
  return (
    <div>
      <button onClick={handleAddClick}>Add</button>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Start
            </th>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              End
            </th>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {formFieldValues.map((row) => (
            <tr key={row.id}>
              <td className="whitespace-nowrap px-6 py-4">{row.name}</td>
              <td className="whitespace-nowrap px-6 py-4">{row.start}</td>
              <td className="whitespace-nowrap px-6 py-4">{row.end}</td>
              <td className="whitespace-nowrap px-6 py-4">
                <button onClick={() => handleEditClick(row)}>Edit</button>
                <button onClick={() => handleDeleteClick(row.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <TaskSlotsPopUp
          isNew={isNew}
          editRow={editRow}
          closeModal={closeModal}
          handleAddTaskSlot={handleAddTaskSlot}
          handleEditTaskSlot={handleEditTaskSlot}
        />
      )}
      <div className="my-4 flex justify-end">
        <button
          type="button"
          onClick={handleGoToDraw}
          className="px-4 py-2 bg-blue-500
               text-white rounded-lg
                hover:bg-blue-600
                 focus:outline-none focus:ring
                  focus:ring-blue-300
                   disabled:bg-gray-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TaskSlotsList;
