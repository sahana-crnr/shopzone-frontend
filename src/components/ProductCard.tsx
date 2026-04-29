import type { FC, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { Button, iconActionButtonClass } from "./ui/button";
import useShopStore from "../store/useShopStore";
import { Product } from "../types/shop";
import { toIconComponent } from "../utils/icons";
import { clampTextStyle } from "../utils/stylesUtils";

type ProductCardProps = {
  product: Product;
};

const HeartIcon = toIconComponent(FaHeart);
const HeartOutlineIcon = toIconComponent(FaRegHeart);
const ShareIcon = toIconComponent(FiShare2);

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const originalPrice =
    product.originalPrice || Math.round(product.price * 1.35);
  const discount = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100,
  );
  const productImageSrc = product.image?.startsWith("/")
    ? process.env.PUBLIC_URL + product.image
    : (product.image ?? "");

  const wishlist = useShopStore((state) => state.wishlist);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    void toggleWishlist(product);
  };

  const handleShare = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} at ShopZone!`,
      url: productUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(productUrl);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="relative flex h-full min-h-[24rem] w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <Button
          onClick={handleWishlist}
          variant="ghost"
          size="icon"
          className={iconActionButtonClass}
          title="Wishlist"
        >
          {isWishlisted ? (
            <HeartIcon className="text-red-600 text-xl" />
          ) : (
            <HeartOutlineIcon className="text-lg drop-shadow-sm" />
          )}
        </Button>

        <Button
          onClick={handleShare}
          variant="ghost"
          size="icon"
          className={`${iconActionButtonClass} hover:text-blue-500`}
          title="Share"
        >
          <ShareIcon className="text-lg drop-shadow-sm" />
        </Button>
      </div>

      <div
        className="flex h-[15rem] justify-center p-4 bg-purple-900"
        style={{
          backgroundImage: `
      repeating-linear-gradient( rgba(255, 255, 255, 0.88) 0, transparent 0px),
      linear-gradient(to right, rgba(108, 108, 108, 0.56), rgb(249, 247, 251))
    `,
          backgroundBlendMode: "overlay",
        }}
      >
        <img
          src={productImageSrc}
          alt={product.name}
          loading="eager"
          decoding="async"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="bg-card relative z-10 -mt-4 flex flex-1 flex-col rounded-2xl border border-border px-4 py-4">
        <h2
          className="text-sm md:text-lg font-bold text-foreground"
          style={clampTextStyle(2)}
        >
          {product.name}
        </h2>

        <div className="mt-2 flex gap-4 text-xs">
          <span className="rounded border border-border px-2 py-1 text-muted-foreground">
            {product.size}
          </span>
          <span className="rounded border border-border px-2 py-1 text-muted-foreground">
            {product.color}
          </span>
        </div>

        <p
          className="mt-1.5 text-xs text-muted-foreground md:text-sm"
          style={clampTextStyle(3)}
        >
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground line-through">
              ₹ {originalPrice}
            </span>
            <span className="text-md font-bold text-foreground">
              ₹ {product.price}
            </span>
          </div>
          <span className="text-sm text-green-600 font-bold">
            {discount}% off
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
