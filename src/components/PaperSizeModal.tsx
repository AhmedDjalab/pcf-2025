import React from "react";
import { useTranslation } from "react-i18next";

type PaperSizeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paperSize: string, orientation: string) => void;
};

const PaperSizeModal: React.FC<PaperSizeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [selectedSize, setSelectedSize] = React.useState<string>("A4");
  const [selectedOrientation, setSelectedOrientation] =
    React.useState<string>("portrait");

  const handleSave = () => {
    onSave(selectedSize, selectedOrientation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed  left-0 top-0 z-50 flex w-full h-full items-center justify-center bg-white bg-opacity-10  dark:bg-gray-700 dark:bg-opacity-20">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[30%]">
        <h2 className="text-lg font-semibold mb-4">
          {t("PaperSizeModal.selectTitle")}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {t("PaperSizeModal.paperSizeLabel")}
          </label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mb-4"
          >
            <option value="A3">A3</option>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {t("PaperSizeModal.orientationLabel")}
          </label>
          <select
            value={selectedOrientation}
            onChange={(e) => setSelectedOrientation(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mb-4"
          >
            <option value="portrait">{t("PaperSizeModal.portrait")}</option>
            <option value="landscape">{t("PaperSizeModal.landscape")}</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 bg-gray-300 p-2 rounded">
            {t("PaperSizeModal.cancel")}
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {t("PaperSizeModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaperSizeModal;
