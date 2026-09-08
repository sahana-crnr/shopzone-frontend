import React, { useRef } from "react";
import { Flame, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ProductCard from "../ProductCard";
import { Product } from "../../types/shop";

interface FeaturedProductsStripProps {
  products: Product[];
  isLoading?: boolean;
}

const FeaturedProductsStrip: React.FC<FeaturedProductsStripProps> = ({
  products,
  isLoading,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="mb-12 w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
            Top Handpicked Deals
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Featured & Best Sellers
          </h2>
        </div>

        {/* Desktop Arrow Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className="w-10 h-10 rounded-xl border border-border bg-card hover:bg-slate-100 dark:hover:bg-white/5 text-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className="w-10 h-10 rounded-xl border border-border bg-card hover:bg-slate-100 dark:hover:bg-white/5 text-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-muted/60 animate-pulse border border-border/50"
            />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted-foreground/20 scroll-smooth"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="shrink-0 w-[260px] sm:w-[280px] md:w-[300px] snap-start flex flex-col"
            >
              <div className="relative h-full">
                {/* Visual Featured Badge */}
                <div className="absolute top-3 left-3 z-20 pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                    <Sparkles className="w-3 h-3" />
                  </span>
                </div>
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedProductsStrip;
