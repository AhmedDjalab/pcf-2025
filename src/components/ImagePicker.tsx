import imageCompression from "browser-image-compression";
import React, { useState, ChangeEvent, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import api from "src/utils/api";
import { UploadImagesUrl, siteName } from "src/variables/Urls";

interface ImagePickerProps {
  onChange: (image: string | null) => void;
  setFileName: (name: string) => void;
  imageValue?: string | null;
  disabled?: boolean;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  onChange,
  imageValue,
  setFileName,
  disabled,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    imageValue || null
  ); // Set initial value to null if imageValue is not provided
  const isDevelopment = process.env.REACT_APP_ENV === "development";

  const { t } = useTranslation();
  // const url = useMemo(
  //   () => (),
  //   [selectedImage, isDevelopment]
  // );

  useEffect(() => {
    setSelectedImage(imageValue || null); // Update selectedImage if imageValue changes
  }, [imageValue]);

  const handleUpload = async (file: File) => {
    let formData = new FormData();

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
    });

    const compressedAsFile = new File([compressedFile], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    });

    formData.append("image", compressedAsFile);

    return api
      .post(UploadImagesUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        if (response.status === 200) {
          const fullUrl = isDevelopment
            ? siteName + response.data
            : response.data;

          return fullUrl;
        }
      })
      .catch((ex) => {
        console.error("🚀 ~ file: graphSlice.ts:189 ~ > ~ response:", ex);
        return null;
      });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      const file = e.target.files[0];

      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Image = event.target?.result as string;
          setFileName(file.name);
          // onChange(base64Image);
        };
        reader.readAsDataURL(file);
        var imageUrl = await handleUpload(file);
        onChange(imageUrl);
        setSelectedImage(imageUrl);
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
        disabled={disabled}
      />
      <label
        htmlFor="imagePickerInput"
        className="cursor-pointer block p-4 border border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-100"
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
