import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const Notification = ({ message, type = "success", isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const icon =
    type === "success" ? (
      <CheckCircle2 size={20} className="text-green-600" />
    ) : (
      <AlertCircle size={20} className="text-red-600" />
    );

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} ${textColor} px-4 py-3 rounded-lg border flex items-center space-x-3 shadow-lg z-50 max-w-sm`}
    >
      {icon}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/50 rounded transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;
