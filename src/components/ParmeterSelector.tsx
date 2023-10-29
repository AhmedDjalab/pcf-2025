import React, { useEffect, useMemo, useState } from "react";
import {
  GraphStringsSetting,
  ProjectFileType,
  getOptions,
  graphStringsSettings,
} from "src/const/vars";
import Dropdown from "./DropDown";
import { LabelButton, PrimaryButton } from "./Button";
import { useTranslation } from "react-i18next";
import { UdfSetting, updateUDFSettings } from "src/state/slices/graphSlice";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/state";
import { uniqueId } from "lodash";

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
    (state: RootState) => state.userDefindSettings
  );
  const filetype = useSelector(
    (state: RootState) => state.projectSettings.fileType
  );
  let udfStringsOptions = useMemo(
    () => getOptions(udfSettingString, filetype!),
    [filetype, udfSettingString]
  );
  console.log(
    "🚀 ~ file: ParmeterSelector.tsx:47 ~ udfStringsOptions:",
    udfStringsOptions
  );

  const handleSelect = (
    selectable: GraphStringsSetting,
    selectedValue: string
  ) => {
    console.log(
      "🚀 ~ file: ParmeterSelector.tsx:20 ~ handleSelect ~ selectable: string, selectedValue: string:",
      selectable,
      selectedValue,
      udfStringsOptions
    );
    const existingPair = selectedPairs.find(
      (pair) => pair.udfSettingId === selectedValue.toString()
    );
    console.log(
      "🚀 ~ file: ParmeterSelector.tsx:30 ~ handleSelect ~ existingPair:",
      existingPair,
      selectedPairs
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
    console.log(
      "🚀 ~ file: ParmeterSelector.tsx:68 ~ selectedOption:",
      selectedOption,
      updatedPairs
    );

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

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-opacity-20 bg-white  dark:bg-gray-700 dark:bg-opacity-20">
      <div className="mt-20 max-h-full w-[50%] overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700 ">
        <div className="mb-4 text-2xl font-semibold">
          {t("graphSettings.title")}
        </div>

        <div className="flex justify-center items-center p-4">
          <ul>
            {graphStringsSettings.map((string, index) => (
              <li key={index} className="mb-2 flex items-center">
                <span className="w-[30%] mr-2">{string.name}:</span>

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
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <PrimaryButton
            type="button"
            //   disabled={!isValid}
            onClick={() => handleSaveUdfSetting()}
          >
            {t("activityForm.save")}
          </PrimaryButton>
          <LabelButton type="button" onClick={handleClose}>
            {t("activityForm.cancel")}
          </LabelButton>
        </div>
      </div>
    </div>
  );
}

export default ParameterSelector;
