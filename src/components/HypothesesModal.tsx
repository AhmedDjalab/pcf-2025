import React, { useState, useEffect } from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { RootState } from "src/state";
// Replace with your actual slice
import Input from "./Input";
import { LabelButton } from "./shared/Button";
import { addHypothesis } from "src/state/slices/graphSlice";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface HypothesisModalProps {
  hypothesisDescriptions?: string;
  onSubmit: (values: { hypothesisDescriptions: string }) => void;
  handleClose: () => void;
}

const HypothesisModal: React.FC<HypothesisModalProps> = ({
  hypothesisDescriptions,
  onSubmit,
  handleClose,
}) => {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );

  useEffect(() => {
    console.log(
      "🚀 ~ useEffect ~ hypothesisDescriptions:",
      hypothesisDescriptions
    );
    if (hypothesisDescriptions) {
      console.log(
        "🚀 ~ useEffect ~ hypothesisDescriptions:",
        hypothesisDescriptions
      );
      const blocksFromHtml = htmlToDraft(hypothesisDescriptions);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(
        contentBlocks,
        entityMap
      );
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [hypothesisDescriptions]);

  const validationSchema = Yup.object().shape({});

  const handleSubmitData = (
    values: { hypothesisDescriptions: string },
    { setSubmitting }: FormikHelpers<{ hypothesisDescriptions: string }>
  ) => {
    const hypothesisDescriptions = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );
    const formValues = { hypothesisDescriptions };
    dispatch(addHypothesis(formValues)); // Replace with your actual action
    onSubmit(formValues);
    setSubmitting(false);
    handleClose();
  };

  const toolbarOptions = {
    options: ["colorPicker", "fontFamily", "inline", "textAlign"],
    inline: {
      className: undefined,
    },
    textAlign: {
      className: undefined,
    },
    fontFamily: {
      className: undefined,
      dropdownClassName: undefined,
      default: "Arial",
    },
    colorPicker: {
      className: undefined,
      component: undefined,
      popupClassName: undefined,
      colors: [
        "rgb(97,189,109)",
        "rgb(26,188,156)",
        "rgb(84,172,210)",
        "rgb(44,130,201)",
        "rgb(147,101,184)",
        "rgb(71,85,119)",
        "rgb(204,204,204)",
        "rgb(65,168,95)",
        "rgb(0,168,133)",
        "rgb(61,142,185)",
        "rgb(41,105,176)",
        "rgb(85,57,130)",
        "rgb(40,50,78)",
        "rgb(0,0,0)",
        "rgb(247,218,100)",
        "rgb(251,160,38)",
        "rgb(235,107,86)",
        "rgb(226,80,65)",
        "rgb(163,143,132)",
        "rgb(239,239,239)",
        "rgb(255,255,255)",
        "rgb(250,197,28)",
        "rgb(243,121,52)",
        "rgb(209,72,65)",
        "rgb(184,49,47)",
        "rgb(124,112,107)",
        "rgb(209,213,216)",
      ],
    },
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-white bg-opacity-20 dark:bg-gray-700 dark:bg-opacity-20">
      <div className="mt-20 max-h-full w-[50%] text-boxdark dark:text-white overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="mb-4 text-2xl font-semibold">
          {t("hypothesisModal.title")}
        </div>
        <Formik
          initialValues={{
            hypothesisDescriptions: hypothesisDescriptions || "",
          }}
          onSubmit={handleSubmitData}
          validationSchema={validationSchema}
          enableReinitialize
        >
          {({ values, errors, handleChange, handleSubmit, isSubmitting }) => (
            <Form>
              <div className="mb-4 relative min-h-[250px] w-full inline-block">
                <label>{t("hypothesisModal.hypothesisDescriptions")}</label>
                <Editor
                  editorState={editorState}
                  toolbarClassName="toolbarClassName"
                  wrapperClassName="wrapperClassName"
                  editorClassName="editorClassName"
                  onEditorStateChange={setEditorState}
                  toolbar={toolbarOptions}
                />
                {errors.hypothesisDescriptions && (
                  <div className="text-red-500 text-sm">
                    {errors.hypothesisDescriptions}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <LabelButton type="button" onClick={handleClose}>
                  {t("hypothesisModal.cancel")}
                </LabelButton>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className=" mt-5 bg-blue-400 text-white 
                  hover:bg-blue-500 focus:outline-none 
                  focus:ring focus:ring-gray-300 disabled:bg-blue-600 
                  font-medium rounded-lg text-sm px-5 py-2.5 mb-2 "
                >
                  {t("hypothesisModal.save")}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default HypothesisModal;
