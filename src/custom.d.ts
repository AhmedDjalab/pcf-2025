declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

declare module "chart.js" {
  interface ChartTypeRegistry {
    customShape: {
      chartOptions: Chart.ChartOptions;
      datasetOptions: Chart.DatasetChartOptions;
      metaExtensions: {
        _customShape: {
          _parsed: boolean;
        };
      };
      parsedDataType: { x: number; y: number; r: number };
      scales: keyof ChartTypeRegistry;
    };
  }
}
declare module "uuid";
declare module "textures";
declare module "react-scroll";
declare module "tailwind-datepicker-react";
declare module "draftjs-to-html";
declare module "html-to-draftjs";
