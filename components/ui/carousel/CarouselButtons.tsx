"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";

export default function CarouselButtons({ onPrevClick, onNextClick }: { onPrevClick: () => void; onNextClick: () => void }) {
  return (
    <>
      <button
        onClick={onPrevClick}
        className="absolute cursor-pointer right-14 -top-4 -translate-y-1/2 border-2 border-primary p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-primary" />
      </button>

      <button
        onClick={onNextClick}
        className="absolute cursor-pointer right-2 -top-4 -translate-y-1/2 border-2 border-primary p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-primary" />
      </button>
    </>
  );
}
