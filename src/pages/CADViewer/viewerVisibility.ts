// viewerVisibility.ts
export const viewerVisibility = (
  viewRef: React.MutableRefObject<Autodesk.Viewing.GuiViewer3D | null>,
  url: string
) => {
  const visibleIds = new Set<number>();
  const currentVisibleSet = new Set<string>();
  const isUpdating = { current: false };
  const pendingUpdate = { current: null as Set<string> | null };
  let modelPromise: Promise<Autodesk.Viewing.Model> | null = null;

  const loadModel = async (url: string) => {
    const viewer = viewRef.current;
    if (!viewer) return;

    return new Promise<Autodesk.Viewing.Model>((resolve, reject) => {
      setTimeout(() => {
        viewer.loadModel(
          url,
          {},
          (model) => {
            console.log("📦 Model loaded", url);
            resolve(model);
          },
          (err) => {
            console.error("❌ Model load failed", err);
            reject(err);
          }
        );
      }, 100);
    });
  };

  const applyVisibility = async (shouldBeVisible: Set<string>) => {
    console.log("🚀 ~ applyVisibility ~ shouldBeVisible:", shouldBeVisible);
    const viewer = viewRef.current as Autodesk.Viewing.GuiViewer3D;
    if (!viewer) return;

    const model = viewer.model;
    if (!model) {
      try {
        await loadModel(url);
      } catch (e) {
        console.error("❌ Cannot apply visibility because model failed", e);
        return;
      }
    }

    if (isUpdating.current) {
      pendingUpdate.current = shouldBeVisible;
      return;
    }

    const hasChanges =
      shouldBeVisible.size !== currentVisibleSet.size ||
      ![...shouldBeVisible].every((id) => currentVisibleSet.has(id));

    if (!hasChanges) return;

    isUpdating.current = true;

    try {
      const toShow = new Set<number>();
      const toHide = new Set<number>();

      shouldBeVisible.forEach((id) => {
        const num = parseInt(id);
        if (!currentVisibleSet.has(id)) toShow.add(num);
      });

      currentVisibleSet.forEach((id) => {
        const num = parseInt(id);
        if (!shouldBeVisible.has(id)) toHide.add(num);
      });

      const vm = viewer.impl.visibilityManager;
      const tree = model.getData().instanceTree;
      const frags = model.getFragmentList();

      //
      // ✅ SHOW ITEMS
      //
      if (toShow.size > 0) {
        toShow.forEach((id) => {
          // 1) Restore fragment visibility
          tree.enumNodeFragments(id, (fragId: number) => {
            frags.setVisibility(fragId, true);
          });

          // 2) Restore node visibility flag
          vm.setNodeOff(id, false);

          visibleIds.add(id);
        });
      }

      //
      // ❌ HIDE ITEMS
      //
      if (toHide.size > 0) {
        toHide.forEach((id) => {
          tree.enumNodeFragments(id, (fragId: number) => {
            frags.setVisibility(fragId, false);
          });

          vm.setNodeOff(id, true);

          visibleIds.delete(id);
        });
      }

      viewer.impl.invalidate(true, true, true);

      currentVisibleSet.clear();
      shouldBeVisible.forEach((x) => currentVisibleSet.add(x));

      console.log("Batch visibility updated:", {
        shown: toShow.size,
        hidden: toHide.size,
        totalVisible: shouldBeVisible.size,
      });
    } catch (e) {
      console.error("❌ applyVisibility error:", e);
    } finally {
      isUpdating.current = false;

      if (pendingUpdate.current) {
        const next = pendingUpdate.current;
        pendingUpdate.current = null;
        await applyVisibility(next);
      }
    }
  };
  function showEverythingRestoreDefaults(
    viewer: Autodesk.Viewing.GuiViewer3D,
    model: any
  ) {
    if (!viewer || !model) return;

    // 1) Reset viewer effects
    viewer.setGhosting(false);

    viewer.clearSelection();
    viewer.isolate([]);

    // 2) Reset background to normal grey (or whatever you want)
    viewer.setBackgroundColor(255, 255, 255, 255, 255, 255);

    const tree = model.getData().instanceTree;
    const frags = model.getFragmentList();
    const vm = viewer.impl.visibilityManager;

    // 3) Restore ALL FRAGMENTS (critical)
    tree.enumNodeFragments(tree.getRootId(), (fragId: number) => {
      frags.setVisibility(fragId, true);
    });

    // 4) Restore ALL NODE visibility
    if (vm && vm.setNodeOff) {
      vm.setNodeOff(tree.getRootId(), false);
      vm.setAllVisibility(true);
    }

    // 5) Force full redraw
    viewer.impl.invalidate(true, true, true);

    console.log("🔄 All items restored successfully");
  }

  const showAllModels = async () => {
    const viewer = viewRef.current;
    if (!viewer || !viewer.model) return;

    showEverythingRestoreDefaults(viewer, viewer.model);

    visibleIds.clear();
    console.log("✅ All models fully restored");
  };

  /** 👁 Hide all elements in the model – Updated to match hideEverything logic */
  const hideAllModels = async () => {
    const viewer = viewRef.current;
    if (!viewer || !viewer.model) return;

    hideEverythingAndMakeWhite(viewer, viewer.model);

    visibleIds.clear();
    console.log("✅ All models hidden (no ghosting, white canvas)");
  };

  /** 👁 NO ghosting – white canvas – hide all */
  function hideEverythingAndMakeWhite(viewer, model) {
    if (!viewer || !model) return;

    viewer.setGhosting(false);
    viewer.clearSelection();
    viewer.isolate([]);

    viewer.setBackgroundColor(255, 255, 255, 255, 255, 255);

    const tree = model.getData().instanceTree;
    const frags = model.getFragmentList();

    // Hide ALL fragments in the model
    tree.enumNodeFragments(tree.getRootId(), (fragId) => {
      frags.setVisibility(fragId, false);
    });

    // Internal reliability layer
    const vm = viewer.impl.visibilityManager;
    if (vm && vm.setNodeOff) vm.setNodeOff(tree.getRootId(), true);

    viewer.impl.invalidate(true, true, true);
  }

  const deleteAll = () => {
    const viewer = viewRef.current;
    if (!viewer) return;

    if (viewer.model) {
      viewer.unloadModel(viewer.model);
    }

    viewer.impl.sceneUpdated(true);
  };

  /** 🔄 Toggle visibility */
  const toggleModelVisibility = async (localIds: string[]) => {
    if (!localIds?.length) return;
    const viewer = viewRef.current;
    if (!viewer) return;

    const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));

    numericIds.forEach((id) => {
      const isVisible = viewer.isNodeVisible(id);
      if (isVisible) {
        viewer.impl.visibilityManager.setNodeOff(id, true);
        visibleIds.delete(id);
      } else {
        viewer.impl.visibilityManager.setNodeOff(id, false);
        visibleIds.add(id);
      }
    });

    viewer.impl.invalidate(true, true, true);

    console.log("🔁 Toggled visibility for:", numericIds);
  };

  /** 🎯 Isolate specific dbIds */
  const toggleModelIsolated = async (localIds: string[], visible?: boolean) => {
    if (!localIds?.length) return;
    const viewer = viewRef.current;
    if (!viewer) return;

    const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));

    if (visible === false) {
      viewer.showAll();
      viewer.isolate([]);
      console.log("🔙 Isolation cleared");
    } else {
      viewer.isolate(numericIds);
      console.log("🎯 Isolated:", numericIds);
    }
  };

  /** 👁 Set visibility directly */
  const handleVisibilty = async (localIds: string[], visible: boolean) => {
    if (!localIds?.length) return;
    const viewer = viewRef.current;
    if (!viewer) return;

    const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));
    const vm = viewer.impl.visibilityManager;

    if (visible) {
      numericIds.forEach((id) => vm.setNodeOff(id, false));
      numericIds.forEach((id) => visibleIds.add(id));
    } else {
      numericIds.forEach((id) => vm.setNodeOff(id, true));
      numericIds.forEach((id) => visibleIds.delete(id));
    }

    viewer.impl.invalidate(true, true, true);

    console.log(`👁 visibility=${visible} ids:`, numericIds);
  };

  return {
    showAllModels,
    toggleModelVisibility,
    toggleModelIsolated,
    handleVisibilty,
    hideAllModels,
    applyVisibility,
    deleteAll,
    hideEverythingAndMakeWhite,
  };
};
