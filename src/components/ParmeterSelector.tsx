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
  console.log("this is settitng ", udfSettingString);
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

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-opacity-20 bg-white  dark:bg-gray-700 dark:bg-opacity-20">
      <div className="mt-20 max-h-full w-[50%] overflow-y-auto rounded  text-boxdark dark:text-white bg-white p-6 shadow-md dark:bg-gray-700 ">
        <div className="mb-4 text-2xl font-semibold">
          {t("graphSettings.title")}
        </div>

        <div className="flex justify-center items-center p-4">
          <ul>
            {graphStringsSettings.map((string, index) => (
              <li key={index} className="mb-2 flex items-center">
                <span className="w-[50%] inline-block mr-2">
                  {t(string.name)}:
                </span>

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
