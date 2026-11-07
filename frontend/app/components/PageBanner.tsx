'use client';
import Image from 'next/image';
import { useState } from 'react';

export function PageBanner({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [full, setFull] = useState(false);
  return (
    <>
      <figure className="rw-panel p-2 mb-4">
        <div className="rw-banner">
          <Image src={src} alt={alt} width={1280} height={720} priority={false} sizes="(max-width:640px) 100vw, 1100px" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <figcaption className="text-[11px] font-serif italic text-[#F2E8D5]">{caption || alt}</figcaption>
          </div>
        </div>
        <button onClick={() => setFull(true)} className="rw-btn mt-2" data-variant="bronze">View full artwork</button>
      </figure>
      {full && (
        <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4" onClick={() => setFull(false)}>
          <div className="rw-panel max-w-4xl w-full p-3" onClick={(e) => e.stopPropagation()}>
            <div className="rw-banner"><Image src={src} alt={alt} width={1280} height={720} /></div>
            <button onClick={() => setFull(false)} className="rw-btn mt-3" data-variant="bronze">Close (Esc)</button>
          </div>
        </div>
      )}
    </>
  );
}
