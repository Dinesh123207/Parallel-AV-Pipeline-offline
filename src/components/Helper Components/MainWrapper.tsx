import React from "react";

const MainWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex min-h-screen relative">{children}</div>;
};

export default MainWrapper;
