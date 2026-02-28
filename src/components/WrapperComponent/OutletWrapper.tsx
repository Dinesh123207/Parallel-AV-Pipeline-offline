import React from "react";

const OutletWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="bg-primary_bg text-slate-200 px-4 py-16 flex flex-col gap-12 min-h-[100dvh] overflow-auto pb-8 custom-scrollbar">
      {children}
    </div>
  );
};

export default OutletWrapper;
