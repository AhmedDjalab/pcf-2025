import React, { useState } from "react";
import TaskSlotsPopUp from "./TaskSlotsPopUp";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../state";
import {
  TaskSlot,
  saveProjectThunk,
  updateTaskSlotsLevelTwoValue,
  updateTaskSlotsValue,
} from "../state/slices/graphSlice";
import { MultiStepFormProps } from "./DrawGraphForm";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useAuth } from "src/context/UserContext";

const TaskSlotsLevelTwoList = ({
  setCurrentStep,
  currentStep,
}: MultiStepFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<TaskSlot | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const taskSlots: TaskSlot[] = useSelector(
    (state: RootState) => state.graph.taskSlotsLevelTwo
  );

  const { canWrite, isAdmin } = useAuth();

  const [formFieldValues, setFormFieldValues] = useState(taskSlots);

  const minDistance: number = useSelector(
    (state: RootState) => state.graph.settings.fromDistance
  );
  const maxDistance: number = useSelector(
    (state: RootState) => state.graph.settings.toDistance
  );
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();

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
    console.log("thisid ispates errror ", rowIndex);
    if (rowIndex !== -1) {
      // Create a copy of the task slots array without the deleted row
      const updatedTaskSlots = [
        ...formFieldValues.slice(0, rowIndex),
        ...formFieldValues.slice(rowIndex + 1),
      ];

      // Update the state with the new task slots list
      setFormFieldValues(updatedTaskSlots);
      console.log("thisid ispates errror ");
      // // Dispatch the updated task slots to your Redux store
      dispatch(
        updateTaskSlotsLevelTwoValue({
          taskSlotsLevelTwo: updatedTaskSlots,
        })
      );
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
      idnew: uuidv4(),
      name: data.name,
      start: data.start,
      end: data.end,
    };
    const updatedTaskSlots = [...formFieldValues, newTask];
    setFormFieldValues(updatedTaskSlots);
    dispatch(
      updateTaskSlotsLevelTwoValue({
        taskSlotsLevelTwo: updatedTaskSlots,
      })
    );
    closeModal();
  };

  const handleEditTaskSlot = (data: TaskSlot) => {
    const updatedTaskSlots = formFieldValues.map((taskSlot) =>
      taskSlot.idnew === data.idnew ? { ...taskSlot, ...data } : taskSlot
    );
    setFormFieldValues(updatedTaskSlots);
    dispatch(
      updateTaskSlotsLevelTwoValue({
        taskSlotsLevelTwo: updatedTaskSlots,
      })
    );
    closeModal();
  };

  const handleGoToDraw = () => {
    // update the store
    dispatch(
      updateTaskSlotsLevelTwoValue({
        taskSlotsLevelTwo: formFieldValues,
      })
    );
    if (id) {
      navigate(`/graph/${id}`);
    } else {
      navigate(`/graph`);
    }

    // setCurrentStep(currentStep + 1);
  };
  return (
    <div className="h-[100vh]">
      <button
        disabled={!canWrite && !isAdmin}
        onClick={handleAddClick}
        className=" text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
      >
        {t("taskSlotsList.addButton")}
      </button>

      <table className="min-w-full divide-y divide-gray-200 dark:text-gray-400">
        <thead>
          <tr>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("taskSlotsList.tableHeaders.name")}
            </th>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("taskSlotsList.tableHeaders.start")}
            </th>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("taskSlotsList.tableHeaders.end")}
            </th>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("taskSlotsList.tableHeaders.actions")}
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
                <button
                  disabled={!canWrite && !isAdmin}
                  className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={() => handleEditClick(row)}
                >
                  {t("taskSlotsList.buttons.edit")}
                </button>
                <button
                  disabled={!canWrite && !isAdmin}
                  className="focus:outline-none text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                  onClick={() => handleDeleteClick(row.idnew)}
                >
                  {t("taskSlotsList.buttons.delete")}
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
      <div className="my-4 flex justify-between">
        <button
          onClick={() => setCurrentStep(currentStep - 1)} // Handle going back to the previous step
          className=" text-white bg-gray-400 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
        >
          {t("taskSlotsList.buttons.back")}
        </button>
        <button
          type="button"
          onClick={handleGoToDraw}
          className=" px-5 py-2.5 mr-2 mb-2 bg-blue-500
               text-white rounded-lg
                hover:bg-blue-600
                 focus:outline-none focus:ring
                  focus:ring-blue-300
                   disabled:bg-gray-600"
        >
          {t("taskSlotsList.buttons.showPlanning")}
        </button>
      </div>
    </div>
  );
};

export default TaskSlotsLevelTwoList;
