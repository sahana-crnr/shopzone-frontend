import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaStar,
  FaTag,
  FaBolt,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaCamera,
} from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import ImageCarousel from "../components/ImageCarousel";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useShopStore from "../store/useShopStore";
import useAuthStore from "../store/useAuthStore";
import { Button } from "../components/ui/button";
import { Product } from "../types/shop";
import { toIconComponent } from "../utils/icons";
import {
  createProductReview,
  fetchProductById,
  fetchProductReviews,
  fetchProducts,
} from "../api/products";
import { ApiError } from "../api/client";

const ArrowLeftIcon = toIconComponent(FaArrowLeft);
const StarIcon = toIconComponent(FaStar);
const TagIcon = toIconComponent(FaTag);
const BoltIcon = toIconComponent(FaBolt);
const HeartIcon = toIconComponent(FaHeart);
const HeartOutlineIcon = toIconComponent(FaRegHeart);
const ShoppingCartIcon = toIconComponent(FaShoppingCart);
const CameraIcon = toIconComponent(FaCamera);
const ShareIcon = toIconComponent(FiShare2);

type ReviewFormState = {
  rating: number;
  comment: string;
  image: string;
};

const normalizeText = (value?: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && value !== null && "name" in value) {
    return String((value as { name: unknown }).name ?? "").trim().toLowerCase();
  }
  return String(value).trim().toLowerCase();
};

const getSimilarityScore = (product: Product, candidate: Product) => {
  let score = 0;

  if (
    normalizeText(product.category) &&
    normalizeText(product.category) === normalizeText(candidate.category)
  ) {
    score += 40;
  }

  const productTags = new Set((product.tags ?? []).map(normalizeText));
  const candidateTags = (candidate.tags ?? []).map(normalizeText);
  candidateTags.forEach((tag) => {
    if (tag && productTags.has(tag)) {
      score += 25;
    }
  });

  if (
    normalizeText(product.color) &&
    normalizeText(product.color) === normalizeText(candidate.color)
  ) {
    score += 10;
  }

  if (
    normalizeText(product.size) &&
    normalizeText(product.size) === normalizeText(candidate.size)
  ) {
    score += 8;
  }

  const nameWords = new Set(normalizeText(product.name).split(/\s+/).filter(Boolean));
  normalizeText(candidate.name)
    .split(/\s+/)
    .filter(Boolean)
    .forEach((word) => {
      if (nameWords.has(word)) {
        score += 5;
      }
    });

  return score;
};

const formatReviewDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const emptyReviewForm: ReviewFormState = {
  rating: 5,
  comment: "",
  image: "",
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productId = Number(id);
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: !Number.isNaN(productId),
    retry: false,
  });
  const { data: similarProductsResponse } = useQuery({
    queryKey: ["similar-products", product?.id, product?.category],
    queryFn: () =>
      fetchProducts({
        category: product?.category || undefined,
        page: 1,
        page_size: 16,
      }),
    enabled: Boolean(product),
  });
  const { data: customerReviews = [], isLoading: areReviewsLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: !Number.isNaN(productId),
  });

  const wishlist = useShopStore((state) => state.wishlist) as Product[];
  const currentUser = useAuthStore((state) => state.currentUser);
  const accessToken = useAuthStore((state) => state.accessToken);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist) as (
    product: Product,
  ) => void;
  const addToCart = useShopStore((state) => state.addToCart) as (
    product: Product,
  ) => void;
  const [reviewForm, setReviewForm] =
    useState<ReviewFormState>(emptyReviewForm);
  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!accessToken || Number.isNaN(productId)) {
        throw new Error("Please log in again to submit your review.");
      }

      return createProductReview(
        productId,
        {
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
          image: reviewForm.image,
        },
        accessToken,
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] }),
        queryClient.invalidateQueries({ queryKey: ["product", productId] }),
        queryClient.invalidateQueries({ queryKey: ["product-catalog"] }),
      ]);
      setReviewForm(emptyReviewForm);
      toast.success("Review added successfully.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to submit review.");
    },
  });

  const handleWishlist = useCallback(() => {
    if (product) {
      void toggleWishlist(product);
    }
  }, [product, toggleWishlist]);

  const handleShare = useCallback(async () => {
    if (!product) {
      return;
    }

    const productUrl = `${window.location.origin}/product/${product.id}`;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} at ShopZone!`,
      url: productUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(productUrl);
      toast.success("Product link copied to clipboard!");
    }
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (product) {
      void addToCart(product);
    }
  }, [addToCart, product]);

  const handleBuyNow = useCallback(async () => {
    if (!product) {
      return;
    }

    await addToCart(product);
    useShopStore.getState().closeCart();
    navigate("/cart");
  }, [addToCart, navigate, product]);

  const handleReviewImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setReviewForm((currentForm) => ({
          ...currentForm,
          image: typeof reader.result === "string" ? reader.result : "",
        }));
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleReviewSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!product || !reviewForm.comment.trim()) {
        toast.error("Please write a review before submitting.");
        return;
      }

      if (!currentUser || !accessToken) {
        toast.error("Please log in again to submit your review.");
        return;
      }

      reviewMutation.mutate();
    },
    [accessToken, currentUser, product, reviewForm.comment, reviewMutation],
  );

  const similarProducts = useMemo(() => {
    if (!product || !similarProductsResponse?.results) {
      return [];
    }

    return similarProductsResponse.results
      .filter((candidate) => candidate.id !== product.id)
      .map((candidate) => ({
        product: candidate,
        score: getSimilarityScore(product, candidate),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.product);
  }, [product, similarProductsResponse]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    const notFound =
      error instanceof ApiError ? error.status === 404 : false;

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {notFound ? "Product not found" : "Unable to load product"}
          </h2>
          <Button
            onClick={() => navigate(-1)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go Back
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const originalPrice =
    product.originalPrice || Math.round(product.price * 1.35);
  const discount = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100,
  );

  const rating = typeof product.rating === "number" ? product.rating : 0;
  const ratingsCount = (product.ratingsCount ?? 0).toLocaleString();
  const reviewsCount = (product.reviewsCount ?? 0).toLocaleString();
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 p-2 md:p-4 pb-20">
        <div className="max-w-[1400px] mx-auto mb-4 mt-2 ">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            <ArrowLeftIcon /> Back to Products
          </Button>
        </div>

        <div className="max-w-[1400px] mx-auto bg-card flex flex-col md:flex-row shadow-sm rounded-2xl border border-border">
          <div className="relative w-full md:w-2/5 p-4 md:p-6 border-r border-border flex flex-col items-center">
            <div className="relative w-full">
              <ImageCarousel
                images={
                  product.images && product.images.length > 0
                    ? product.images
                    : product.image
                      ? [product.image]
                      : []
                }
                productName={product.name}
              />

              <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
                <button
                  onClick={handleWishlist}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition hover:border-red-200 hover:bg-card hover:text-red-500"
                  title="Wishlist"
                  type="button"
                >
                  {isWishlisted ? (
                    <HeartIcon className="text-lg text-red-500" />
                  ) : (
                    <HeartOutlineIcon className="text-lg" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition hover:border-blue-200 hover:bg-card hover:text-blue-600"
                  title="Share"
                  type="button"
                >
                  <ShareIcon className="text-lg" />
                </button>
              </div>
            </div>

            <div className="flex w-full gap-2 mt-auto">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2 whitespace-nowrap text-center "
              >
                <ShoppingCartIcon /> ADD TO CART
              </Button>
              <Button
                onClick={() => void handleBuyNow()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2 whitespace-nowrap text-center "
              >
                <BoltIcon /> BUY NOW
              </Button>
            </div>
          </div>

          <div className="w-full md:w-3/5 p-4 md:p-8">
            <h1 className="text-lg md:text-xl font-medium text-foreground mb-2">
              {product.name}
            </h1>
            {product.ratingsCount && product.ratingsCount > 0 ? (
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center">
                  {rating} <StarIcon className="w-3 h-3 ml-1" />
                </span>
                <span className="text-muted-foreground text-sm font-medium">
                  {ratingsCount} Rating{product.ratingsCount > 1 ? "s" : ""} & {reviewsCount} Review{product.reviewsCount > 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium">
                  No ratings yet
                </span>
                <span className="text-muted-foreground text-sm">
                  Be the first customer to rate & review this product!
                </span>
              </div>
            )}

            <div className="mb-6">
              <span className="text-purple-600 text-sm font-bold dark:text-purple-300">
                Special price
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-medium text-foreground">
                  ₹{product.price}
                </span>
                <span className="text-muted-foreground line-through text-base">
                  ₹{originalPrice}
                </span>
                <span className="text-purple-600 font-bold text-base">
                  {discount}% off
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-medium text-foreground mb-3">
                Available offers
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <TagIcon className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="font-bold">Bank Offer:</span> 5% Cashback
                    on Flipkart Axis Bank Card{" "}
                    <span className="text-blue-600 font-medium cursor-pointer dark:text-blue-300">
                      T&C
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <TagIcon className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="font-bold">Special Price:</span> Get extra
                    10% off (price inclusive of cashback/coupon){" "}
                    <span className="text-blue-600 font-medium cursor-pointer dark:text-blue-300">
                      T&C
                    </span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-6 border-t border-border pt-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Description
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  More about that product
                </h3>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
                  <span className="bg-background px-4 py-2 rounded-2xl border border-border shadow-sm text-foreground dark:bg-card">
                    Color:{" "}
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      {product.color}
                    </span>
                  </span>
                  <span className="bg-background px-4 py-2 rounded-2xl border border-border shadow-sm text-foreground dark:bg-card">
                    Size:{" "}
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      {product.size}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto mt-8 max-w-[1200px] rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Customer reviews
              </h2>
              <p className="text-sm text-muted-foreground">
                Share your experience with this product
              </p>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              {customerReviews.length} added
            </span>
          </div>

          {currentUser && accessToken ? (
            <form
              onSubmit={handleReviewSubmit}
              className="space-y-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="flex min-h-10 items-center rounded-md border border-border bg-card px-3 text-sm text-muted-foreground">
                  Posting as{" "}
                  <span className="ml-1 font-semibold text-foreground">
                    {currentUser?.name || currentUser?.email || "your account"}
                  </span>
                </div>
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((currentForm) => ({
                      ...currentForm,
                      rating: Number(event.target.value),
                    }))
                  }
                  className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-purple-500"
                  aria-label="Review rating"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm((currentForm) => ({
                    ...currentForm,
                    comment: event.target.value,
                  }))
                }
                placeholder="Write your review and rating feedback..."
                rows={4}
                className="w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-purple-500"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-purple-600">
                  <CameraIcon className="text-base" />
                  Add product image (optional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReviewImageChange}
                    className="sr-only"
                  />
                </label>

                <Button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </div>

              {reviewForm.image && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-2">
                  <img
                    src={reviewForm.image}
                    alt="Selected review upload"
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setReviewForm((currentForm) => ({
                        ...currentForm,
                        image: "",
                      }))
                    }
                    className="text-sm font-medium text-muted-foreground hover:text-red-500"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div className="rounded-xl border border-border bg-background p-6 text-center space-y-3">
              <p className="text-muted-foreground text-sm font-medium">
                Want to write a review and rate this product?
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2"
              >
                Log In to Rate & Review
              </Button>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {areReviewsLoading ? (
              <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                Loading customer reviews...
              </div>
            ) : customerReviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                No customer reviews yet.
              </div>
            ) : (
              customerReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {review.author}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatReviewDate(review.createdAt)}
                      </p>
                    </div>
                    <span className="flex items-center rounded-sm bg-purple-600 px-2 py-1 text-xs font-bold text-white">
                      {review.rating}
                      <StarIcon className="ml-1 h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                  {review.image && (
                    <img
                      src={review.image}
                      alt={`${review.author} product review`}
                      className="mt-3 h-24 w-24 rounded-lg border border-border object-cover"
                    />
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        {similarProducts.length > 0 && (
          <section className="mx-auto mt-6 max-w-[1200px]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Similar products
                </h2>
                <p className="text-sm text-muted-foreground">
                  Matched from the same category and product details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct.id} product={similarProduct} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
