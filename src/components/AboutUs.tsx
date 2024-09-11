// AboutUsComponent.tsx

import React from "react";

import {
  EnvelopeIcon,
  CircleStackIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

import logo from "src/assets/Logo/logo.png";
import companyLogo from "src/assets/Logo/companyLogo.png";
import DefaultLayout from "./DefaultLayout";
//@ts-ignore
// import { ImageEditorModule } from "react-image-editor/src";
//@ts-ignore
const AboutUs: React.FC = () => {
  const { t } = useTranslation();

  const initialData = [
    {
      id: "pgux0s2Tsj3ML4qOutx18",
      attrs: {
        name: "label-target",
        "data-item-type": "image",
        x: 10,
        y: 10,
        width: 800,
        height: 536.0406091,
        src: "https://fastly.picsum.photos/id/7/4728/3168.jpg?hmac=c5B5tfYFM9blHHMhuu4UKmhnbZoJqrzNOP9xjkV4w3o",
        draggable: false,
        zIndex: 0,
        brightness: 0,
        _filters: ["Brighten"],
        updatedAt: 1725720581592,
      },
      className: "sample-image",
      children: [],
    },
    {
      id: "TkO-e432vaxICj_FrNh-n",
      attrs: {
        name: "label-target",
        "data-item-type": "shape",
        fill: "#b01212",
        sides: 4,
        radius: 400,
        zIndex: 0,
        brightness: 0,
        updatedAt: 1725720600961,
        id: "TkO-e432vaxICj_FrNh-n",
        opacity: 1,
        rotation: 0,
        draggable: true,
        skewX: 0,
        skewY: 0,
        x: 0.5695709036749236,
        y: 0.44102302323124437,
        width: 0.035355339059327376,
        height: 0.05276516511491648,
        scaleX: 2.312784108959506,
        scaleY: 6.259402173624204,
      },
      className: "sample-shape",
      children: [],
    },
  ];

  const exportToJosn = (data: any[]) => {
    // Convert the normalized data to JSON
    const shapesData = JSON.stringify(data, null, 2);

    // Create a blob with the JSON data
    const blob = new Blob([shapesData], { type: "application/json" });

    // Create a link element to trigger the download
    const link = document.createElement("a");
    link.download = "shapes.json";
    link.href = URL.createObjectURL(blob);

    // Append the link to the document, click it to start the download, then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <DefaultLayout>
      <div className=" dark:bg-boxdark  h-screen flex flex-col items-center justify-center space-y-8">
        <div className="flex space-x-4 my-10">
          <img src={logo} alt="PCF" className="h-40 w-80" />
          <img src={companyLogo} alt="Logo 2" className="h-40 w-80" />
        </div>
        <p className="text-center dark:text-white text-gray-500 ">
          {t("AboutUs.welcomingMessage")}
        </p>
        <p className="text-center dark:text-white text-gray-500 ">
          {t("AboutUs.description")}
        </p>

        <hr />
        {/* <ImageEditorModule
          imgUrl="https://fastly.picsum.photos/id/7/4728/3168.jpg?hmac=c5B5tfYFM9blHHMhuu4UKmhnbZoJqrzNOP9xjkV4w3o"
          onSaveState={(data) => {
            console.warn("🚀 ~ data:", data);
            exportToJosn(data);
          }}
          initialStageData={initialData}
        /> */}
        <span className="text-gray-500 dark:text-white">
          {t("AboutUs.isProductOF")}
        </span>
        <div className="flex space-x-4 items-center">
          <EnvelopeIcon className="h-8 w-8 text-blue-600" />
          <span>{t("AboutUs.Contact")}</span>
          <span className="text-blue-600">admin@ientreprize.com</span>
        </div>

        <div className="flex space-x-4 items-center">
          <GlobeAltIcon className="h-8 w-8 text-blue-600" />
          <span>{t("AboutUs.Explore")}</span>
          <span className="text-blue-600">
            <a
              href="https://www.ientreprize.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.ientreprize.com
            </a>
          </span>
        </div>

        <div className="text-center text-gray-500 text-sm dark:text-white">
          &copy; {new Date().getFullYear()} iEntrepriZe.
          {t("AboutUs.Allrightsreserved")}.
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AboutUs;
