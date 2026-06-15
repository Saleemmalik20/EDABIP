import React from "react";

export const Loader = ({ fullScreen = false }) => {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "py-8"}`}>
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;