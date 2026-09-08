import React, { useState, useEffect, useRef } from "react";
import { History, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import ProductCard from "../ProductCard";
import { Product } from "../../types/shop";
import { getRecentlyViewed, clearRecentlyViewed } from "../../utils/recentlyViewed";

interface RecentlyViewedStripProps {
  excludeProductId?: number;
}

const RecentlyViewedStrip: React.FC<RecentlyViewedStripProps> = ({
  excludeProductId,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = getRecentlyViewed();
    const filtered = excludeProductId
      ? items.filter((item) => item.id !== excludeProductId)
      : items;
    setProducts(filtered);
  }, [excludeProductId]);

  const handleClear = () => {
    clearRecentlyViewed();
    setProducts([]);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 mb-1.5">
            <History className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
            Pick up where you left off
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Recently Viewed
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-xl border border-border bg-card hover:bg-slate-100 dark:hover:bg-white/5 text-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-xl border border-border bg-card hover:bg-slate-100 dark:hover:bg-white/5 text-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted-foreground/20 scroll-smooth"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-[240px] sm:w-[260px] md:w-[280px] snap-start flex flex-col"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedStrip;
