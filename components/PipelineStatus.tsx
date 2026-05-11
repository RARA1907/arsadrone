"use client";

import { useEffect, useState } from "react";
import { api, JobStatus } from "@/lib/api";

const STEPS: { key: string; label: string; icon: string }[] = [
  { key: "tts",          label: "Ses üretiliyor",         icon: "🎙️" },
  { key: "avatar",       label: "Avatar hazırlanıyor",     icon: "🤖" },
  { key: "drone",        label: "Drone efekti (Kling AI)", icon: "🚁" },
  { key: "birlestirme",  label: "Sahneler birleştiriliyor",icon: "🎬" },
  { key: "muzik",        label: "Müzik miksajı",           icon: "🎵" },
  { key: "render",       label: "Video yükleniyor",        icon: "☁️" },
  { key: "tamamlandi",   label: "Tamamlandı",              icon: "✅" },
];

const STEP_ORDER = STEPS.map((s) => s.key);

interface PipelineStatusProps {
  jobId: string;
  onComplete?: () => void;
}

export default function PipelineStatus({ jobId, onComplete }: PipelineStatusProps) {
  const [job, setJob]     = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        try {
          const data = await api.jobs.get(jobId);
          if (!cancelled) {
            setJob(data);
            if (data.status === "tamamlandi") { onComplete?.(); break; }
            if (data.status === "hata") break;
          }
        } catch {
          if (!cancelled) setError("Job durumu alınamadı");
          break;
        }
        await new Promise((r) => setTimeout(r, 30_000));
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [jobId, onComplete]);

  if (error) {
    return (
      <div className="rounded-lg px-3 py-2 text-sm"
        style={{ background: "color-mix(in srgb, var(--ad-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ad-red) 20%, transparent)", color: "var(--ad-red)" }}>
        {error}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center gap-2 text-sm animate-pulse" style={{ color: "var(--ad-muted)" }}>
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--ad-orange)" }} />
        Durum yükleniyor...
      </div>
    );
  }

  const currentIdx = STEP_ORDER.indexOf(job.status);
  const isError    = job.status === "hata";

  return (
    <div className="space-y-1.5">
      {STEPS.map((step, i) => {
        const stepIdx = i;
        const done    = currentIdx > stepIdx;
        const active  = currentIdx === stepIdx;

        return (
          <div key={step.key} className="flex items-center gap-3 py-1.5 px-3 rounded-lg transition-colors"
            style={active ? { background: "color-mix(in srgb, var(--ad-orange) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--ad-orange) 20%, transparent)" } : {}}>

            {/* Step circle */}
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={
                done    ? { background: "var(--ad-green)", color: "#fff" }
                : active  ? { background: "var(--ad-orange)", color: "#fff" }
                : { background: "var(--ad-surface-2)", color: "var(--ad-subtle)", border: "1px solid var(--ad-border)" }
              }>
              {done ? "✓" : step.icon.length <= 2 ? step.icon : i + 1}
            </div>

            {/* Label */}
            <span className="text-sm flex-1"
              style={
                done    ? { color: "var(--ad-green)", textDecoration: "line-through", opacity: 0.7 }
                : active  ? { color: "var(--ad-text)", fontWeight: 500 }
                : { color: "var(--ad-subtle)" }
              }>
              {step.label}
            </span>

            {/* Active indicator */}
            {active && (
              <span className="text-xs animate-pulse-slow" style={{ color: "var(--ad-orange)" }}>
                işleniyor
              </span>
            )}
          </div>
        );
      })}

      {/* Hata */}
      {isError && job.error_message && (
        <div className="mt-3 rounded-lg px-3 py-2 text-sm"
          style={{ background: "color-mix(in srgb, var(--ad-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ad-red) 20%, transparent)", color: "var(--ad-red)" }}>
          ⚠ {job.error_message}
        </div>
      )}

      {/* Tamamlandı */}
      {job.status === "tamamlandi" && (
        <div className="mt-3 rounded-lg px-3 py-2 text-sm font-medium"
          style={{ background: "color-mix(in srgb, var(--ad-green) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ad-green) 20%, transparent)", color: "var(--ad-green)" }}>
          ✅ Video hazır — kalite kontrolü bekleniyor
        </div>
      )}
    </div>
  );
}
