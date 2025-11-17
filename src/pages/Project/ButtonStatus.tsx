import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCADStatus } from "src/Services/CADService";

function ButtonStatus({ value, status, url, urn }) {
  const [translationStatus, setTranslationStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Polling function
  const checkStatus = useCallback(async () => {
    if (!urn) return;

    try {
      setIsLoading(true);
      const status = await getCADStatus({ urn: urn });
      setTranslationStatus(status);
    } catch (error) {
      console.error("Error checking CAD status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [urn]);

  // Start/stop polling based on conditions
  useEffect(() => {
    if (!urn) return;

    // Don't start polling if we already have a success status
    if (status === "success" || status === "failed")
      return setTranslationStatus({
        status: status,
      });
    if (translationStatus?.status === "success") return;

    // Start polling immediately and then every 20 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 20000);

    // Cleanup on unmount or when value changes
    return () => {
      clearInterval(interval);
    };
  }, [urn, checkStatus, translationStatus?.status, status]); // Added translationStatus.status to dependencies

  // Define button states based on translation status
  const getButtonState = useCallback(() => {
    if (isLoading) {
      return {
        disabled: true,
        text: "Checking Status...",
        color: "bg-gray-400",
        hover: "hover:bg-gray-500",
        ring: "ring-gray-300",
        icon: "⏳",
      };
    }

    if (!translationStatus) {
      return {
        disabled: false,
        text: "View CAD",
        color: "bg-blue-600",
        hover: "hover:bg-blue-700",
        ring: "ring-blue-300",
        icon: "👁️",
      };
    }

    if (translationStatus.status === "success") {
      return {
        disabled: false,
        text: "View CAD",
        color: "bg-green-600",
        hover: "hover:bg-green-700",
        ring: "ring-green-300",
        icon: "✅",
      };
    }

    if (
      translationStatus.status === "processing" ||
      translationStatus.status === "inprogress"
    ) {
      return {
        disabled: true,
        text: `Processing... ${translationStatus.progress}`,
        color: "bg-yellow-500",
        hover: "hover:bg-yellow-600",
        ring: "ring-yellow-300",
        icon: "🔄",
      };
    }

    // Default/error state
    return {
      disabled: false,
      text: "Check Status",
      color: "bg-blue-600",
      hover: "hover:bg-blue-700",
      ring: "ring-blue-300",
      icon: "🔍",
    };
  }, [translationStatus, isLoading]);

  const handleButtonClick = () => {
    const btnState = getButtonState();

    if (!btnState.disabled) {
      navigate(`/testcad/${value}`);
    }
  };

  const btn = getButtonState();

  return (
    <button
      onClick={handleButtonClick}
      disabled={btn.disabled}
      className={`focus:outline-none text-white no-underline ${btn.color} ${
        btn.hover
      } focus:ring-4 ${
        btn.ring
      } font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 transition-all duration-150 ${
        btn.disabled ? "opacity-100 cursor-not-allowed !text-gray-600" : ""
      }`}
    >
      {btn.icon}
      {btn.text}
    </button>
  );
}

export default ButtonStatus;
