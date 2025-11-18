import { useCallback, useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { getBim } from "src/Services/BimService";
import { useParams } from "react-router-dom";
import Spinner from "src/components/Spinner";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/context/UserContext";
import {
  CADDataModel,
  getAccessToken,
  getCADInfo,
  saveCADData,
} from "src/Services/CADService";
import AutomaticLinkingModal from "../IFCPlan/components/AutomaticLinkingModal";
import ActivitiesPanel from "../IFCPlan/components/ActivitiesPannel";
import { ActivityModel } from "src/types/Project";
import { viewerVisibility } from "./viewerVisibility";
import ActivitiesCADPanel from "./components/ActivitiesCADPanel";
import toast from "react-hot-toast";
import TimelineScheduling from "../IFCPlan/components/TimelineScheduling";
import TimelineSchedulingCAD from "./components/TimeShedulingCAD";
import AutomaticCADLinkingModal from "../IFCPlan/components/AutomaticCADLinkingModal";

declare const Autodesk: any;
const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
const CADViewer = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { canWrite, isAdmin } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<Autodesk.Viewing.GuiViewer3D | null>(null);

  const [activities, setActivities] = useState<ActivityModel[]>([]);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>();
  const { i18n } = useTranslation();

  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refetchProject,
    isSuccess: isSuccess,
  } = useQuery({
    queryKey: ["activitiesCAD", id],
    queryFn: () => {
      return getCADInfo({
        projectId: id!,
        search: "",
      });
    },

    refetchOnWindowFocus: false,
    staleTime: 6000,
  });
  useEffect(() => {
    waitForAutodesk();
    const viewer = viewerRef.current;

    if (!viewer) return;

    const handleSelectionChanged = (event: any) => {
      let selSet = event.selections[0];
      if (!selSet) {
        return;
      }
      const dbIdArray = selSet.dbIdArray;

      if (dbIdArray && dbIdArray.length > 0) {
        setSelectedObjectIds(dbIdArray);
      } else {
        setSelectedObjectIds([]);
      }
    };

    // Add listener
    viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      handleSelectionChanged
    );

    // Cleanup
    return () => {
      viewer.removeEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        handleSelectionChanged
      );
    };
  });

  const {
    showAllModels,
    toggleModelVisibility,
    toggleModelIsolated,
    handleVisibilty,
    deleteAll,
    hideAllModels,
    applyVisibility,
    hideEverythingAndMakeWhite,
  } = viewerVisibility(viewerRef, projectsData?.cadFileUrl!);
  // let currentAcitivtyRef = useRef();
  // const setCurrentActivityId = (id) => {
  //   currentAcitivtyRef.current = id;
  // };

  const getBlockReferences = (
    viewer: Autodesk.Viewing.GuiViewer3D
  ): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const model = viewer.model;
      if (!model) return reject("No model loaded");

      model.getObjectTree((tree) => {
        if (!tree) return reject("Object tree not available");

        const rootId = tree.getRootId();
        const allDbIds: number[] = [];

        // Collect all dbIds
        tree.enumNodeChildren(
          rootId,
          (dbId) => {
            allDbIds.push(dbId);
          },
          true
        );

        if (allDbIds.length === 0) return resolve([]);

        // Get only block references using bulk properties
        model.getBulkProperties(
          allDbIds,
          ["Block Name", "Category", "Type", "AutoCAD Block"],
          (results) => {
            const blockRefs = results.filter((item) =>
              item.properties?.some(
                (p) =>
                  (p.displayName === "Block Name" ||
                    p.displayName === "AutoCAD Block" ||
                    p.displayName === "Category" ||
                    p.displayName === "Type") &&
                  (p.displayValue === "BlockReference" ||
                    (typeof p.displayValue === "string" &&
                      p.displayValue.includes("Block")))
              )
            );

            console.log("📦 Found block references:", blockRefs.length);
            resolve(blockRefs);
          },
          (error) => reject(error)
        );
      });
    });
  };

  const initViewer = useCallback(async (urn: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Dispose any existing viewer instance first
      if (viewerRef.current) {
        viewerRef.current.finish();
        viewerRef.current = null;
        console.log("🔄 Previous viewer instance cleared.");
      }

      const tokenResponse = await getAccessToken();
      if (!tokenResponse) return;

      const { access_token, expires_in } = tokenResponse;

      const options = {
        env: "AutodeskProduction",
        getAccessToken: (onTokenReady: any) =>
          onTokenReady(access_token, expires_in),

        language: i18n.language,
      };

      await waitForAutodesk();

      // Initialize Autodesk Viewer environment
      await new Promise<void>((resolve) => {
        Autodesk.Viewing.Initializer(options, () => resolve());
      });

      const viewerDiv = containerRef.current!;
      const viewer: Autodesk.Viewing.GuiViewer3D =
        new Autodesk.Viewing.GuiViewer3D(viewerDiv, {
          extensions: ["Autodesk.DocumentBrowser"],
        });
      viewerRef.current = viewer;

      const started = viewer.start();
      if (started !== 0) throw new Error("Viewer failed to start.");

      // viewer.setTheme("light-theme");
      console.log("tisi si urn ", urn);
      Autodesk.Viewing.Document.load(
        `urn:${urn}`,
        (doc) => {
          const defaultModel = doc.getRoot().getDefaultGeometry();

          // Listen for geometry loaded event
          const onGeometryLoaded = () => {
            console.log("✅ Geometry fully loaded!");

            // Get blocks after geometry is loaded
            getBlockReferences(viewer)
              .then((blocks) => {
                console.log("📊 Total blocks:", blocks.length);
                blocks.forEach((block) => {
                  console.log(
                    `ID: ${block.dbId}, Name: ${block.name}, ExternalID: ${block.externalId}`
                  );
                  console.log("Properties:", block.properties);
                });
              })
              .catch((error) => {
                console.error("❌ Error getting blocks:", error);
              });

            setIsLoading(false);

            // Remove listener after use
            viewer.removeEventListener(
              Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
              onGeometryLoaded
            );
          };

          viewer.addEventListener(
            Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            onGeometryLoaded
          );

          viewer.loadDocumentNode(doc, defaultModel);
        },
        (errorCode) => {
          console.error("❌ Failed to load document", errorCode);
          setError("Failed to load model.");
          setIsLoading(false);
        }
      );

      viewer.setQualityLevel(false, false);
      viewer.setLightPreset(1);
      viewer.setQualityLevel(false, false);
      viewer.setGhosting(false);
      viewer.setGroundShadow(false);
      viewer.setGroundReflection(false);
      viewer.setEnvMapBackground(false);
      viewer.setProgressiveRendering(false);
    } catch (err: any) {
      console.error("🚨 Failed to initialize viewer:", err);
      setError(err.message || "Initialization failed");
      setIsLoading(false);
    }
  }, []);

  const waitForAutodesk = () =>
    new Promise<void>((resolve, reject) => {
      if ((window as any).Autodesk) return resolve();
      const check = setInterval(() => {
        if ((window as any).Autodesk) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => reject(new Error("Autodesk SDK not loaded")), 20000);
    });

  useEffect(() => {
    if (containerRef.current && isSuccess && projectsData) {
      if (projectsData) {
        const activities = projectsData.activities?.map((ac) => ({
          ...ac,
          startDate: new Date(ac.startDate),
          endDate: new Date(ac.endDate),
          persistAfterEnd: ac.persistAfterEnd,
        }));
        setActivities(activities);
      }
      initViewer(projectsData.cadFileURN);
    }
    return () => {
      if (viewerRef.current) {
        console.log("🧹 Disposing viewer...");
        viewerRef.current.finish();
        viewerRef.current = null;
      }
    };
  }, [initViewer, containerRef, projectsData, isSuccess]);

  const handleSaveCadData = async () => {
    try {
      setIsSubmitting(true);
      if (!activities) return;
      const activitiesWithLinkedModel: CADDataModel[] =
        activities.map((a) => ({
          cadLinkedModelIds: a.cadLinkedModelIds,
          activityId: a.id,
          persistAfterEnd: a.persistAfterEnd,
        })) ?? [];

      var result = await saveCADData({
        projectId: id!,
        activityCadLinkeds: activitiesWithLinkedModel,
      });

      if (result?.status === 200) {
        toast.success("it updated succeffully");
      }

      setIsSubmitting(false);
    } catch (error) {
      console.log("🚀 ~ handleSaveBimData ~ error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex flex-1 overflow-hidden">
        {projectsLoading ? (
          <Spinner></Spinner>
        ) : (
          <ActivitiesCADPanel
            setActivities={setActivities}
            activities={activities ?? []}
            onLink={(ac, modelId) => console.log("thos ", ac, modelId)}
            getSelectedModelIds={() => selectedObjectIds ?? []}
            toggleVisibilty={(localId) => toggleModelVisibility(localId)}
            isolateItem={(localId) => toggleModelIsolated(localId)}
            resetIsolated={(localId) => showAllModels()}
            handleSaveBimData={handleSaveCadData}
            isSubmitting={isSubmitting}
            handleVisibilty={(localId, visibile) =>
              handleVisibilty(localId, visibile)
            }
            AutomaticLinkingLogic={
              viewerRef.current ? (
                <AutomaticCADLinkingModal
                  setActivities={setActivities}
                  activities={activities}
                  viewer={viewerRef.current}
                />
              ) : (
                <Spinner />
              )
            }
          />
        )}

        <div className="relative flex-1">
          {/* Autodesk Viewer */}
          <div
            ref={containerRef}
            style={{ width: "100%", height: "100%", position: "relative" }}
          />

          {/* {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="text-xl text-white">{t("ifcPlan.loading")}</div>
            </div>
          )} */}

          {/* Error Banner */}
          {error && (
            <div className="absolute z-50 px-4 py-2 text-white -translate-x-1/2 rounded-md top-3 left-1/2 bg-red-600/80">
              {t("ifcPlan.error")}: {error}
            </div>
          )}
        </div>
      </div>
      <div className="w-full bg-white border-t border-gray-300 shadow-lg">
        <TimelineSchedulingCAD
          activities={activities ?? []}
          applyVisibility={applyVisibility}
          hideAllItems={() =>
            hideEverythingAndMakeWhite(
              viewerRef.current,
              viewerRef.current?.model
            )
          }
          showAllItems={showAllModels}
          toggleVisibility={toggleModelVisibility}
        />
      </div>
    </div>
  );
};

export default CADViewer;
