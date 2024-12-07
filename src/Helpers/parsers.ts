import moment from "moment";
import { UdfSetting, GraphDataType } from "src/state/slices/graphSlice";
import { extractValueAndUnit } from "src/utils/helpers";

//? get Extra parser for attributes names
export const getExtendPropertyData = (
  xmlDoc: any,
  activity: any,
  userSelectionData: UdfSetting[]
) => {
  // const UDFTypes =
  //   xmlDoc.getElementsByTagName("ExtendedAttributes")[0].children;

  const UDFElements = activity.getElementsByTagName("ExtendedAttribute");

  const dataObject: Partial<GraphDataType> = {};

  if (!UDFElements || UDFElements[0]?.children?.length === 0) {
    // UDFElements is either null or empty
    return null;
  }
  // if (!UDFElements) {
  //   return {
  //     startChainage: 0,
  //     finishChainage: 0,
  //     style: activity.getElementsByTagName("Name")[0].textContent,
  //   };
  // }
  for (let i = 0; i < UDFElements.length; i++) {
    const UDF = UDFElements[i];

    const typeObjectId = UDF.getElementsByTagName("FieldID")[0].textContent;
    const value = UDF.getElementsByTagName("Value")[0].textContent;

    const setting = userSelectionData?.find(
      (x) => x.udfSettingId === typeObjectId.trim() // Remove leading/trailing whitespaces
    );

    // console.error(
    //   "🚀 ~ file: ImportFileForm.tsx:582 ~ getExtendPropertyData ~ UDFType:",
    //   setting,
    //   udfSettingsData,
    //   typeObjectId,
    //   UDF
    // );
    console.warn("thisi s seeting ", setting, UDF, [...UDFElements]);
    if (setting) {
      if (
        setting.pcfField === "startDate" ||
        setting.pcfField === "finishDate"
      ) {
        // Handle date values
        const date = moment.utc(value, "DD/MM/YYYY", true);
        if (date.isValid()) {
          date.add(1, "day");
          dataObject[setting.pcfField] = date.toISOString();
        } else {
          // Handle invalid date format
        }
      } else if (
        setting.pcfField === "startChainage" ||
        setting.pcfField === "finishChainage"
      ) {
        // Handle numeric values
        dataObject[setting.pcfField] = parseFloat(value);
      } else if (
        setting.pcfField === "workShops" ||
        setting.pcfField === "productionRate" ||
        setting.pcfField === "quantity"
      ) {
        const { numericValue, unit } = extractValueAndUnit(value);

        dataObject[setting.pcfField] = numericValue;

        if (setting.pcfField === "productionRate") {
          dataObject.productionRateUnit = unit;
        } else if (setting.pcfField === "quantity") {
          dataObject.quantityUnit = unit;
        } else {
          // Handle other fields
          dataObject[setting.pcfField] = numericValue;
        }
      } else {
        // Handle other fields
        dataObject[setting.pcfField] = value;
      }
    }
  }
  if (Object.keys(dataObject).length === 0) {
    return null;
  }
  return dataObject;
};

export const getUDFData = (
  xmlDoc: any,
  activity: any,
  userSelectionData: UdfSetting[]
) => {
  const UDFElements = activity.getElementsByTagName("UDF");

  const dataObject: Partial<GraphDataType> = {};

  if (!UDFElements || UDFElements[0]?.children?.length === 0) {
    // UDFElements is either null or empty
    return null;
  }

  console.warn("thisi s seeting udf element  ", UDFElements, userSelectionData);
  for (let i = 0; i < UDFElements.length; i++) {
    const UDF = UDFElements[i];

    const typeObjectId =
      UDF.getElementsByTagName("TypeObjectId")[0]?.textContent;

    //! you have to check if it double or text

    let textValue = UDF.getElementsByTagName("TextValue")[0]?.textContent;

    if (!textValue) {
      textValue = UDF.getElementsByTagName("DoubleValue")[0]?.textContent;
    }

    // Find the corresponding setting based on the typeObjectId
    const setting = userSelectionData!.find(
      (x) => x.udfSettingId === typeObjectId.toString()
    );
    // ? here you should check if they have pk and style

    // if (!setting) {
    //   // If any required property is null, return null for the entire dataObject
    //   return null;
    // }

    if (setting) {
      if (
        setting.pcfField === "startChainage" ||
        setting.pcfField === "finishChainage"
      ) {
        // Handle numeric values
        dataObject[setting.pcfField] = parseFloat(textValue);
      } else if (setting.pcfField === "id") {
        dataObject["activityId"] = textValue;
      } else if (setting.pcfField === "style") {
        dataObject[setting.pcfField] = textValue;
      } else if (setting.pcfField === "critical") {
        dataObject[setting.pcfField] = textValue === "Yes" ? true : false;
      } else if (
        setting.pcfField === "workShops" ||
        setting.pcfField === "productionRate" ||
        setting.pcfField === "quantity"
      ) {
        let numericValue = 0,
          unit;

        if (textValue) {
          ({ numericValue, unit } = extractValueAndUnit(textValue));
        }

        dataObject[setting.pcfField] = textValue ? numericValue : undefined;

        if (setting.pcfField === "productionRate") {
          dataObject.productionRateUnit = unit;
        } else if (setting.pcfField === "quantity") {
          dataObject.quantityUnit = unit;
        } else {
          // Handle other fields
          dataObject[setting.pcfField] = numericValue;
        }
      } else {
        // Handle other fields
        dataObject[setting.pcfField] = textValue;
      }
    }
  }

  if (Object.keys(dataObject).length === 0) {
    return null;
  }

  return dataObject;
};
