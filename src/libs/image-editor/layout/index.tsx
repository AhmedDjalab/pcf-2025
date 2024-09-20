import React, { useRef } from "react";

type LayoutProps = {
  header?: React.ReactNode;
  navBar?: React.ReactNode;
  settingBar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({
  header,
  navBar,
  settingBar,
  children,
  footer,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden w-full">
      {/* Header */}

      {/* Main Content */}
      <div className="flex flex-1 mt-5 relative z-10">
        {/* Navigation Bar */}
        {navBar && (
          <div className="w-16 bg-transparent h-full flex items-start justify-center">
            {navBar}
          </div>
        )}

        {/* Children Content */}
        <div className="flex-1 relative overflow-y-auto">{children}</div>

        {/* Setting Bar */}
        {settingBar && (
          <div className="w-1/6 bg-transparent h-full relative z-10">
            {settingBar}
          </div>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="h-1/12 bg-transparent relative z-10">{footer}</div>
      )}
    </div>
  );
};

export default Layout;
