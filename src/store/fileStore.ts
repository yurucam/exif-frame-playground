import { create } from "zustand";

export interface UploadedFile {
  id: string;
  name: string;
  nickname: string; // 파일의 닉네임 추가
  type: string; // 'font' 또는 'image'
  dataUrl: string;
  size: number;
  uploadDate: string;
}

interface FileState {
  // 상태
  files: UploadedFile[];
  
  // 액션
  addFile: (file: File) => Promise<void>;
  removeFile: (id: string) => void;
  updateFileNickname: (id: string, nickname: string) => void; // 닉네임 업데이트 함수 추가
  clearFiles: () => void;
  getTotalSize: () => number; // 전체 파일 크기 계산 함수 추가
}

export const useFileStore = create<FileState>()((set, get) => ({
  // 초기 상태
  files: [],
  
  // 전체 파일 크기 계산
  getTotalSize: () => {
    return get().files.reduce((total, file) => total + file.size, 0);
  },
  
  // 파일 추가 - 제한 없이 모든 파일 허용
  addFile: async (file: File) => {
    // 파일 유형 확인
    const isImage = file.type.startsWith("image/");
    const isFont = 
      file.type.includes("font") || 
      file.name.endsWith(".ttf") || 
      file.name.endsWith(".otf") || 
      file.name.endsWith(".woff") || 
      file.name.endsWith(".woff2");
    
    if (!isImage && !isFont) {
      throw new Error("지원하지 않는 파일 형식입니다. 이미지 또는 폰트 파일만 업로드 가능합니다.");
    }
    
    try {
      // 파일을 Data URL로 변환 - 간단하게 처리
      const dataUrl = await new Promise<string>((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(new Error("파일 읽기 실패"));
          reader.readAsDataURL(file);
        } catch (err) {
          reject(new Error("파일 처리 중 오류가 발생했습니다."));
        }
      });
      
      // 파일명에서 확장자를 제외한 이름을 기본 닉네임으로 설정
      let baseNickname = file.name.split('.').slice(0, -1).join('.');
      if (!baseNickname) baseNickname = file.name;
      
      // 중복 닉네임 방지
      let nickname = baseNickname;
      let counter = 1;
      
      // 현재 존재하는 모든 닉네임 확인
      const currentFiles = get().files;
      const existingNicknames = new Set(currentFiles.map(f => f.nickname));
      
      // 중복이 없을 때까지 숫자 증가
      while (existingNicknames.has(nickname)) {
        nickname = `${baseNickname}_${counter}`;
        counter++;
      }
      
      // 새 파일 객체 생성
      const newFile: UploadedFile = {
        id: `${Date.now()}_${file.name}`,
        name: file.name,
        nickname: nickname, // 기본 닉네임 설정
        type: isImage ? "image" : "font",
        dataUrl,
        size: file.size,
        uploadDate: new Date().toISOString(),
      };
      
      // 상태 업데이트
      set((state) => ({
        files: [...state.files, newFile]
      }));
    } catch (error) {
      console.error("파일 처리 오류:", error);
      throw error;
    }
  },
  
  // 닉네임 업데이트
  updateFileNickname: (id: string, nickname: string) => {
    const { files } = get();
    
    // 다른 파일과 닉네임이 중복되는지 체크
    const isDuplicate = files.some(file => file.id !== id && file.nickname === nickname);
    if (isDuplicate) {
      throw new Error("이미 사용 중인 닉네임입니다.");
    }
    
    set((state) => ({
      files: state.files.map(file => 
        file.id === id ? { ...file, nickname } : file
      )
    }));
  },
  
  // 파일 삭제
  removeFile: (id: string) => {
    set((state) => ({
      files: state.files.filter((file) => file.id !== id)
    }));
  },
  
  // 모든 파일 삭제
  clearFiles: () => set({ files: [] }),
}));