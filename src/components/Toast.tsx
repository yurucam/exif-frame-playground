import React, { useEffect } from "react";
import { useToastStore, Toast as ToastType } from "../store/toastStore";

interface ToastProps {
  toast: ToastType;
}

// 개별 토스트 컴포넌트
const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToastStore();

  // 토스트 타입에 따른 스타일 클래스
  const getToastClass = () => {
    switch (toast.type) {
      case "success":
        return "toast-success";
      case "error":
        return "toast-error";
      case "warning":
        return "toast-warning";
      case "info":
      default:
        return "toast-info";
    }
  };

  // 토스트 아이콘
  const getToastIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <div className={`toast ${getToastClass()}`}>
      <div className="toast-icon">{getToastIcon()}</div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close" onClick={() => removeToast(toast.id)}>
        ✕
      </button>
    </div>
  );
};

// 토스트 컨테이너 컴포넌트
const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
