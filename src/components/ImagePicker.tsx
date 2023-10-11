import React, { useState, ChangeEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface ImagePickerProps {
  onChange: (image: string | null) => void;
  imageValue?: string | null;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ onChange, imageValue }) => {
  const [selectedImage, setSelectedImage] = useState<string | null | undefined>(
    imageValue
  );
  const { t } = useTranslation();

  useEffect(() => {
    setSelectedImage(imageValue);
  }, [imageValue]);
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      const file = e.target.files[0];

      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Image = event.target?.result as string; // Convert image to Base64-encoded string
          setSelectedImage(base64Image);
          onChange(base64Image); // Pass the Base64-encoded string to the parent component
        };
        reader.readAsDataURL(file);
      } else {
        alert(t("imagePicker.selectValidImage"));

        setSelectedImage(null);
        onChange(null);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="imagePickerInput"
      />
      <label
        htmlFor="imagePickerInput"
        className=" cursor-pointer block p-4 border border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-100"
      >
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Selected"
            className="mx-auto mb-2 w-40 h-40"
          />
        ) : (
          <span className="text-gray-400">{t("imagePicker.importLogo")}</span>
        )}
      </label>
    </div>
  );
};

export default ImagePicker;
