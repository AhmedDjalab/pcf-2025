import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; // Import Yup for validation
import { RootState } from "../state"; // Import RootState type
import { useSelector } from "react-redux"; // Import useSelector

interface TaskSlotsPopUpProps {
  isNew: boolean;
  editRow: {
    name: string;
    start: number;
    end: number;
    id: string;
  } | null;
  closeModal: () => void;
  handleAddTaskSlot: (values: any) => void;
  handleEditTaskSlot: (values: any) => void;
}

const TaskSlotsPopUp: React.FC<TaskSlotsPopUpProps> = ({
  isNew,
  editRow,
  closeModal,
  handleAddTaskSlot,
  handleEditTaskSlot,
}) => {
  const minDistance: number = useSelector(
    (state: RootState) => state.settings.fromDistance
  );
  const maxDistance: number = useSelector(
    (state: RootState) => state.settings.toDistance
  );

  const initialValues = {
    name: isNew ? "" : editRow!.name,
    start: isNew ? "" : editRow!.start,
    end: isNew ? "" : editRow!.end,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Le nom est requis"),
    start: Yup.number()
      .required("Le début est requis")
      .min(minDistance, `Le début doit être supérieur ou égal à ${minDistance}`)
      .max(
        maxDistance,
        `Le début doit être inférieur ou égal à ${maxDistance}`
      ),
    end: Yup.number()
      .required("La fin est requise")
      .min(minDistance, `La fin doit être supérieure ou égale à ${minDistance}`)
      .max(
        maxDistance,
        `La fin doit être inférieure ou égale à ${maxDistance}`
      ),
  });

  const onSubmit = (values: any) => {
    // Handle form submission (add or edit)
    if (isNew) {
      handleAddTaskSlot(values);
    } else {
      handleEditTaskSlot({ ...values, id: editRow!.id });
    }

    closeModal();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-white bg-opacity-80">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <div className="text-2xl font-semibold mb-4">
          {isNew
            ? "Définissez les limites du tronçon ou de l’ouvrage"
            : " Modifier les limites du tronçon ou de l’ouvrage"}
        </div>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          {({
            values,
            errors,
            handleChange,
            handleSubmit,
            resetForm,
            isValid,
          }) => (
            <Form>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Nom:
                </label>
                <Field
                  type="text"
                  name="name"
                  className={`border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded p-2 w-full`}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 mt-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Pk de début:
                </label>
                <Field
                  type="number"
                  name="start"
                  className={`border ${
                    errors.start ? "border-red-500" : "border-gray-300"
                  } rounded p-2 w-full`}
                />
                <ErrorMessage
                  name="start"
                  component="div"
                  className="text-red-500 mt-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Pk de fin:
                </label>
                <Field
                  type="number"
                  name="end"
                  className={`border ${
                    errors.end ? "border-red-500" : "border-gray-300"
                  } rounded p-2 w-full`}
                />
                <ErrorMessage
                  name="end"
                  component="div"
                  className="text-red-500 mt-2"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!isValid}
                  className="bg-blue-500 text-white rounded px-4 py-2 mr-2 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                >
                  {isNew ? "Ajouter" : "Sauvegarder"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-600 rounded px-4 py-2 hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300"
                >
                  Quitter
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default TaskSlotsPopUp;
