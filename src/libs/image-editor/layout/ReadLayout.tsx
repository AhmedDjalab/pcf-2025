import React, { useRef } from "react";

type ReadLayoutProps = {
  settingBar?: React.ReactNode;

  children: React.ReactNode;
};

const ReadLayout: React.FC<ReadLayoutProps> = ({ settingBar, children }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-screen overflow-x-scroll w-full">
      {/* Header */}

      {/* Main Content */}
      <div className="flex flex-1 mt-5 relative z-10">
        <div className="flex-1 relative overflow-y-auto  ">{children}</div>

        {settingBar && (
          <div className="w-2/6 bg-transparent h-full relative z-10 ">
            {settingBar}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadLayout;
