//@ts-nocheck
import React, { useEffect, useState } from "react";
import TaskSlotsPopUp from "./TaskSlotsPopUp";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../state";
import {
  Plan,
  ProjectOption,
  TaskSlot,
  fetchAllStyleByProjectId,
  fetchAllTaskSlotByProjectId,
  updatePlansValue,
} from "../state/slices/graphSlice";
import { MultiStepFormProps } from "./DrawGraphForm";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/context/UserContext";
import { DocumentDuplicateIcon } from "@heroicons/react/24/solid";
import Dropdown from "./DropDown";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import PlansPopUp from "./PlansPopUp";

const PlansList = ({ setCurrentStep, currentStep }: MultiStepFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<Plan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { t } = useTranslation();
  const { user, canWrite, isAdmin } = useAuth();
  const [selectedProject, setSelectedProject] = useState("");
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const projectOptions: ProjectOption[] | undefined = useSelector(
    (state: RootState) => state.graph.projectOptions
  );
  const navigate = useNavigate();
  const plans: Plan[] = useSelector((state: RootState) => state.graph.plans);

  const { id } = useParams();
  const [formFieldValues, setFormFieldValues] = useState<Plan[]>([]);

  useEffect(() => {
    setFormFieldValues(plans ?? []);
  }, [plans]);

  const minDistance: number = useSelector(
    (state: RootState) => state.graph.settings.fromDistance
  );
  const maxDistance: number = useSelector(
    (state: RootState) => state.graph.settings.toDistance
  );

  const handleAddClick = () => {
    setIsNew(true);
    setIsModalOpen(true);
  };

  const handleEditClick = (row: Plan) => {
    console.log("🚀 ~ handleEditClick ~ row:", row);
    setEditRow(row);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (rowId: string) => {
    // Find the index of the row to be deleted
    const rowIndex = formFieldValues.findIndex((row) => row.idnew === rowId);

    if (rowIndex !== -1) {
      // Create a copy of the task slots array without the deleted row
      const updatedTaskSlots = [
        ...formFieldValues.slice(0, rowIndex),
        ...formFieldValues.slice(rowIndex + 1),
      ];

      // Update the state with the new task slots list
      setFormFieldValues(updatedTaskSlots);

      // // Dispatch the updated task slots to your Redux store
      dispatch(
        updatePlansValue({
          plans: updatedTaskSlots,
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

  const handleAddPlan = (data: Plan) => {
    const newPlan: Plan = {
      idnew: uuidv4(),
      name: data.name,
      startPk: data.startPk,
      endPk: data.endPk,
      planImageId: data.planImageId,
      planImageUrl: data.planImageUrl,
    };
    const updatedPlans = [...formFieldValues, newPlan];
    setFormFieldValues(updatedPlans);
    dispatch(
      updatePlansValue({
        plans: updatedPlans,
      })
    );
    closeModal();
  };

  const handleEditPlan = (data: Plan) => {
    const updatedPlans = formFieldValues.map((plan) =>
      plan.id
        ? plan.id === data.id
          ? { ...plan, ...data }
          : plan
        : plan.idnew === data.idnew
        ? { ...plan, ...data }
        : plan
    );
    setFormFieldValues(updatedPlans);
    dispatch(
      updatePlansValue({
        plans: updatedPlans,
      })
    );
    closeModal();
  };

  const handleGoToDraw = () => {
    // update the store
    dispatch(
      updatePlansValue({
        plans: formFieldValues,
      })
    );
    // navigate("/graph");
    if (id) {
      navigate(`/graph/${id}`);
    } else {
      navigate(`/graph`);
    }
  };
  return (
    <div className="h-[100vh]">
      {!id && (
        <div className="flex w-full justify-center items-center gap-5">
          <Dropdown
            id="projectId"
            name="projectId"
            label={t("projectForm.project")}
            labelClassName="w-[40%]"
            onChange={(e) => {
              setSelectedProject(e.currentTarget.value);
            }}
            value={selectedProject}
            optionValue="id"
            optionLabel="label"
            className="  rounded-lg border border-gray-300 bg-gray-50  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            options={projectOptions ?? []}
          />
          <button
            className="focus:outline-none mt-10  text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 flex items-center"
            onClick={() => {
              dispatch(
                fetchAllTaskSlotByProjectId({
                  projectId: selectedProject,
                  level: 1,
                })
              );
            }}
          >
            <span className="mr-2">
              <DocumentDuplicateIcon className="w-4 h-4" />
            </span>
            {t("projectSelection.copy")}
          </button>
        </div>
      )}
      <div className="my-4 flex justify-start items-start   ">
        <button
          disabled={!canWrite && !isAdmin}
          onClick={handleAddClick}
          className=" text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
        >
          {t("taskSlotsList.addButton")}
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200 dark:text-gray-400">
        <thead>
          <tr>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("plansList.tableHeaders.name")}
            </th>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("plansList.tableHeaders.start")}
            </th>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("plansList.tableHeaders.end")}
            </th>
            <th className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("plansList.tableHeaders.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {formFieldValues?.map((row) => (
            <tr key={row.id}>
              <td className="whitespace-nowrap px-6 py-4">{row.name}</td>
              <td className="whitespace-nowrap px-6 py-4">{row.startPk}</td>
              <td className="whitespace-nowrap px-6 py-4">{row.endPk}</td>

              <td className="whitespace-nowrap px-6 py-4">
                <button
                  className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={() => handleEditClick(row)}
                  disabled={!canWrite && !isAdmin}
                >
                  {t("taskSlotsList.buttons.edit")}
                </button>
                <button
                  className="focus:outline-none text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                  onClick={() => handleDeleteClick(row.idnew!)}
                  disabled={!canWrite && !isAdmin}
                >
                  {t("taskSlotsList.buttons.delete")}
                </button>

                <button
                  className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  onClick={() => handleEditClick(row)}
                  disabled={!canWrite && !isAdmin}
                >
                  {t("plansList.buttons.planDraw")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <PlansPopUp
          isNew={isNew}
          editRow={editRow}
          closeModal={closeModal}
          handleAddPlan={handleAddPlan}
          handleEditPlan={handleEditPlan}
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

export default PlansList;
