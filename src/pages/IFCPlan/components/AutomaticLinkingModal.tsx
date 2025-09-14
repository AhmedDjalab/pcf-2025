import React, { useState, useRef, Ref } from "react";
import * as FRAG from "@thatopen/fragments";
import { ActivityModel } from "src/types/Project";

interface PropertySet {
  _category: { value: string };
  _localId: { value: number };
  Name: { value: string; type: string };
  HasProperties?: Array<{
    Name: { value: string; type: string };
    NominalValue: { value: any; type: string };
  }>;
}

interface SynchroCodeResult {
  localId: number;
  synchroCode: string | null;
  propertySetName: string;
}
interface AutomaticLinkingModalProps {
  modelRef: any;
  setActivities: React.Dispatch<React.SetStateAction<ActivityModel[]>>;
  activities: ActivityModel[];
}

const AutomaticLinkingModal = ({
  modelRef,
  activities,
  setActivities,
}: AutomaticLinkingModalProps) => {
  const [showModal, setShowModal] = useState(false);
  const [activityId, setActivityId] = useState("");
  const [synchroCode, setSynchroCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [error, setError] = useState("");

  const findSynchroCodes = (
    localId: number,
    rawPsets: PropertySet[]
  ): SynchroCodeResult[] => {
    const results: SynchroCodeResult[] = [];

    for (const pset of rawPsets) {
      // Skip if not a property set or doesn't have properties
      if (pset._category.value !== "IFCPROPERTYSET" || !pset.HasProperties)
        continue;

      // Look for "Code SYNCHRO" property
      const synchroProperty = pset.HasProperties.find(
        (prop) => prop.Name.value === (synchroCode ?? "Code SYNCHRO")
      );

      if (synchroProperty && synchroProperty.NominalValue.value !== undefined) {
        console.warn(
          "🚀 ~ findSynchroCodes ~ synchroProperty.NominalValue.value:",
          synchroProperty.NominalValue.value
        );

        results.push({
          localId: pset._localId.value,
          synchroCode: synchroProperty.NominalValue.value.split(".")[1],
          propertySetName: pset.Name.value,
        });
      }
    }

    return results;
  };

  const getSynchroCodesFromElementData = async (): Promise<
    Record<string, number[]>
  > => {
    const localIds = (await modelRef.current?.getLocalIds()) ?? [];
    const elementData =
      (await modelRef.current?.getItemsData(localIds, {
        attributesDefault: true,
        relations: {
          IsDefinedBy: { attributes: true, relations: true },
        },
      })) ?? [];

    const synchroCodeMap: Record<string, number[]> = {};

    elementData.forEach((element, index) => {
      const localId = localIds[index];
      if (element.IsDefinedBy) {
        const synchroCodes = findSynchroCodes(
          localId,
          element.IsDefinedBy as unknown as PropertySet[]
        );
        synchroCodes.forEach(({ synchroCode }) => {
          if (synchroCode) {
            if (!synchroCodeMap[synchroCode]) {
              synchroCodeMap[synchroCode] = [];
            }
            synchroCodeMap[synchroCode].push(localId);
          }
        });
      }
    });

    return synchroCodeMap;
  };

  const handleLink = async () => {
    if (!synchroCode.trim()) {
      setError("Both fields are required");
      return;
    }

    setIsLinking(true);
    setError("");

    const synchroCodeMap = await getSynchroCodesFromElementData();
    console.log("🚀 ~ loadIFC ~ synchroCodeMap:", synchroCodeMap);

    // Update activities to link them with matching local IDs
    setActivities((prev) =>
      prev.map((activity) => {
        // Check if activity has a synchro code that exists in our map
        const activitySynchroCode = activity.activityUID ?? activity.activityId;

        // Find matching local IDs for this activity's synchro code
        const matchingLocalIds = synchroCodeMap[activitySynchroCode] || [];
        const matchingLocalIdsStrings = matchingLocalIds.map((e) =>
          e.toString()
        );

        if (matchingLocalIds.length > 0) {
          console.log("🚀 ~ loadIFC ~ matchingLocalIds:", matchingLocalIds);
          return {
            ...activity,
            linkedModelIds: [
              ...new Set([
                ...(activity.linkedModelIds ?? []),
                ...matchingLocalIdsStrings,
              ]),
            ],
          };
        }

        return activity;
      })
    );

    setLinkSuccess(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLinking(false);
    setShowModal(false);
    setLinkSuccess(false);
    setActivityId("");
    setSynchroCode("");
  };

  return (
    <div className="p-6">
      {/* Automatic Linking Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 font-medium text-white transition-all duration-300 transform bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:scale-105"
      >
        Automatic Linking
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md overflow-hidden transition-all duration-300 transform scale-95 bg-white shadow-2xl rounded-xl animate-in fade-in-90 zoom-in-90">
            {/* Modal Header */}
            <div className="p-5 text-white bg-gradient-to-r from-blue-500 to-blue-600">
              <h2 className="text-xl font-bold">Link Activities to Geometry</h2>
              <p className="mt-1 text-sm text-blue-100">
                Connect activities to IFC elements using IFC Code
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {error && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 mb-5 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Activity ID Field
                  </label>
                  <input
                    type="text"
                    defaultValue="activityId"
                    value={activityId}
                    onChange={(e) => setActivityId(e.target.value)}
                    placeholder="activityId"
                    className="w-full p-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    IFC Code Field
                  </label>
                  <input
                    type="text"
                    value={synchroCode}
                    onChange={(e) => setSynchroCode(e.target.value)}
                    placeholder="Enter ifc code field"
                    className="w-full p-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Linking Animation */}
              {isLinking && (
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-blue-500 animate-spin"></div>
                  </div>
                  <p className="mt-3 font-medium text-gray-600">
                    Linking activities to geometry...
                  </p>

                  {linkSuccess && (
                    <div className="flex items-center mt-4 text-green-600">
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      Successfully linked!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-5 py-4 space-x-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="px-4 py-2 font-medium text-gray-700 transition-colors rounded-lg hover:text-gray-900"
                disabled={isLinking}
              >
                Cancel
              </button>
              <button
                onClick={handleLink}
                disabled={isLinking}
                className="flex items-center px-4 py-2 font-medium text-white transition-all duration-300 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLinking ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Linking...
                  </>
                ) : (
                  "Start Linking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomaticLinkingModal;
