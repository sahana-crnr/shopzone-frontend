declare module "react-lazy-load-image-component" {
  import type * as React from "react";

  export type LazyLoadImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    afterLoad?: () => void;
    beforeLoad?: () => void;
    delayMethod?: "throttle" | "debounce";
    delayTime?: number;
    effect?: string;
    placeholder?: React.ReactNode;
    placeholderSrc?: string;
    scrollPosition?: {
      x: number;
      y: number;
    };
    threshold?: number;
    useIntersectionObserver?: boolean;
    visibleByDefault?: boolean;
    wrapperClassName?: string;
  };

  export const LazyLoadImage: React.ComponentType<LazyLoadImageProps>;
}
