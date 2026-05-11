"use client";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({ src, poster, className = "" }: VideoPlayerProps) {
  return (
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      <video
        src={src}
        poster={poster}
        controls
        playsInline
        className="w-full h-full"
        style={{ maxHeight: "70vh" }}
      >
        <p className="text-white text-sm p-4">
          Tarayıcınız video oynatmayı desteklemiyor.{" "}
          <a href={src} download className="underline">
            Videoyu indir
          </a>
        </p>
      </video>
    </div>
  );
}
