//@ts-ignore
//@ts-noCheck

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as FRAG from "@thatopen/fragments";
import * as BUIC from "@thatopen/ui-obc";
import Stats from "stats.js";
import * as OBCF from "@thatopen/components-front";
import * as THREE from "three";

import ActivitiesPanel, { ACTIVI } from "./components/ActivitiesPannel";

import TimelineScheduling from "./components/TimelineScheduling";
import AutomaticLinkingModal from "./components/AutomaticLinkingModal";
import { ActivityModel } from "src/types/Project";
import { useQuery } from "@tanstack/react-query";
import { BimDataModel, getBim, saveBimData } from "src/Services/BimService";
import { useParams } from "react-router-dom";
import Spinner from "src/components/Spinner";
import { data } from "autoprefixer";
import { decompressFile } from "src/utils/fileCompresser";
import { Calendar, Eye, EyeOff } from "lucide-react";
import {
  selectCurrentActivityId,
  selectCurrentActivityIds,
} from "src/state/slices/bimSlice";
import { useSelector } from "react-redux";
import { useVisibilityManager } from "./components/useVisibilityManager";
import CameraControls from "./components/CameraControls";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/context/UserContext";
import toast from "react-hot-toast";

const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
const IFCViewer = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { canWrite, isAdmin } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const componentsRef = useRef<OBC.Components | null>(null);
  const worldRef = useRef<OBC.World | null>(null);
  const spatialTreeRef = useRef<BUI.Table<any> | null>(null);
  const ifcLoaderRef = useRef<OBC.IfcLoader | null>(null);
  const hiderRef = useRef<OBC.Hider>();
  const highlighterRef = useRef<OBCF.Highlighter>();
  const [activities, setActivities] = useState<ActivityModel[]>();
  const modelRef = useRef<FRAG.FragmentsModel | null>(null);
  const fragmentsRef = useRef<OBC.FragmentsManager | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [panelsVisible, setPanelsVisible] = useState(false);
  const [modelName, setModelName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [selectedModelIdMap, setSelectedModelIdMap] =
    useState<OBC.ModelIdMap>();
  const [modelMapIds, setModelMapIds] = useState<Record<string, number[]>>({});
  const html = document.querySelector("html")!;
  const currentActivityIds = useSelector(selectCurrentActivityIds);
  const { applyVisibility, hideAll, showAll, currentVisibleSet } =
    useVisibilityManager(hiderRef, modelName);

  // let currentAcitivtyRef = useRef();
  // const setCurrentActivityId = (id) => {
  //   currentAcitivtyRef.current = id;
  // };

  const initViewer = useCallback(async () => {
    try {
      setIsLoading(true);

      // Components
      const components = new OBC.Components();
      componentsRef.current = components;

      // World
      const worlds = components.get(OBC.Worlds);
      const world = worlds.create<
        OBC.SimpleScene,
        OBC.SimpleCamera,
        OBC.SimpleRenderer
      >();
      worldRef.current = world;

      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(
        components,
        containerRef?.current
      );

      world.camera = new OBC.SimpleCamera(components);
      // world.camera = new OBC.OrthoPerspectiveCamera(components);

      // world.renderer = new OBC.SimpleRenderer(
      //   components,
      //   containerRef?.current
      // );
      // world.camera = new OBC.OrthoPerspectiveCamera(components);
      await world.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);

      await components.init();
      // world.camera.projection.onChanged.add(() => {
      //   const projection = world.camera.projection.current;
      //   grid.fade = projection === "Perspective";
      // });
      // Scene setup
      world.scene.setup();
      world.scene.three.background = null;
      const grids = components.get(OBC.Grids);
      grids.create(world);
      const hider = components.get(OBC.Hider);
      hiderRef.current = hider;
      // IFC Loader
      const ifcLoader = components.get(OBC.IfcLoader);
      await ifcLoader.setup({
        autoSetWasm: false,
        wasm: {
          path: "/wasm/",
          absolute: true,
        },
      });

      if (ifcLoader.webIfc && ifcLoader.webIfc.wasmModule) {
        // Try to override the worker URL
        const originalWorkerPath = ifcLoader.webIfc.wasmModule.workerPath;
        ifcLoader.webIfc.wasmModule.workerPath = "/wasm/web-ifc-mt.worker.js";
        console.log(
          "Worker path overridden from",
          originalWorkerPath,
          "to",
          ifcLoader.webIfc.wasmModule.workerPath
        );
      }
      ifcLoaderRef.current = ifcLoader;

      // Fragments
      const fragments = components.get(OBC.FragmentsManager);
      const response = await fetch(
        "https://thatopen.github.io/engine_fragment/resources/worker.mjs"
      );
      const workerBlob = await response.blob();
      const workerFile = new File([workerBlob], "worker.mjs", {
        type: "text/javascript",
      });
      //const fragments = components.get(OBC.FragmentsManager);
      // const response = await fetch(
      //   "https://thatopen.github.io/engine_fragment/resources/worker.mjs"
      // );
      // const workerBlob = await response.blob();
      // const workerFile = new File([workerBlob], "worker.mjs", {
      //   type: "text/javascript",
      // });
      fragments.init(URL.createObjectURL(workerFile));

      fragmentsRef.current = fragments;

      // Camera + Fragments sync
      world.camera.controls.addEventListener("rest", () =>
        fragments.core?.update(true)
      );
      world.scene.three.background = new THREE.Color(0x212121);

      fragments.list.onItemSet.add(({ value: model }) => {
        model.useCamera(world.camera.three);
        world.scene.three.add(model.object);
        fragments.core?.update(true);
        world.camera.controls.fitToSphere(model.object, true);
      });
      html.classList.remove("bim-ui-dark", "bim-ui-light");
      html.className = "bim-ui-dark";
      // ✅ UI Manager
      BUI.Manager.init();

      // ✅ Spatial Tree & Properties Panel
      const [spatialTree] = BUIC.tables.spatialTree({
        components,
        models: [],
      });

      spatialTreeRef.current = spatialTree;

      console.warn("🚀 ~ initViewer ~ spatialTree:", spatialTree);

      const table = document.createElement("bim-table") as BUI.Table;
      table.dataTransform = {};

      const [propertiesTable, updatePropertiesTable] = BUIC.tables.itemsData({
        components,
        modelIdMap: {},
      });
      propertiesTable.preserveStructureOnFilter = true;
      propertiesTable.indentationInText = false;

      const uiContainer = document.getElementById("ui-panels");
      const propContainer = document.getElementById("properties-panel");
      if (uiContainer) {
        uiContainer.appendChild(spatialTree);
        //uiContainer.appendChild(propertiesTable);
      }
      if (propContainer) {
        propContainer.appendChild(propertiesTable);
        //uiContainer.appendChild(propertiesTable);
      }
      const finder = components.get(OBC.ItemsFinder);

      // Stats
      const stats = new Stats();
      stats.showPanel(2);
      containerRef.current?.appendChild(stats.dom);
      stats.dom.style.position = "absolute";
      stats.dom.style.left = "0px";
      stats.dom.style.top = "0px";
      world.renderer.onBeforeUpdate.add(() => stats.begin());
      world.renderer.onAfterUpdate.add(() => stats.end());
      const highlighter = components.get(OBCF.Highlighter);
      // highlighter.setup({
      //   world,
      // });
      highlighterRef.current = highlighter;

      highlighter.setup({ world });
      let selectedFragmentIdMap: Record<string, number[]> = {};
      let hiddenElements = new Set<string>();
      highlighter.events.select.onHighlight.add(
        (modelIdMap: OBC.ModelIdMap) => {
          console.log("🚀 ~ initViewer ~ modelIdMap:", modelIdMap);
          updatePropertiesTable({ modelIdMap });
          let selectedFragmentIdMap = modelIdMap;
          const fragmentIdStrings: string[] = Object.values(
            selectedFragmentIdMap
          ).flatMap((set) => Array.from(set, (id) => id.toString()));
          setSelectedModelIds(fragmentIdStrings);
          setSelectedModelIdMap(modelIdMap);
          selectedFragmentIdMap = modelIdMap;
          // setModelMapIds(modelIdMap) ;
          //hider.set(false, modelIdMap);
        }
      );
      highlighter.events.select.onClear.add(() => {
        updatePropertiesTable({ modelIdMap: {} });
        setSelectedModelIds([]);

        //  hider.set(true);
      });

      // Load sample model
      // loadSampleModel();
      setIsLoading(false);
    } catch (err: any) {
      console.error("Failed to initialize viewer:", err);
      setError(err.message || "Initialization failed");
      setIsLoading(false);
    }
  }, [html]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let start: THREE.Vector2 | null = null;

    let box: HTMLDivElement | null = null;

    const onPointerDown = (event: PointerEvent) => {
      // Require Left Mouse Button + Shift key

      if (event.button !== 0 || !event.shiftKey || !worldRef.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const rect = container.getBoundingClientRect();

      start = new THREE.Vector2(
        event.clientX - rect.left,
        event.clientY - rect.top
      );

      box = document.createElement("div");

      box.className = "selection-box";

      box.style.left = `${start.x}px`;

      box.style.top = `${start.y}px`;

      container.appendChild(box);

      worldRef.current.camera.controls.enabled = false;

      window.addEventListener("pointermove", onPointerMove);

      window.addEventListener("pointerup", onPointerUp);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!start || !box) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const rect = container.getBoundingClientRect();

      const current = new THREE.Vector2(
        event.clientX - rect.left,
        event.clientY - rect.top
      );

      const minX = Math.min(start.x, current.x);

      const minY = Math.min(start.y, current.y);

      const width = Math.abs(start.x - current.x);

      const height = Math.abs(start.y - current.y);

      box.style.left = `${minX}px`;

      box.style.top = `${minY}px`;

      box.style.width = `${width}px`;

      box.style.height = `${height}px`;
    };

    const onPointerUp = async (event: PointerEvent) => {
      window.removeEventListener("pointermove", onPointerMove);

      window.removeEventListener("pointerup", onPointerUp);

      worldRef.current && (worldRef.current.camera.controls.enabled = true);

      if (
        !start ||
        !box ||
        !worldRef.current ||
        !fragmentsRef.current ||
        !highlighterRef.current
      ) {
        box?.remove();

        start = null;

        box = null;

        return;
      }

      const rect = container.getBoundingClientRect();

      const end = new THREE.Vector2(
        event.clientX - rect.left,
        event.clientY - rect.top
      );

      const topLeft = new THREE.Vector2(
        Math.min(start.x, end.x),
        Math.min(start.y, end.y)
      );

      const bottomRight = new THREE.Vector2(
        Math.max(start.x, end.x),
        Math.max(start.y, end.y)
      );

      box.remove();

      start = null;

      box = null;

      const modelIdMap: OBC.ModelIdMap = {};

      for (const [, model] of fragmentsRef.current.list) {
        const res = await model.rectangleRaycast({
          camera: worldRef.current.camera.three,

          dom: worldRef.current.renderer.three.domElement,

          topLeft,

          bottomRight,

          fullyIncluded: true,
        });

        if (res && res.localIds.length) {
          modelIdMap[model.modelId] = new Set(res.localIds);
        }
      }

      if (Object.keys(modelIdMap).length) {
        await highlighterRef.current.highlightByID(
          highlighterRef.current.config.selectName,

          modelIdMap,

          true,

          false
        );
      } else {
        await highlighterRef.current.clear(
          highlighterRef.current.config.selectName
        );
      }
    };

    container.addEventListener("pointerdown", onPointerDown);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);

      window.removeEventListener("pointermove", onPointerMove);

      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // useEffect(() => {
  //   if (!containerRef.current) return;

  //   initViewer();

  //   return () => {
  //     componentsRef.current?.dispose();
  //   };
  // }, []);

  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ["activitiesBim", id],
    queryFn: () => {
      return getBim({
        projectId: id,
      });
    },

    refetchOnWindowFocus: false,
    staleTime: 6000,
  });

  const loadIFC = useCallback(async (file: File | string) => {
    if (
      !componentsRef.current ||
      !worldRef.current ||
      !ifcLoaderRef.current ||
      !fragmentsRef.current
    ) {
      setError("Viewer not initialized properly");
      console.error(
        "this is ereor ---***- ",
        componentsRef.current,
        worldRef.current,
        ifcLoaderRef.current,
        fragmentsRef.current
      );
      return;
    }

    if (!fragmentsRef.current.core) {
      setError("Fragments core not initialized");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Clear old models
      for (const modelId of fragmentsRef.current.list.keys()) {
        fragmentsRef.current.core.disposeModel(modelId);
      }

      let buffer: Uint8Array;

      if (typeof file === "string") {
        const fileBuffer = await loadAndProcessFile(file);
        buffer = new Uint8Array(fileBuffer);
      } else {
        const data = await file.arrayBuffer();
        buffer = new Uint8Array(data);
      }

      const modelName = typeof file === "string" ? "sample-model" : file.name;
      setModelName(modelName);
      const model = await ifcLoaderRef.current.load(buffer, false, modelName, {
        processData: {
          progressCallback: (progress) =>
            console.log(`Loading progress: ${progress}%`),
        },
      });

      modelRef.current = model;

      // highlighterRef.current.styles.set(model.modelId, {
      //   color: new THREE.Color("green"),
      //   opacity: 1,
      //   transparent: false,
      //   renderedFaces: 0,
      // });
      // let tModel = fragmentsRef.current.list.get(model.modelId);

      // let tModelMap = OBC.ModelIdMapUtils.fromRaw({
      //   [model.modelId]: await tModel.getLocalIds(),
      // });
      // // console.log(tModelMap)

      // await highlighterRef.current.highlightByID(
      //   model.modelId,
      //   tModelMap,
      //   true
      // );
      // // const fragmentsManager = componentsRef.current.get(OBC.FragmentsManager);

      // // Get modelIdMap for a specific model
      // const modeltest = fragmentsManager.groups.get(model.modelId);
      // if (modeltest) {
      //   const modeltestIdMap = model.meshIdMap;
      //   console.log("Model ID Map:", modelIdMap);

      //   // Convert to the format you need
      //   const fragmentIdStrings: string[] = Object.values(
      //     modeltestIdMap
      //   ).flatMap((set) => Array.from(set, (id) => id.toString()));
      //   setSelectedModelIds(fragmentIdStrings);
      //   setSelectedModelIdMap(modeltestIdMap);
      // }
      await fragmentsRef.current.core.update(true);
      await worldRef.current.scene.three.add(model);
      // Get the synchro code map

      //console.log("🚀 ~ loadIFC ~ synchroCodeMap:", activities);

      setIsLoading(false);
    } catch (err: any) {
      console.error("Failed to load IFC file:", err);
      setError(err.message || "Failed to load IFC file");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeViewer = async () => {
      if (projectsData) {
        const activities = projectsData.activities.map((ac) => ({
          ...ac,
          startDate: new Date(ac.startDate),
          endDate: new Date(ac.endDate),
          persistAfterEnd: ac.persistAfterEnd,
        }));
        setActivities(activities);
        await initViewer();
        await loadIFC(projectsData.ifcFileUrl);
      }
    };

    initializeViewer();
  }, [initViewer, loadIFC, projectsData]);

  const loadAndProcessFile = async (file: File | string) => {
    let buffer: Uint8Array;

    if (typeof file === "string") {
      // It's a URL
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`Failed to fetch IFC file: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Check if the file is compressed (gz format)
      if (file.endsWith(".gz") || blob.type === "application/gzip") {
        // Decompress the file
        buffer = await decompressFile(blob);
      } else {
        const data = await blob.arrayBuffer();
        buffer = new Uint8Array(data);
      }
    } else {
      // It's a File object
      if (file.name.endsWith(".gz") || file.type === "application/gzip") {
        // Decompress the file
        buffer = await decompressFile(file);
      } else {
        const data = await file.arrayBuffer();
        buffer = new Uint8Array(data);
      }
    }

    return buffer;
  };

  const loadSampleModel = async () => {
    await loadIFC(
      "https://thatopen.github.io/engine_components/resources/ifc/school_str.ifc"
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith(".ifc")) {
      loadIFC(file);
    } else {
      setError("Please select a valid IFC file");
    }
  };

  const getModelIdFromItemId = async (localId: number) => {
    for (const [modelId, model] of fragmentsRef.current.list) {
      // Get all items of this model
      const itemData = await model.getItem(localId);
      const modelItemId = await itemData.getLocalId();
      console.log("🚀 ~ getModelIdFromItemId ~ modelItemId:", modelItemId);
      if (modelItemId == localId) {
        return modelId; // found the model containing this item
      }
    }
    return null; // not found
  };

  const visibleIds = new Set<number>();

  const showAllModels = async () => {
    const hider = componentsRef.current.get(OBC.Hider);
    hiderRef.current = hider;
    await hider.set(true);
  };

  const toggleModelVisibility = async (localIds: string[]) => {
    console.log("🚀 ~ toggleModelVisibility ~ localIds:", localIds);
    if (!localIds.length) return;

    try {
      const hider = componentsRef.current.get(OBC.Hider);
      hiderRef.current = hider;

      const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));

      const modelIdMap: OBC.ModelIdMap = { [modelName]: new Set(numericIds) };

      await hider.toggle(modelIdMap);

      // // Split into ones currently visible vs hidden
      // const toHide: number[] = [];
      // const toShow: number[] = [];

      // numericIds.forEach((id) => {
      //   if (visibleIds.has(id)) {
      //     toHide.push(id);
      //   } else {
      //     toShow.push(id);
      //   }
      // });

      // // Hide visible ones
      // if (toHide.length) {
      //   const modelIdMap: OBC.ModelIdMap = { [modelName]: new Set(toHide) };
      //   await hider.set(false, modelIdMap);
      //   toHide.forEach((id) => visibleIds.delete(id));
      // }

      // // Show hidden ones
      // if (toShow.length) {
      //   const modelIdMap: OBC.ModelIdMap = { [modelName]: new Set(toShow) };
      //   await hider.set(true, modelIdMap);
      //   toShow.forEach((id) => visibleIds.add(id));
      // }
    } catch (error) {
      console.error("Toggle visibility error:", error);
      throw error;
    }
  };

  const toggleModelIsolated = async (localIds: string[], visible?: boolean) => {
    console.log("🚀 ~ toggleModelIsolated ~ localIds:", localIds);
    if (!localIds.length) return;

    //const modelIdMap: OBC.ModelIdMap = {};
    const hider = componentsRef.current.get(OBC.Hider);
    hiderRef.current = hider;
    const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));

    const modelIdMap: OBC.ModelIdMap = { [modelName]: new Set(numericIds) };
    console.log("🚀 ~ toggleModelVisibility ~ modelIdMap:", modelIdMap);
    await hider.isolate(modelIdMap);
  };
  const handleSaveBimData = async () => {
    try {
      setIsSubmitting(true);
      const activitiesWithLinkedModel: BimDataModel[] =
        activities.map((a) => ({
          linkedModelIds: a.linkedModelIds,
          activityId: a.id,
          persistAfterEnd: a.persistAfterEnd,
        })) ?? [];

      console.log(
        "🚀 ~ handleSaveBimData ~ activitiesWithLinkedModel:",
        activitiesWithLinkedModel
      );

      var result = await saveBimData({
        projectId: id,
        activityBimLinkeds: activitiesWithLinkedModel,
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

  const handleVisibilty = async (localIds, visible) => {
    console.log("🚀 ~ handleVisibilty ~ localIds, visible:", localIds, visible);
    if (!localIds.length) return;

    try {
      const hider = componentsRef.current.get(OBC.Hider);
      hiderRef.current = hider;

      const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));

      const modelIdMap: OBC.ModelIdMap = { [modelName]: new Set(numericIds) };
      await hider.set(false);
      await hider.set(visible, modelIdMap);
    } catch {}
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex flex-1 overflow-hidden">
        <ActivitiesPanel
          setActivities={setActivities}
          activities={
            activities?.sort(
              (a, b) =>
                (b.linkedModelIds?.length ?? 0) -
                (a.linkedModelIds?.length ?? 0)
            ) ?? []
          }
          onLink={(ac, modelId) => console.log("thos ", ac, modelId)}
          getSelectedModelIds={() => selectedModelIds}
          toggleVisibilty={(localId) => toggleModelVisibility(localId)}
          isolateItem={(localId) => toggleModelIsolated(localId)}
          resetIsolated={(localId) => showAllModels()}
          // currentActivityId={currentActivityId}
          handleSaveBimData={handleSaveBimData}
          isSubmitting={isSubmitting}
          handleVisibilty={(localId, visibile) =>
            handleVisibilty(localId, visibile)
          }
          AutomaticLinkingLogic={
            <AutomaticLinkingModal
              setActivities={setActivities}
              activities={activities ?? []}
              modelRef={modelRef}
            />
          }
        />

        {projectsLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col flex-1">
            {/* Main Content Area - Takes remaining space */}
            <div className="relative flex-1">
              <div
                style={{ width: "100%", height: "100%", position: "relative" }}
              >
                <CameraControls
                  worldRef={worldRef}
                  fragmentsRef={fragmentsRef}
                />
                <div className="absolute z-10 flex flex-col gap-3 bottom-20 left-4">
                  {(() => {
                    const currentActivities = activities?.filter(
                      (activity) =>
                        currentActivityIds?.includes(activity.id) &&
                        activity.linkedModelIds &&
                        activity.linkedModelIds.length > 0
                    );

                    return currentActivities && currentActivities.length > 0 ? (
                      <div className="p-2 border border-blue-200 rounded-lg shadow-sm bg-white/95 backdrop-blur-sm max-w-80">
                        <div className="flex items-center gap-3">
                          {/* Status Indicator */}
                          <div className="flex items-center flex-shrink-0 gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-blue-700 whitespace-nowrap">
                              {t("ifcPlan.activeStatus")}:
                            </span>
                          </div>

                          {/* Activities as compact chips with vertical scroll */}
                          <div className="flex-1 min-w-0">
                            <div className="overflow-y-auto max-h-16 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100">
                              <div className="flex flex-col gap-1">
                                {currentActivities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="flex items-center justify-between gap-2 px-2 py-1 text-xs transition-colors border border-blue-200 rounded bg-blue-50 hover:bg-blue-100"
                                    title={`${activity.name} (${formatDateShort(
                                      activity.startDate
                                    )} - ${formatDateShort(activity.endDate)})`}
                                  >
                                    <span className="flex-1 font-medium text-blue-800 truncate">
                                      {activity.name}
                                    </span>
                                    <span className="flex-shrink-0 font-bold text-blue-600">
                                      {activity.linkedModelIds?.length}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Total count badge */}
                          <div className="flex-shrink-0 text-xs text-gray-500 whitespace-nowrap">
                            {currentActivities.length}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 border border-gray-200 rounded-lg shadow-sm bg-white/95 backdrop-blur-sm max-w-80">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-xs font-semibold text-gray-600">
                            {t("ifcPlan.noActiveActivities")}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 3D Viewer - Takes remaining space */}
                <div
                  ref={containerRef}
                  style={{ width: "100%", height: "100%" }}
                />

                {/* Panel Visibility Toggle */}
                {/* <div className="absolute z-20 top-4 right-20">
                  <button
                    onClick={() => setPanelsVisible(!panelsVisible)}
                    className="flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-lg shadow-md bg-white/90 hover:bg-white"
                  >
                    {panelsVisible ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        {t("ifcPlan.hidePanels")}
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        {t("ifcPlan.showPanels")}
                      </>
                    )}
                  </button>
                </div> */}

                {/* 🔲 Spatial Tree + Properties Panel container */}
                {
                  <>
                    <div
                      id="ui-panels"
                      className="absolute top-20 right-5 flex flex-col gap-4 bg-white/90 p-2 rounded-lg shadow-md max-h-[80vh] overflow-auto"
                      style={{ width: "300px" }}
                    />

                    <div
                      id="properties-panel"
                      className="absolute top-20 left-5 flex flex-col gap-4 bg-white/90 p-2 rounded-lg shadow-md max-h-[80vh] overflow-auto"
                      style={{ width: "300px" }}
                    />
                  </>
                }

                {/* Loading Overlay */}
                {isLoading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1000,
                    }}
                  >
                    <div style={{ color: "white", fontSize: "24px" }}>
                      {t("ifcPlan.loading")}
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "rgba(255,0,0,0.8)",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      zIndex: 1001,
                    }}
                  >
                    {t("ifcPlan.error")}: {error}
                  </div>
                )}

                {/* Upload / Load buttons */}
                {panelsVisible && (canWrite || isAdmin) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      zIndex: 1000,
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {/* <button
                      onClick={}
                      className="w-40 p-4 text-white bg-primary hover:bg-primary-500"
                    >
                      {t("ifcPlan.save")}
                    </button> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline - Full width at bottom */}
      <div className="w-full bg-white border-t border-gray-300 shadow-lg">
        <TimelineScheduling
          activities={activities ?? []}
          applyVisibility={applyVisibility}
          hideAllItems={hideAll}
          showAllItems={showAll}
        />
      </div>
    </div>
  );
};

export default IFCViewer;

// const applyVisibility = async (shouldBeVisible: Set<string>) => {
//   if (!shouldBeVisible.size) return;

//   const hider = componentsRef.current.get(OBC.Hider);
//   hiderRef.current = hider;

//   const ids = Array.from(shouldBeVisible).map((id) => parseInt(id));

//   const modelIdMap: OBC.ModelIdMap = {
//     [modelName]: new Set(ids),
//   };

//   // 🚀 One call: everything in the set is visible, others hidden
//   await hider.set(true, modelIdMap);

//   // Update local cache (optional)
//   currentVisibleIds.clear();
//   ids.forEach((id) => currentVisibleIds.add(id));
//   currentHiddenIds.clear();
// };

// const applyVisibility = useCallback(
//   async (shouldBeVisible: Set<string>) => {
//     if (!hiderRef.current || !fragmentsRef.current) return;

//     try {
//       // Get all possible model IDs from fragments
//       const allModelIds = new Set<string>();
//       for (const [modelId, model] of fragmentsRef.current.list) {
//         // Get all items in this model
//         const allItems = await model.getLocalIds();
//         console.log("🚀 ~ IFCViewer ~ allItems:", allItems);
//         allItems.forEach((item) => allModelIds.add(item.toString()));
//       }

//       // Determine which items to hide (all items minus visible ones)
//       const idsToHide = Array.from(allModelIds).filter(
//         (id) => !shouldBeVisible.has(id)
//       );
//       const idsToShow = Array.from(shouldBeVisible);

//       // Batch visibility updates
//       if (idsToShow.length > 0) {
//         const showModelIdMap: OBC.ModelIdMap = {
//           [modelName]: new Set(idsToShow.map((id) => parseInt(id))),
//         };
//         await hiderRef.current.set(true, showModelIdMap);
//       }

//       if (idsToHide.length > 0) {
//         const hideModelIdMap: OBC.ModelIdMap = {
//           [modelName]: new Set(idsToHide.map((id) => parseInt(id))),
//         };
//         await hiderRef.current.set(false, hideModelIdMap);
//       }
//     } catch (error) {
//       console.error("Apply visibility error:", error);
//     }
//   },
//   [modelName]
// );

// const hideAllItems = async () => {
//   await hiderRef.current?.set(false);
// };
// const showAllItems = async () => {
//   await hiderRef.current?.set(true);
// };

// const currentVisibleIds = new Set<number>();
// const currentHiddenIds = new Set<number>();
// const toggleModelVisibility = async (
//   localIds: string[],
//   visible: boolean
// ) => {
//   if (!localIds.length) return;

//   try {
//     const hider = componentsRef.current.get(OBC.Hider);
//     hiderRef.current = hider;

//     // Deduplicate
//     const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));

//     // Filter against our own cached state instead of re-applying
//     const idsToToggle = numericIds.filter((id) =>
//       visible ? !currentVisibleIds.has(id) : !currentHiddenIds.has(id)
//     );

//     if (!idsToToggle.length) {
//       // nothing changed → no flicker
//       return;
//     }

//     const modelIdMap: OBC.ModelIdMap = {
//       [modelName]: new Set(idsToToggle),
//     };

//     await hider.set(visible, modelIdMap);

//     // Update our cache
//     if (visible) {
//       idsToToggle.forEach((id) => {
//         currentVisibleIds.add(id);
//         currentHiddenIds.delete(id);
//       });
//     } else {
//       idsToToggle.forEach((id) => {
//         currentHiddenIds.add(id);
//         currentVisibleIds.delete(id);
//       });
//     }
//   } catch (error) {
//     console.error("Toggle visibility error:", error);
//     throw error;
//   }
// };
// const formatItemPsets = (rawPsets: FRAG.ItemData[]) => {
//   const result: Record<string, Record<string, any>> = {};
//   for (const [_, pset] of rawPsets.entries()) {
//     const { Name: psetName, HasProperties } = pset;
//     if (!("value" in psetName && Array.isArray(HasProperties))) continue;
//     const props: Record<string, any> = {};
//     for (const [_, prop] of HasProperties.entries()) {
//       const { Name, NominalValue } = prop;
//       if (!("value" in Name && "value" in NominalValue)) continue;
//       const name = Name.value;
//       const nominalValue = NominalValue.value;
//       if (!(name && nominalValue !== undefined)) continue;
//       props[name] = nominalValue;
//     }
//     result[psetName.value] = props;
//   }
//   return result;
// };
// const getItemPropertySets = async (localIds: number[]) => {
//   if (!localIds) return null;
//   const [data] =
//     (await modelRef.current?.getItemsData(localIds, {
//       attributesDefault: false,
//       attributes: ["Name", "NominalValue"],
//       relations: {
//         IsDefinedBy: { attributes: true, relations: true },
//         DefinesOcurrence: { attributes: false, relations: false },
//       },
//     })) ?? [];
//   return (data.IsDefinedBy as FRAG.ItemData[]) ?? [];
// };

// useEffect(() => {
//   if (!highlighterRef.current) return;

//   // Define a custom highlight style for active activities
//   highlighterRef.current.styles.create(
//     "activeActivity",
//     new Set(),
//     worldRef.current!,
//     {
//       color: new THREE.Color(0x3b82f6), // Blue color
//       opacity: 0.8,
//       lineWidth: 2,
//       fillEnabled: true,
//     }
//   );
// }, []);

// // Add this effect to highlight current activities in blue
// useEffect(() => {
//   if (!highlighterRef.current) return;

//   // Define a custom highlight style for active activities
//   highlighterRef.current.styles.create(
//     "activeActivity",
//     new Set(),
//     worldRef.current!,
//     {
//       color: new THREE.Color(0x3b82f6), // Blue color
//       opacity: 0.8,
//       lineWidth: 2,
//       fillEnabled: true,
//     }
//   );
// }, []);

// useEffect(() => {
//   if (!highlighterRef.current || !currentActivityIds.length || !activities) {
//     // Clear highlights when no activities are current
//     if (highlighterRef.current) {
//       highlighterRef.current.clear("activeActivity");
//     }
//     return;
//   }

//   const updateHighlights = async () => {
//     try {
//       // Get all model IDs for current activities
//       const currentActivityModelIds = activities
//         .filter((activity) => currentActivityIds.includes(activity.id))
//         .flatMap((activity) => activity.linkedModelIds || []);
//       console.warn(
//         "🚀 ~ updateHighlights ~ currentActivityModelIds:",
//         currentActivityModelIds
//       );

//       if (currentActivityModelIds.length === 0) {
//         await highlighterRef.current?.clear("activeActivity");
//         return;
//       }

//       // Create ModelIdMap for highlighting
//       const modelIdMap: OBC.ModelIdMap = {
//         [modelName]: new Set(
//           currentActivityModelIds.map((id) => parseInt(id))
//         ),
//       };

//       // Apply blue highlight to current activities
//       await highlighterRef.current?.highlightByID(
//         "activeActivity",
//         modelIdMap,
//         true,
//         false // Don't zoom to selection
//       );

//       console.log("Highlighted current activities:", {
//         activityCount: currentActivityIds.length,
//         elementCount: currentActivityModelIds.length,
//       });
//     } catch (error) {
//       console.error("Error highlighting activities:", error);
//     }
//   };

//   // Debounce to avoid too frequent updates
//   const timeoutId = setTimeout(updateHighlights, 50);

//   return () => {
//     clearTimeout(timeoutId);
//   };
// }, [currentActivityIds, activities, modelName]);
