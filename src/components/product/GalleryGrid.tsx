"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox, type LightboxImage } from "./Lightbox";

/** 场景图集：瀑布流排布，点击进入灯箱 */
export function GalleryGrid({ images }: { images: LightboxImage[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
        {images.map((im, i) => (
          <button
            key={im.src}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[1.4rem] break-inside-avoid"
            style={{ backgroundColor: im.color, aspectRatio: `${im.w} / ${im.h}` }}
            aria-label={`查看场景图 ${i + 1}`}
          >
            <Image
              src={im.src}
              alt={im.alt}
              fill
              sizes="(min-width:768px) 33vw, 50vw"
              placeholder="blur"
              blurDataURL={im.blur}
              className="object-cover transition-transform duration-1000 ease-[var(--ease-soft)] group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>
      <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}
