"use client";

import { useCallback, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";

const MAX_FILES = 5;
const MAX_SIZE_MB = 50;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const ALLOWED_LABELS = "JPG, PNG, WEBP, PDF";

interface UploadedFile {
  name: string;
  size: number;
  fileKey: string;
  progress: number; // 0-100
  error?: string;
}

interface FileUploadProps {
  onKeysChange: (keys: string[]) => void;
}

export default function FileUpload({ onKeysChange }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback(
    (updated: UploadedFile[]) => {
      onKeysChange(updated.filter((f) => f.progress === 100 && !f.error).map((f) => f.fileKey));
    },
    [onKeysChange],
  );

  const uploadFile = useCallback(
    async (file: File) => {
      // Validasyon
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFiles((prev) => {
          const next = [
            ...prev,
            { name: file.name, size: file.size, fileKey: "", progress: 0, error: `Desteklenmeyen format (${ALLOWED_LABELS})` },
          ];
          notify(next);
          return next;
        });
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setFiles((prev) => {
          const next = [
            ...prev,
            { name: file.name, size: file.size, fileKey: "", progress: 0, error: `Dosya ${MAX_SIZE_MB}MB'dan büyük` },
          ];
          notify(next);
          return next;
        });
        return;
      }

      // Placeholder satırı ekle
      const idx = files.length; // snapshot alınıyor — güvenilmez, fonksiyon içinde güncel state kullanmak için functional update
      setFiles((prev) => {
        const next = [...prev, { name: file.name, size: file.size, fileKey: "", progress: 1 }];
        notify(next);
        return next;
      });

      try {
        // 1) Presigned URL al
        const { upload_url, file_key } = await api.upload.presigned({
          filename: file.name,
          content_type: file.type,
          file_size: file.size,
        });

        // 2) R2'ye yükle — XMLHttpRequest ile ilerleme takibi
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", upload_url);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setFiles((prev) =>
                prev.map((f) => (f.name === file.name && f.fileKey === "" ? { ...f, progress: pct, fileKey: pct === 100 ? file_key : "" } : f)),
              );
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`R2 ${xhr.status}`));
          };
          xhr.onerror = () => reject(new Error("Ağ hatası"));
          xhr.send(file);
        });

        setFiles((prev) => {
          const next = prev.map((f) =>
            f.name === file.name && !f.error ? { ...f, progress: 100, fileKey: file_key } : f,
          );
          notify(next);
          return next;
        });
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "Yükleme başarısız";
        setFiles((prev) => {
          const next = prev.map((f) =>
            f.name === file.name && f.progress < 100 ? { ...f, error: msg, progress: 0 } : f,
          );
          notify(next);
          return next;
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notify],
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const toUpload = Array.from(fileList).slice(0, MAX_FILES - files.length);
      toUpload.forEach(uploadFile);
    },
    [files.length, uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeFile = (name: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.name !== name);
      notify(next);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={[
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
          dragging ? "border-orange-400 bg-orange-50" : "border-gray-300 hover:border-gray-400",
          files.length >= MAX_FILES ? "opacity-40 pointer-events-none" : "",
        ].join(" ")}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-3xl mb-2">📁</div>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-orange-600">Dosya seç</span> veya buraya sürükle
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {ALLOWED_LABELS} · Maks {MAX_SIZE_MB}MB / dosya · En fazla {MAX_FILES} dosya
        </p>
      </div>

      {/* Dosya listesi */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-lg">{f.error ? "❌" : f.progress === 100 ? "✅" : "⏳"}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-700">{f.name}</p>
                {f.error ? (
                  <p className="text-red-500 text-xs">{f.error}</p>
                ) : f.progress < 100 ? (
                  <div className="h-1.5 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-1.5 bg-orange-500 rounded-full transition-all"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                ) : (
                  <p className="text-green-600 text-xs">Yüklendi</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(f.name)}
                className="text-gray-400 hover:text-red-500 transition-colors text-lg"
                aria-label="Kaldır"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
