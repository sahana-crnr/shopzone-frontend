import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaFilter, FaSort } from "react-icons/fa";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toIconComponent } from "../../utils/icons";

const SortIcon = toIconComponent(FaSort);
const FilterIcon = toIconComponent(FaFilter);

const toolbarButtonClass =
  "group inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-purple-400 hover:bg-slate-100 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:ring-offset-2 focus:ring-offset-background dark:hover:bg-white/5";

const toolbarButtonActiveClass =
  "border-purple-500 bg-purple-50 ring-2 ring-purple-500/20 dark:bg-purple-500/10";

const menuPanelClass =
  "absolute top-full left-1/2 mt-3 w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 origin-top-right rounded-2xl border border-border bg-card p-3 shadow-[0_24px_70px_rgba(15,23,42,0.16)] z-50 flex flex-col gap-1 text-sm font-medium animate-dropdown-in sm:left-auto sm:right-0 sm:w-52 sm:max-w-none sm:translate-x-0";

const menuItemBaseClass =
  "text-left px-3 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/5";

const menuItemActiveClass =
  "bg-purple-100 font-semibold text-purple-700 shadow-sm dark:bg-purple-500/10 dark:text-purple-300";

const filterPanelClass =
  "absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] origin-top-right rounded-[1.75rem] border border-border/80 bg-card/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16)] z-50 animate-dropdown-in backdrop-blur-xl sm:w-80 sm:max-w-sm sm:p-6";

type HomeControlsProps = {
  totalFilteredCount: number;
  minPrice: string;
  maxPrice: string;
  minRating: number;
  minReviews: string;
  sortBy: string;
  selectedCategory: string;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setMinRating: (value: number) => void;
  setMinReviews: (value: string) => void;
  setSortBy: (value: string) => void;
  clearCategory: () => void;
};

const HomeControls: React.FC<HomeControlsProps> = ({
  totalFilteredCount,
  minPrice,
  maxPrice,
  minRating,
  minReviews,
  sortBy,
  selectedCategory,
  setMinPrice,
  setMaxPrice,
  setMinRating,
  setMinReviews,
  setSortBy,
  clearCategory,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMinPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMinPrice(value === "" ? "" : String(Math.max(0, Number(value))));
  };

  const handleMaxPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMaxPrice(value === "" ? "" : String(Math.max(0, Number(value))));
  };

  const handleMinReviewsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMinReviews(value === "" ? "" : String(Math.max(0, Number(value))));
  };

  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Product collection
        </h1>
        {selectedCategory ? (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
            <span>Category: {selectedCategory}</span>
            <button
              type="button"
              onClick={clearCategory}
              className="text-xs font-bold uppercase tracking-wide hover:underline"
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:gap-4 lg:w-auto">
        <p className="hidden sm:block font-medium text-muted-foreground">
          {totalFilteredCount} Items
        </p>

        <div className="relative" ref={sortRef}>
          <button
            type="button"
            aria-expanded={isSortOpen}
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsFilterOpen(false);
            }}
            className={`${toolbarButtonClass} ${isSortOpen ? toolbarButtonActiveClass : ""}`}
          >
            <SortIcon
              className={`transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`}
            />
            <span>Sort By</span>
          </button>
          {isSortOpen && (
            <div className={menuPanelClass}>
              {[
                ["default", "Default"],
                ["price-asc", "Price: Low to High"],
                ["price-desc", "Price: High to Low"],
                ["rating-desc", "Rating: High to Low"],
                ["name-asc", "Name: A to Z"],
                ["name-desc", "Name: Z to A"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSortBy(value);
                    setIsSortOpen(false);
                  }}
                  className={`${menuItemBaseClass} ${sortBy === value ? menuItemActiveClass : "text-muted-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={filterRef}>
          <button
            type="button"
            aria-expanded={isFilterOpen}
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              setIsSortOpen(false);
            }}
            className={`${toolbarButtonClass} ${isFilterOpen ? toolbarButtonActiveClass : ""}`}
          >
            <FilterIcon
              className={`transition-transform duration-300 ${isFilterOpen ? "rotate-12 scale-110" : ""}`}
            />
            <span>Filters</span>
          </button>

          {isFilterOpen && (
            <div className={filterPanelClass}>
              <h2 className="mb-4 border-b border-border pb-2 text-lg font-bold text-foreground">
                Filters
              </h2>

              <div className="mb-5">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Price Range (₹)
                </h3>
                <div className="flex items-center gap-2">
                  <label htmlFor="min-price" className="sr-only">
                    Minimum price
                  </label>
                  <Input
                    id="min-price"
                    name="minPrice"
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    className="h-9 border-border bg-background text-sm text-foreground shadow-sm"
                  />
                  <span className="text-foreground/70">-</span>
                  <label htmlFor="max-price" className="sr-only">
                    Maximum price
                  </label>
                  <Input
                    id="max-price"
                    name="maxPrice"
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    className="h-9 border-border bg-background text-sm text-foreground shadow-sm"
                  />
                </div>
              </div>

              <div className="mb-5">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Minimum Rating
                </h3>
                <label htmlFor="min-rating" className="sr-only">
                  Minimum rating
                </label>
                <select
                  id="min-rating"
                  name="minRating"
                  value={minRating}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setMinRating(Number(event.target.value))
                  }
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4 Stars & Up</option>
                  <option value={3}>3 Stars & Up</option>
                  <option value={2}>2 Stars & Up</option>
                </select>
              </div>

              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Minimum Reviews
                </h3>
                <label htmlFor="min-reviews" className="sr-only">
                  Minimum reviews
                </label>
                <Input
                  id="min-reviews"
                  name="minReviews"
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={minReviews}
                  onChange={handleMinReviewsChange}
                  className="h-9 border-border bg-background text-sm text-foreground shadow-sm"
                />
              </div>

              <Button
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  setMinRating(0);
                  setMinReviews("");
                  clearCategory();
                }}
                className="w-full bg-purple-600 text-sm text-white hover:bg-purple-700"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeControls;
