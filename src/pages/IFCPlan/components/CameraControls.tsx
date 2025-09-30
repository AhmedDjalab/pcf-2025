import React, { useCallback, useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import * as THREE from "three";

interface CameraControlsProps {
  worldRef: React.MutableRefObject<any>;
  fragmentsRef: React.MutableRefObject<any>;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  worldRef,
  fragmentsRef,
}) => {
  const panSpeed = 5;
  const zoomSpeed = 2;

  const panCamera = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!worldRef.current?.camera) return;

      const camera = worldRef.current.camera.three;
      const controls = worldRef.current.camera.controls;

      // Get current camera direction vectors
      const offset = new THREE.Vector3();

      switch (direction) {
        case "up":
          offset.set(0, panSpeed, 0);
          break;
        case "down":
          offset.set(0, -panSpeed, 0);
          break;
        case "left":
          // Pan left relative to camera view
          const leftVector = new THREE.Vector3();
          camera.getWorldDirection(leftVector);
          leftVector.cross(camera.up).normalize().multiplyScalar(panSpeed);
          offset.copy(leftVector);
          break;
        case "right":
          // Pan right relative to camera view
          const rightVector = new THREE.Vector3();
          camera.getWorldDirection(rightVector);
          rightVector.cross(camera.up).normalize().multiplyScalar(-panSpeed);
          offset.copy(rightVector);
          break;
      }

      // Update camera and target position
      camera.position.add(offset);
      if (controls.target) {
        controls.target.add(offset);
      }
      controls.update();
    },
    [panSpeed]
  );

  const zoomCamera = useCallback(
    (direction: "in" | "out") => {
      if (!worldRef.current?.camera) return;

      const camera = worldRef.current.camera.three;
      const controls = worldRef.current.camera.controls;

      const zoomDirection = new THREE.Vector3();
      camera.getWorldDirection(zoomDirection);
      zoomDirection
        .normalize()
        .multiplyScalar(direction === "in" ? zoomSpeed : -zoomSpeed);

      camera.position.add(zoomDirection);
      controls.update();
    },
    [zoomSpeed]
  );

  const resetCamera = useCallback(async () => {
    if (!worldRef.current?.camera) return;

    // Reset to initial view
    await worldRef.current.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);
  }, []);

  const fitToView = useCallback(() => {
    if (!worldRef.current?.camera || !fragmentsRef.current) return;

    // Fit all models in view
    for (const [, model] of fragmentsRef.current.list) {
      worldRef.current.camera.controls.fitToSphere(model.object, true);
      break; // Fit to first model
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          panCamera("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          panCamera("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          panCamera("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          panCamera("right");
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomCamera("in");
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomCamera("out");
          break;
        case "r":
        case "R":
          e.preventDefault();
          resetCamera();
          break;
        case "f":
        case "F":
          e.preventDefault();
          fitToView();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [panCamera, zoomCamera, resetCamera, fitToView]);

  return (
    <div className="absolute z-20 flex flex-col gap-2 bottom-4 right-4">
      {/* Direction Controls */}
      <div className="p-2 bg-white border border-gray-300 rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-1">
          {/* Up Arrow */}
          <button
            onClick={() => panCamera("up")}
            className="p-2 transition-colors bg-gray-100 rounded hover:bg-blue-100 active:bg-blue-200"
            title="Pan Up (↑)"
          >
            <ArrowUp className="w-5 h-5 text-gray-700" />
          </button>

          {/* Left, Center, Right */}
          <div className="flex gap-1">
            <button
              onClick={() => panCamera("left")}
              className="p-2 transition-colors bg-gray-100 rounded hover:bg-blue-100 active:bg-blue-200"
              title="Pan Left (←)"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={fitToView}
              className="p-2 transition-colors bg-gray-100 rounded hover:bg-green-100 active:bg-green-200"
              title="Fit to View (F)"
            >
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={() => panCamera("right")}
              className="p-2 transition-colors bg-gray-100 rounded hover:bg-blue-100 active:bg-blue-200"
              title="Pan Right (→)"
            >
              <ArrowRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Down Arrow */}
          <button
            onClick={() => panCamera("down")}
            className="p-2 transition-colors bg-gray-100 rounded hover:bg-blue-100 active:bg-blue-200"
            title="Pan Down (↓)"
          >
            <ArrowDown className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex gap-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg">
        <button
          onClick={() => zoomCamera("in")}
          className="px-3 py-2 text-lg font-bold transition-colors bg-gray-100 rounded hover:bg-blue-100 active:bg-blue-200"
          title="Zoom In (+)"
        >
          +
        </button>
        <button
          onClick={() => zoomCamera("out")}
          className="px-3 py-2 text-lg font-bold transition-colors bg-gray-100 rounded hover:bg-blue-100 active:bg-blue-200"
          title="Zoom Out (-)"
        >
          −
        </button>
      </div>

      {/* Reset Camera */}
      <button
        onClick={resetCamera}
        className="flex items-center justify-center gap-2 p-2 text-sm text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 active:bg-blue-800"
        title="Reset Camera (R)"
      >
        <RotateCcw className="w-4 h-4" />
        Reset View
      </button>

      {/* Keyboard Shortcuts Info */}
      <div className="p-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="mb-1 font-semibold">Keyboard:</div>
        <div>Arrows: Pan</div>
        <div>+/-: Zoom</div>
        <div>F: Fit view</div>
        <div>R: Reset</div>
      </div>
    </div>
  );
};

export default CameraControls;
