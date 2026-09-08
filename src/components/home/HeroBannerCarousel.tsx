import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Banner } from "../../types/shop";

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 1,
    title: "Mega Tech & Audio Fest",
    subtitle: "Immerse in sound & power. Up to 50% off on premium wireless audio, smartwatches & accessories.",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    target_category: "Electronics",
    button_text: "Shop Gadgets",
    badge: "⚡ Limited Time Deal",
    bg_gradient: "from-slate-950 via-indigo-950 to-blue-900",
  },
  {
    id: 2,
    title: "Step Up Your Game",
    subtitle: "Discover performance running shoes & streetwear sneakers engineered for style and endurance.",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80",
    target_category: "Footwear",
    button_text: "Explore Footwear",
    badge: "🔥 New Arrivals",
    bg_gradient: "from-stone-950 via-rose-950 to-neutral-900",
  },
  {
    id: 3,
    title: "Modern Home & Kitchen",
    subtitle: "Upgrade your lifestyle with energy-efficient air purifiers, coffee makers, smart hubs & fryers.",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80",
    target_category: "Home & Kitchen",
    button_text: "Upgrade Home",
    badge: "✨ Up to 40% Off",
    bg_gradient: "from-zinc-950 via-emerald-950 to-teal-950",
  },
  {
    id: 4,
    title: "Daily Wellness & Grooming",
    subtitle: "Elevate your self-care routine with precision trimmers, massagers, styling tools & more.",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    target_category: "Personal Care",
    button_text: "Discover Wellness",
    badge: "⭐ Customer Favorites",
    bg_gradient: "from-neutral-950 via-purple-950 to-slate-900",
  },
];

interface HeroBannerCarouselProps {
  banners?: Banner[];
  onSelectCategory?: (category: string) => void;
}

const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({
  banners,
  onSelectCategory,
}) => {
  const activeBanners =
    banners && banners.length > 0 ? banners : DEFAULT_BANNERS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  const handleCtaClick = (banner: Banner) => {
    if (banner.target_category && onSelectCategory) {
      onSelectCategory(banner.target_category);
    }
    const collectionElement = document.getElementById("product-collection");
    if (collectionElement) {
      collectionElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentBanner = activeBanners[currentIndex];

  return (
    <div
      className="relative w-full mb-8 overflow-hidden rounded-3xl shadow-2xl transition-all duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`relative min-h-[380px] sm:min-h-[420px] md:min-h-[460px] bg-gradient-to-br ${
          currentBanner.bg_gradient || "from-slate-950 via-indigo-950 to-blue-900"
        } text-white flex items-center transition-all duration-700 ease-out`}
      >
        {/* Ambient background decoration */}
        <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Content Column */}
          <div className="md:col-span-7 flex flex-col items-start gap-4">
            {currentBanner.badge && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md text-amber-300 border border-white/20 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                {currentBanner.badge}
              </span>
            )}

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              {currentBanner.title}
            </h2>

            {currentBanner.subtitle && (
              <p className="text-sm sm:text-base lg:text-lg text-slate-200/90 max-w-xl font-normal leading-relaxed">
                {currentBanner.subtitle}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => handleCtaClick(currentBanner)}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-950 text-sm font-bold shadow-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>{currentBanner.button_text || "Shop Now"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {currentBanner.target_category && (
                <button
                  type="button"
                  onClick={() => handleCtaClick(currentBanner)}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-semibold border border-white/15 transition-all"
                >
                  View in {currentBanner.target_category}
                </button>
              )}
            </div>
          </div>

          {/* Image Showcase Column */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative group w-full max-w-sm sm:max-w-md aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/20">
              <img
                src={currentBanner.image_url}
                alt={currentBanner.title}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>

        {/* Left / Right Arrow Controls */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-white shadow-sm"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBannerCarousel;
