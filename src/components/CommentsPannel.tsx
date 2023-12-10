import React, { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import Input from "./Input";
import { LabelButton } from "./shared/Button";
import { useTranslation } from "react-i18next";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/state";
import {
  CommentsType,
  addComment,
  saveCommentDataThunk,
  updateComment,
  updateCommentById,
} from "src/state/slices/graphSlice";
import { getCurrentUser } from "src/Services/AuthService";
import { getAuth } from "firebase/auth";
import { useAuth } from "src/context/UserContext";
import { uniqueId } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { saveComment } from "src/Services/CommentService";

function CommentsPannel({
  onSubmit,
  handleClose,
  editComment,
  yPosition,
}: any) {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const { t } = useTranslation();
  const { user } = useAuth();
  const commentsData = useSelector((state: RootState) => state.graph.comments);
  const projectId = useSelector((state: RootState) => state.graph.id);

  const initialValues: CommentsType = {
    commentText: "",
    pk: 0,
    userId: user?.id!,
    start: new Date(yPosition),
    projectId: projectId,
  };
  const [formikInitialState, setFormikInitialState] = useState(
    editComment ?? initialValues
  );

  useEffect(() => {
    if (editComment?.idNew) {
      const exxistComment = commentsData?.filter(
        (x) => x.idNew === editComment.idNew
      )[0];
      if (exxistComment) {
        setFormikInitialState(exxistComment);
      }
    }
  }, [editComment, commentsData]);

  const handleSubmitData = (values: CommentsType, validateForm?: any) => {
    if (editComment?.idNew) {
      dispatch(
        updateCommentById({
          comment: values,
        })
      );
    } else {
      values = { ...values, idNew: uuidv4() };
      dispatch(
        addComment({
          comment: values,
        })
      );
    }

    dispatch(saveCommentDataThunk(values));

    onSubmit(values);
  };
  return (
    <div className="fixed left-0 top-0 z-50 flex  w-full h-full  items-center justify-center bg-white bg-opacity-20 dark:bg-gray-700 dark:bg-opacity-20">
      <div className="  max-h-full w-[60%] md:w-[30%] overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="mb-4 text-2xl font-semibold">
          {t("Comments.addComments")}
        </div>

        <Formik
          initialValues={formikInitialState}
          onSubmit={handleSubmitData}
          enableReinitialize={true}
        >
          {({
            values,
            errors,
            handleChange,
            setFieldValue,
            handleSubmit,
            isValid,
          }) => (
            <Form>
              <div className="mb-2">
                <Input
                  id="pk"
                  type="text"
                  name="pk"
                  label={t("Comments.pk")}
                  onChange={handleChange}
                  value={values.pk}
                  errors={errors}
                />
              </div>
              <div className="mb-2">
                <Input
                  id="commentText"
                  type="text"
                  name="commentText"
                  label={t("Comments.commentText")}
                  onChange={handleChange}
                  value={values.commentText}
                  errors={errors}
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  //   disabled={!isValid}
                  className="  mb-4 mr-2 rounded-lg border border-primary-700 px-5 py-2.5 text-center text-sm font-medium text-primary-700 hover:bg-primary-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:text-white dark:focus:ring-primary-800 "
                >
                  {t("activityForm.save")}
                </button>

                <LabelButton type="button" onClick={handleClose}>
                  {t("activityForm.cancel")}
                </LabelButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default CommentsPannel;
