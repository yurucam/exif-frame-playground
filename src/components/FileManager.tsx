import React, { useRef, useState } from "react";
import { useFileStore, UploadedFile } from "../store/fileStore";
import { useToastStore } from "../store/toastStore";

const FileManager: React.FC = () => {
  const { files, addFile, removeFile, updateFileNickname } = useFileStore();
  const { addToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNickname, setEditingNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  
  // 파일 업로드 핸들러
  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      let successCount = 0;
      let failCount = 0;
      let lastError = "";
      
      // 각 파일 업로드 시도
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          await addFile(file);
          successCount++;
        } catch (error) {
          failCount++;
          lastError = error instanceof Error ? error.message : "알 수 없는 오류";
          console.error("파일 업로드 실패:", file.name, error);
        }
      }
      
      // 결과 메시지 표시
      if (successCount > 0) {
        addToast(`${successCount}개 파일을 업로드했습니다.`, "success");
      }
      
      if (failCount > 0) {
        addToast(`${failCount}개 파일 업로드에 실패했습니다: ${lastError}`, "error");
      }
    } catch (error) {
      addToast(`업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // 파일 선택 창 열기
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // 드래그 앤 드롭 관련 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };
  
  // 파일 삭제
  const handleRemoveFile = (id: string, name: string) => {
    removeFile(id);
    addToast(`${name} 파일을 삭제했습니다.`, "info");
  };
  
  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  
  // 닉네임 편집 시작
  const startEditingNickname = (file: UploadedFile) => {
    setEditingId(file.id);
    setEditingNickname(file.nickname);
    setNicknameError(null);
  };
  
  // 닉네임 중복 체크
  const isNicknameDuplicate = (nickname: string, currentId: string): boolean => {
    return files.some(file => file.id !== currentId && file.nickname === nickname);
  };
  
  // 닉네임 편집 저장
  const saveNickname = () => {
    if (!editingId) return;
    
    const trimmedNickname = editingNickname.trim();
    
    // 빈 닉네임 체크
    if (!trimmedNickname) {
      setNicknameError("닉네임은 필수입니다");
      return;
    }
    
    // 중복 닉네임 체크
    if (isNicknameDuplicate(trimmedNickname, editingId)) {
      setNicknameError("이미 사용 중인 닉네임입니다");
      return;
    }
    
    updateFileNickname(editingId, trimmedNickname);
    addToast("닉네임이 변경되었습니다.", "success");
    setEditingId(null);
    setEditingNickname("");
    setNicknameError(null);
  };
  
  // 닉네임 편집 취소
  const cancelEditingNickname = () => {
    setEditingId(null);
    setEditingNickname("");
    setNicknameError(null);
  };
  
  // 닉네임 입력 변경 처리
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value;
    setEditingNickname(newNickname);
    
    // 실시간 유효성 검사
    if (!newNickname.trim()) {
      setNicknameError("닉네임은 필수입니다");
    } else if (isNicknameDuplicate(newNickname.trim(), editingId || "")) {
      setNicknameError("이미 사용 중인 닉네임입니다");
    } else {
      setNicknameError(null);
    }
  };
  
  // 엔터키 처리
  const handleNicknameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveNickname();
    } else if (e.key === 'Escape') {
      cancelEditingNickname();
    }
  };
  
  // SVG에서 사용할 코드 생성
  const getUsageCode = (file: UploadedFile): string => {
    if (file.type === "image") {
      return `<image href="${file.dataUrl}" id="${file.nickname}" width="100" height="100" />`;
    } else {
      // 폰트 파일인 경우
      return `
@font-face {
  font-family: "${file.nickname}";
  src: url("${file.dataUrl}");
}
text {
  font-family: "${file.nickname}";
}`;
    }
  };
  
  // 코드 복사
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => addToast("코드가 클립보드에 복사되었습니다.", "success"))
      .catch(() => addToast("클립보드 복사에 실패했습니다.", "error"));
  };
  
  // 닉네임 복사
  const copyNickname = (nickname: string) => {
    navigator.clipboard.writeText(nickname)
      .then(() => addToast("닉네임이 클립보드에 복사되었습니다.", "success"))
      .catch(() => addToast("클립보드 복사에 실패했습니다.", "error"));
  };
  
  return (
    <div className="file-manager">
      <div className="file-manager-header">
        <h3>파일 관리</h3>
        <button 
          className="file-upload-button" 
          onClick={openFileSelector}
          disabled={isUploading}
        >
          {isUploading ? "업로드 중..." : "파일 업로드"}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*,.ttf,.otf,.woff,.woff2"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>
      
      <div 
        className={`file-drop-area ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <p>업로드 중입니다...</p>
        ) : (
          <p>파일을 여기에 드래그하세요</p>
        )}
      </div>
      
      <div className="file-list">
        {files.length === 0 ? (
          <div className="no-files-message">
            <p>업로드된 파일이 없습니다.</p>
          </div>
        ) : (
          files.map((file) => (
            <div className="file-item" key={file.id}>
              <div className="file-icon">
                {file.type === "image" ? "🖼️" : "🔤"}
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                
                {/* 닉네임 표시 및 편집 영역 */}
                <div className="file-nickname">
                  {editingId === file.id ? (
                    <div className="nickname-editor">
                      <input 
                        type="text" 
                        value={editingNickname}
                        onChange={handleNicknameChange}
                        onKeyDown={handleNicknameKeyDown}
                        autoFocus
                        placeholder="닉네임 입력 (필수)"
                        className={nicknameError ? "nickname-input-error" : ""}
                      />
                      <div className="nickname-edit-buttons">
                        <button 
                          className={`nickname-save ${nicknameError ? "disabled" : ""}`} 
                          onClick={saveNickname}
                          title="저장"
                          disabled={!!nicknameError || !editingNickname.trim()}
                        >
                          ✓
                        </button>
                        <button 
                          className="nickname-cancel" 
                          onClick={cancelEditingNickname}
                          title="취소"
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="nickname-display">
                      <span 
                        className="nickname-text" 
                        title="클릭하여 클립보드에 복사"
                        onClick={() => copyNickname(file.nickname)}
                      >
                        {file.nickname}
                      </span>
                      <button 
                        className="nickname-edit-button" 
                        onClick={() => startEditingNickname(file)}
                        title="닉네임 편집"
                        type="button"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  {editingId === file.id && nicknameError && (
                    <div className="nickname-error">{nicknameError}</div>
                  )}
                </div>
                
                <div className="file-meta">
                  {formatFileSize(file.size)} • 
                  {new Date(file.uploadDate).toLocaleDateString()}
                </div>
                
                {file.type === "image" && (
                  <div className="file-preview">
                    <img src={file.dataUrl} alt={file.name} />
                  </div>
                )}
              </div>
              <div className="file-actions">
                <button 
                  className="file-copy-button" 
                  onClick={() => copyToClipboard(getUsageCode(file))}
                  title="SVG 코드 복사"
                >
                  복사
                </button>
                <button 
                  className="file-delete-button" 
                  onClick={() => handleRemoveFile(file.id, file.name)}
                  title="파일 삭제"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FileManager;