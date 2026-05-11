"use client";

import { useEffect, useState } from "react";
import { api, Avatar } from "@/lib/api";

interface AvatarPickerProps {
  value: string | null;
  onChange: (avatarId: string) => void;
}

const STYLE_LABEL: Record<string, string> = {
  profesyonel: "Profesyonel",
  samimi: "Samimi",
  enerjik: "Enerjik",
};

const GENDER_LABEL: Record<string, string> = {
  erkek: "Erkek",
  kadın: "Kadın",
};

export default function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.avatars
      .list()
      .then(setAvatars)
      .catch(() => setError("Avatarlar yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {avatars.map((avatar) => {
        const selected = value === avatar.id;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.id)}
            className={[
              "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all",
              selected
                ? "border-orange-500 ring-2 ring-orange-300"
                : "border-gray-200 hover:border-gray-300",
            ].join(" ")}
          >
            {/* Thumbnail */}
            <div className="aspect-[3/4] bg-gray-100 w-full relative">
              {avatar.preview_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar.preview_url}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                  👤
                </div>
              )}
              {selected && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </div>
            {/* Info */}
            <div className="p-2 text-left">
              <p className="text-sm font-semibold text-gray-800 truncate">{avatar.name}</p>
              <p className="text-xs text-gray-500">
                {GENDER_LABEL[avatar.gender] ?? avatar.gender} ·{" "}
                {STYLE_LABEL[avatar.style] ?? avatar.style}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
