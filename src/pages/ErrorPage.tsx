import React from "react";
import { useTranslation } from "react-i18next";
import DefaultLayout from "src/components/DefaultLayout";

const ErrorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section>
        <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
          <div className="mx-auto max-w-screen-sm text-center">
            <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-primary-600 dark:text-primary-500 lg:text-9xl">
              Ooops ..!
            </h1>
            <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              NetWork Error
            </p>
            <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
              Unexpected Error Happening please Check your internet Connection ,
              and try after minute . call the support if the issue presist
            </p>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default ErrorPage;
