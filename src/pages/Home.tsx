import React, { useEffect, useMemo, useState } from "react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import HomeControls from "../components/home/HomeControls";
import ProductsSection from "../components/home/ProductsSection";
import useSearchStore from "../store/useSearchStore";
import { useDebounce } from "use-debounce";
import {
  fetchProductsPage,
  ProductFilters,
  ProductsPage,
  ProductsQueryKey,
} from "../data/productQueries";

const Home = () => {
  const searchTerm = useSearchStore((state) => state.searchTerm);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [minReviews, setMinReviews] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const { ref: loadMoreRef, inView } = useInView();

  const queryFilters = useMemo<ProductFilters>(
    () => ({
      searchTerm: debouncedSearchTerm,
      minPrice,
      maxPrice,
      minRating,
      minReviews,
      sortBy,
    }),
    [debouncedSearchTerm, minPrice, maxPrice, minRating, minReviews, sortBy],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<
      ProductsPage,
      Error,
      InfiniteData<ProductsPage>,
      ProductsQueryKey
    >({
      queryKey: ["products", queryFilters],
      queryFn: fetchProductsPage,
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const pages = data?.pages ?? [];
  const displayProducts = pages.flatMap((page) => page.products);
  const totalFilteredCount = pages[0]?.totalCount ?? 0;
  const animationSeed = useMemo(
    () =>
      [
        debouncedSearchTerm,
        minPrice,
        maxPrice,
        minRating,
        minReviews,
        sortBy,
      ].join("|"),
    [debouncedSearchTerm, minPrice, maxPrice, minRating, minReviews, sortBy],
  );

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 max-w-8xl mx-auto w-full">
        <HomeControls
          totalFilteredCount={totalFilteredCount}
          minPrice={minPrice}
          maxPrice={maxPrice}
          minRating={minRating}
          minReviews={minReviews}
          sortBy={sortBy}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          setMinRating={setMinRating}
          setMinReviews={setMinReviews}
          setSortBy={setSortBy}
        />
        <ProductsSection
          displayProducts={displayProducts}
          animationSeed={animationSeed}
          isInitialLoading={isLoading && displayProducts.length === 0}
          isFetchingNextPage={isFetchingNextPage}
          loadMoreRef={loadMoreRef}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
