import React from "react";
import { useSettingsStore } from "../store/settingsStore";
import { usePageStore, PageType } from "../store/pageStore";

function Header() {
  const { openSettings } = useSettingsStore();
  const { activePage, setActivePage } = usePageStore();

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
  };

  return (
    <header className="header">
      <div className="logo">SVG Playground</div>
      <nav className="nav">
        <button
          className={activePage === "editor" ? "nav-item active" : "nav-item"}
          onClick={() => handlePageChange("editor")}
        >
          SVG 편집기
        </button>
        <button
          className={activePage === "examples" ? "nav-item active" : "nav-item"}
          onClick={() => handlePageChange("examples")}
        >
          예제
        </button>
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
