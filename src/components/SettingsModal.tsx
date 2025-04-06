import React, { useState, useEffect } from "react";
import { useSettingsStore, Settings } from "../store/settingsStore";

function SettingsModal() {
  const { settings, isSettingsOpen, updateSettings, closeSettings } =
    useSettingsStore();
  const [tempSettings, setTempSettings] = useState<Settings>(settings);

  // 모달 열릴 때마다 현재 설정으로 초기화
  useEffect(() => {
    setTempSettings(settings);
  }, [isSettingsOpen, settings]);

  if (!isSettingsOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setTempSettings((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setTempSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(tempSettings);
    closeSettings();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>설정</h2>
          <button className="close-button" onClick={closeSettings}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>탭 크기 (공백 수)</label>
            <input
              type="number"
              name="tabSize"
              min="2"
              max="8"
              value={tempSettings.tabSize}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>미리보기 위치</label>
            <select
              name="previewPosition"
              value={tempSettings.previewPosition}
              onChange={handleChange}
            >
              <option value="auto">자동 (화면 크기에 따라)</option>
              <option value="right">오른쪽</option>
              <option value="left">왼쪽</option>
              <option value="bottom">하단</option>
              <option value="top">상단</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={closeSettings}
            >
              취소
            </button>
            <button type="submit" className="save-button">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsModal;
