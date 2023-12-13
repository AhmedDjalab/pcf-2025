import React, { useEffect, useMemo, useState } from "react";
import {
  GraphStringsSetting,
  ProjectFileType,
  getOptions,
  graphPrimaveraSettings,
  graphStringsMSProjectSettings,
  graphStringsSettings,
  graphStringsXLSXSettings,
} from "src/const/vars";
import Dropdown from "./DropDown";
import { LabelButton, PrimaryButton } from "./shared/Button";
import { useTranslation } from "react-i18next";
import { UdfSetting, updateUDFSettings } from "src/state/slices/graphSlice";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/state";
import { uniqueId } from "lodash";
import Spinner from "./Spinner";

export interface MsProjectOption {
  alias: string;
  fieldName: string;
  udfId: string;
}

interface ParameterSelectorProps {
  udfSettingString: string[] | MsProjectOption[];
  handleClose: () => void;
  onSubmit: (userColumnData: UdfSetting[]) => void;
}

function ParameterSelector({
  udfSettingString,
  handleClose,
  onSubmit,
}: ParameterSelectorProps) {
  const { t } = useTranslation();
  const [selectedPairs, setSelectedPairs] = useState<UdfSetting[]>([]);
  const [isSubmited, setIsSubmited] = useState(false);
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const udfSettingsData = useSelector(
    (state: RootState) => state.graph.userDefindSettings
  );
  const filetype = useSelector(
    (state: RootState) => state.graph.projectSettings.fileType
  );
  let udfStringsOptions = useMemo(
    () => getOptions(udfSettingString, filetype!),
    [filetype, udfSettingString]
  );

  // useEffect(() => {
  //   if (filetype === ProjectFileType.PrimaveraXML) {
  //     let selectedPairsClone = [...selectedPairs];
  //     selectedPairsClone.push(
  //       {
  //         pcfSettingName: "ID",
  //         udfSettingId: "1",
  //         udfSettingName: "ObjectId",
  //         pcfField: "id",
  //       },
  //       {
  //         pcfSettingName: "drawGraph.activityDetails.activityNameLabel",
  //         udfSettingId: "2",
  //         udfSettingName: "Name",
  //         pcfField: "activityName",
  //       },
  //       {
  //         pcfSettingName: "drawGraph.activityDetails.startDateLabel",
  //         udfSettingId: "3",
  //         udfSettingName: "StartDate",
  //         pcfField: "startDate",
  //       },
  //       {
  //         pcfSettingName: "drawGraph.activityDetails.finishDateLabel",
  //         udfSettingId: "4",
  //         udfSettingName: "FinishDate",
  //         pcfField: "finishDate",
  //       }
  //     );
  //     setSelectedPairs(selectedPairsClone);
  //   }
  // }, [filetype, selectedPairs]);

  const handleSelect = (
    selectable: GraphStringsSetting,
    selectedValue: string
  ) => {
    const existingPair = selectedPairs.find(
      (pair) => pair.udfSettingId === selectedValue.toString()
    );

    if (existingPair) {
      alert("please duplication is prohibited ");
      return;
    }
    const selectedOption = udfStringsOptions!.find(
      (x) => x.id === selectedValue
    );

    const updatedPairs = [...selectedPairs];
    // // Find the matching "Read-only String" based on the selectable value

    if (selectedOption) {
      updatedPairs.push({
        pcfSettingName: selectable.name,
        udfSettingId: selectedOption.id,
        udfSettingName: selectedOption.name,
        pcfField: selectable.field,
      });
      setSelectedPairs(updatedPairs);
    }
  };
  const handleSaveUdfSetting = () => {
    setIsSubmited(true);
    dispatch(updateUDFSettings({ udfSettings: selectedPairs }));
    onSubmit(selectedPairs);
  };

  const optionsDraw = () => {
    var pcfSettings =
      filetype === ProjectFileType.XLSX
        ? graphStringsXLSXSettings
        : filetype === ProjectFileType.MicrosoftProject
        ? graphStringsMSProjectSettings
        : filetype === ProjectFileType.PrimaveraXML
        ? graphPrimaveraSettings
        : graphStringsSettings;
    return pcfSettings.map((string, index) => (
      <li key={index} className="mb-2 flex items-center">
        <span className="w-[50%] inline-block mr-2">{t(string.name)}:</span>

        <Dropdown
          options={udfStringsOptions!}
          label=""
          // value={
          //   udfSettingsData?.find((x) => x.pcfField === string.field)
          //     ?.udfSettingId
          // }
          onChange={(e) => handleSelect(string, e.target.value)}
        />
      </li>
    ));
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-opacity-20 bg-white  dark:bg-gray-700 dark:bg-opacity-20">
      <div className="mt-20 max-h-full w-[50%] overflow-y-auto rounded  text-boxdark dark:text-white bg-white p-6 shadow-md dark:bg-gray-700 ">
        <div className="mb-4 text-2xl font-semibold">
          {t("graphSettings.title")}
        </div>

        <div className="flex justify-center items-center p-4">
          <ul>{optionsDraw()}</ul>
        </div>

        <div className="flex items-center justify-between">
          <LabelButton type="button" onClick={handleClose}>
            {t("activityForm.cancel")}
          </LabelButton>
          <PrimaryButton
            type="button"
            //   disabled={!isValid}
            className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => handleSaveUdfSetting()}
          >
            {isSubmited ? <Spinner /> : t("activityForm.save")}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default ParameterSelector;
