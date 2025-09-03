// components/ui/button.jsx
import React from "react";

export function Button({ children, className, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 
        bg-purple-600 hover:bg-purple-700 text-white shadow-md ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
