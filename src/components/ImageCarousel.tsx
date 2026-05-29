import React, { useId, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, Navigation, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toIconComponent } from "../utils/icons";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/navigation";

const ChevronLeftIcon = toIconComponent(FaChevronLeft);
const ChevronRightIcon = toIconComponent(FaChevronRight);

interface ImageCarouselProps {
  images: string[];
  productName: string;
  baseUrl?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  productName,
  baseUrl = process.env.PUBLIC_URL,
}) => {
  const carouselId = useId().replace(/:/g, "");
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const previousButtonClass = `carousel-prev-${carouselId}`;
  const nextButtonClass = `carousel-next-${carouselId}`;
  const hasMultipleImages = images.length > 1;

  const getImageUrl = (image: string): string => {
    if (image.startsWith("/")) {
      return baseUrl + image;
    }
    return image;
  };

  if (images.length === 0) {
    return (
      <div className="w-full">
        <div className="flex aspect-square max-h-[460px] w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          Image unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="group relative overflow-hidden rounded-xl border border-border bg-background">
        <div className="absolute bottom-3 right-3 z-10 rounded-full border border-border bg-card/90 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          {activeIndex + 1} / {images.length}
        </div>

        <Swiper
          modules={[Thumbs, Navigation, Keyboard]}
          thumbs={{
            swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          navigation={{
            nextEl: `.${nextButtonClass}`,
            prevEl: `.${previousButtonClass}`,
          }}
          keyboard={{
            enabled: true,
            onlyInViewport: true,
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="h-full w-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={image} className="bg-background">
              <div className="flex aspect-square max-h-[460px] w-full items-center justify-center p-6 md:p-8">
                <img
                  src={getImageUrl(image)}
                  alt={`${productName} - ${index + 1}`}
                  className="h-full w-full object-contain"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className={`${previousButtonClass} absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm backdrop-blur transition hover:border-purple-300 hover:text-purple-600 disabled:pointer-events-none disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100`}
          disabled={!hasMultipleImages}
          aria-label="Previous image"
          type="button"
        >
          <ChevronLeftIcon className="text-base" />
        </button>
        <button
          className={`${nextButtonClass} absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm backdrop-blur transition hover:border-purple-300 hover:text-purple-600 disabled:pointer-events-none disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100`}
          disabled={!hasMultipleImages}
          aria-label="Next image"
          type="button"
        >
          <ChevronRightIcon className="text-base" />
        </button>
      </div>

      {hasMultipleImages && (
        <div className="w-full">
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            watchSlidesProgress
            slidesPerView={Math.min(images.length, 4)}
            spaceBetween={10}
            className="w-full"
            breakpoints={{
              320: {
                slidesPerView: Math.min(images.length, 3),
              },
              640: {
                slidesPerView: Math.min(images.length, 4),
              },
              1024: {
                slidesPerView: Math.min(images.length, 5),
              },
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={`${image}-thumb`} className="cursor-pointer">
                <button
                  className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-1.5 transition ${
                    activeIndex === index
                      ? "border-purple-600 ring-2 ring-purple-600/15"
                      : "border-border hover:border-purple-300"
                  }`}
                  type="button"
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="h-16 w-full object-contain md:h-20"
                    loading="lazy"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
