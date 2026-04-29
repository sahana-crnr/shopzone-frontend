import React, { useEffect, useState } from "react";
import ProductCard from "../ProductCard";
import { Preloader } from "../ui/preloader";
import { Product } from "../../types/shop";

type ProductsSectionProps = {
  displayProducts: Product[];
  animationSeed: string;
  isInitialLoading: boolean;
  isFetchingNextPage: boolean;
  loadMoreRef: React.RefCallback<HTMLDivElement>;
};

type AnimatedResultCardProps = {
  product: Product;
  index: number;
};

const AnimatedResultCard: React.FC<AnimatedResultCardProps> = ({
  product,
  index,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className={`h-full transform transition-all duration-500 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95"
      }`}
      style={{ transitionDelay: `${index * 45}ms` }}
    >
      <ProductCard product={product} />
    </div>
  );
};

const useDelayedBoolean = (value: boolean, delay = 500): boolean => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = value
      ? window.setTimeout(() => setVisible(true), delay)
      : window.setTimeout(() => setVisible(false), 0);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return visible;
};

const ProductsSection: React.FC<ProductsSectionProps> = ({
  displayProducts,
  animationSeed,
  isInitialLoading,
  isFetchingNextPage,
  loadMoreRef,
}) => {
  const showInitialLoadingText = useDelayedBoolean(isInitialLoading);

  if (isInitialLoading && showInitialLoadingText) {
    return <Preloader />;
  }

  if (displayProducts.length === 0) {
    return (
      <div className="rounded-[2rem] border border-border bg-card/80 px-6 py-20 text-center text-lg text-muted-foreground shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        No products found matching your criteria.
      </div>
    );
  }

  return (
    <>
      <div
        key={animationSeed}
        className="grid grid-cols-2 gap-3 md:gap-6 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
      >
        {displayProducts.map((product, index) => (
          <AnimatedResultCard
            key={`${animationSeed}-${product.id}`}
            product={product}
            index={index}
          />
        ))}
      </div>
      <div ref={loadMoreRef} />
      {isFetchingNextPage && <Preloader compact title="Loading more..." />}
    </>
  );
};

export default ProductsSection;
