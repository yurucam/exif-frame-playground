import React from "react";
import { useSettingsStore } from "../store/settingsStore";

function Header() {
  const { openSettings } = useSettingsStore();

  return (
    <header className="header">
      <div className="logo">SVG Playground</div>
      <nav className="nav">
        <button className="nav-item active">SVG 편집기</button>
        <button className="nav-item">예제</button>
        <button className="nav-item">도움말</button>
      </nav>
      <div className="actions">
        <button className="action-button" onClick={openSettings}>
          설정
        </button>
      </div>
    </header>
  );
}

export default Header;
