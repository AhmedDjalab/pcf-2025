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

const IFCViewer = () => {
  const { id } = useParams();
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
  const [modelName, setModelName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [selectedModelIdMap, setSelectedModelIdMap] =
    useState<OBC.ModelIdMap>();
  const [modelMapIds, setModelMapIds] = useState<Record<string, number[]>>({});
  const html = document.querySelector("html")!;

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

      await components.init();

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
      highlighter.setup({
        world,
      });
      highlighterRef.current = highlighter;
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
      // const fragmentsManager = componentsRef.current.get(OBC.FragmentsManager);

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
  const toggleModelVisibility = async (
    localIds: string[],
    visible?: boolean
  ) => {
    const modelIdMap: OBC.ModelIdMap = {};
    modelIdMap[modelName] = new Set(localIds.map((l) => parseInt(l)));

    if (visible === true) {
      // Show specific items
      await hiderRef.current?.show(modelIdMap);
    } else if (visible === false) {
      // Hide specific items
      await hiderRef.current?.hide(modelIdMap);
    } else {
      // Toggle if no visibility specified
      await hiderRef.current?.toggle(modelIdMap);
    }
  };

  const hideAllItems = async () => {
    await hiderRef.current?.set(false);
  };
  const showAllItems = async () => {
    await hiderRef.current?.set(true);
  };

  const toggleModelIsolated = async (localIds: string[], visible?: boolean) => {
    if (!selectedModelIdMap) return;

    const modelIdMap: OBC.ModelIdMap = {};

    modelIdMap[modelName] = new Set(localIds.map((l) => parseInt(l)));
    console.log("🚀 ~ toggleModelVisibility ~ modelIdMap:", modelIdMap);
    await hiderRef.current?.isolate(modelIdMap);
  };
  const handleSaveBimData = () => {
    const activitiesWithLinkedModel: BimDataModel[] =
      activities
        ?.filter((a) => a.linkedModelIds && a.linkedModelIds.length > 0) // keep only activities with linked models
        .map((a) => ({
          linkedModelIds: a.linkedModelIds,
          activityId: a.id,
          persistAfterEnd: a.persistAfterEnd,
        })) ?? [];

    console.log(
      "🚀 ~ handleSaveBimData ~ activitiesWithLinkedModel:",
      activitiesWithLinkedModel
    );

    saveBimData({
      projectId: id,
      activityBimLinkeds: activitiesWithLinkedModel,
    });
  };

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

  return projectsLoading ? (
    <Spinner />
  ) : (
    <div className="flex w-full h-screen">
      {/* Left panel */}
      <ActivitiesPanel
        setActivities={setActivities}
        activities={
          activities?.sort(
            (a, b) =>
              (b.linkedModelIds?.length ?? 0) - (a.linkedModelIds?.length ?? 0)
          ) ?? []
        }
        onLink={(ac, modelId) => console.log("thos ", ac, modelId)}
        getSelectedModelIds={() => selectedModelIds}
        toggleVisibilty={(localId) => toggleModelVisibility(localId)}
        isolateItem={(localId) => toggleModelIsolated(localId)}
        resetIsolated={(localId) => toggleModelVisibility(localId, true)}
      />

      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <div className="absolute z-10 top-4 left-4">
          <AutomaticLinkingModal
            setActivities={setActivities}
            activities={activities ?? []}
            modelRef={modelRef}
          />
        </div>
        {/* <input
          value={search}
          onChange={async (e) => {
            var value = e.target.value;
            setSearch(value);
            if (spatialTreeRef.current) {
              spatialTreeRef.current.queryString = value;
            }

            const data = spatialTreeRef.current?.value;
            console.log("🚀 ~ data:", data);
            // //! let get all local ids
            // var localIds = (await modelRef.current?.getLocalIds()) ?? [];

            // const elementData = await modelRef.current?.getItemsData(localIds, {
            //   attributesDefault: true,
            //   relations: {
            //     HasProperties: { attributes: true, relations: false },
            //     DefinesOcurrence: { attributes: true, relations: false },
            //   },
            // });

            // const testdata = await getItemPropertySets(localIds);
            // const fromated = await formatItemPsets(testdata!);
            // const sycnhCode = findSynchroCodes(
            //   testdata! as unknown as PropertySet[]
            // );

            if (!elementData) {
              return;
            } // Direct attributes are in the main object
            console.log("Direct attributes:", elementData, testdata);
            console.log("formated attributes:", fromated);
            console.log("sycnhoc attributes:", sycnhCode);

            // Property sets are in IsDefinedBy array
          }}
          className="absolute h-20 text-white bg-red-400 left-80 top-10 w-200"
        /> */}
        {/* 3D Viewer */}
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        <div className="absolute flex justify-center w-full p-2 overflow-auto rounded-lg shadow-md bottom-5 bg-white/90">
          <TimelineScheduling
            activities={activities ?? []}
            toggleVisibility={(localId) => toggleModelVisibility(localId)}
            hideAllItems={hideAllItems}
            showAllItems={showAllItems}
          />
        </div>
        {/* 🔲 Spatial Tree + Properties Panel container */}
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
            <div style={{ color: "white", fontSize: "24px" }}>Loading...</div>
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
            Error: {error}
          </div>
        )}

        {/* Upload / Load buttons */}
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
          <button
            onClick={handleSaveBimData}
            className="w-40 p-4 text-white bg-primary hover:bg-primary-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default IFCViewer;
