import React, { Component, ErrorInfo } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to a logging service here
   
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-100 px-5">
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 shadow-lg">
            <ExclamationCircleIcon
              className="
            h-30 w-30
              text-red-500 "
            />

            <h2 className="mb-4 text-3xl font-semibold text-red-500">
              Something went wrong.
            </h2>
            <p className="text-gray-600">
              we are working on solving this problem right now , please feel
              free to contact us
            </p>
          </div>
        </div>
      );
    }
    //@ts-ignore
    return this.props.children;
  }
}

export default ErrorBoundary;
