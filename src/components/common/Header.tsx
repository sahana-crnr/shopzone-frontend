import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronRight,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import { FiMoon, FiShoppingCart, FiSun } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import Sidebar from "./Sidebar";
import useAuthStore from "../../store/useAuthStore";
import useShopStore, { getCartTotalItems } from "../../store/useShopStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CartSheet from "./CartSheet";
import useThemeStore from "../../store/useThemeStore";
import useSearchStore from "../../store/useSearchStore";
import { toIconComponent } from "../../utils/icons";
import { fetchProductCatalog } from "../../api/products";

const quickSearchTerms = ["Sneakers", "Headphones", "Watches", "Bags"];
const SearchIcon = toIconComponent(FaSearch);
const ChevronRightIcon = toIconComponent(FaChevronRight);
const SignOutIcon = toIconComponent(FaSignOutAlt);
const ClearIcon = toIconComponent(FaTimes);
const MoonIcon = toIconComponent(FiMoon);
const ShoppingCartIcon = toIconComponent(FiShoppingCart);
const SunIcon = toIconComponent(FiSun);

const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

const highlightText = (text: string, query: string) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  const matchIndex = text.toLowerCase().indexOf(normalizedQuery.toLowerCase());

  if (matchIndex === -1) {
    return text;
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + normalizedQuery.length);
  const after = text.slice(matchIndex + normalizedQuery.length);

  return (
    <>
      {before}
      <span className="rounded px-1 font-semibold text-yellow-600 bg-yellow-100 dark:bg-yellow-500/15 dark:text-yellow-300">
        {match}
      </span>
      {after}
    </>
  );
};

export default function Header() {
  const navigate = useNavigate();
  const searchTerm = useSearchStore((state) => state.searchTerm);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const cartCount = useShopStore(getCartTotalItems);
  const openCart = useShopStore((state) => state.openCart);
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { data: productList = [] } = useQuery({
    queryKey: ["product-catalog"],
    queryFn: fetchProductCatalog,
    staleTime: 5 * 60 * 1000,
  });

  const suggestions = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const queryWords = query.split(/\s+/).filter(Boolean);

    return productList
      .map((product) => {
        const name = product.name.toLowerCase();
        const description = (product.description ?? "").toLowerCase();
        const color = (product.color ?? "").toLowerCase();
        const size = (product.size ?? "").toLowerCase();
        const haystack = [name, description, color, size].join(" ");

        if (!query) {
          const popularity =
            (product.rating ?? 0) * 100 +
            Math.min(product.reviewsCount ?? 0, 2000) / 10 +
            Math.min(product.ratingsCount ?? 0, 10000) / 100;

          return { product, score: popularity };
        }

        const matchesAllWords = queryWords.every((word) =>
          haystack.includes(word),
        );
        if (!matchesAllWords) {
          return { product, score: 0 };
        }

        let score = 0;
        if (name.startsWith(query)) score += 500;
        if (name.includes(query)) score += 250;
        if (description.includes(query)) score += 80;
        if (color.includes(query) || size.includes(query)) score += 60;

        for (const word of queryWords) {
          if (name.includes(word)) score += 45;
          if (description.includes(word)) score += 18;
          if (color.includes(word) || size.includes(word)) score += 12;
        }

        score += (product.rating ?? 0) * 20;
        score += Math.min(product.reviewsCount ?? 0, 1500) / 50;

        return { product, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ product }) => product);
  }, [debouncedSearchTerm, productList]);

  const shouldShowSuggestions = isSearchFocused && suggestions.length > 0;

  const handleLogout = () => {
    useAuthStore.getState().logoutUser();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveSuggestionIndex(0);
  }, [suggestions]);

  const handleSuggestionClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setIsSearchFocused(false);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) {
      if (event.key === "Escape") {
        setIsSearchFocused(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsSearchFocused(true);
      setActiveSuggestionIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsSearchFocused(true);
      setActiveSuggestionIndex((current) =>
        current - 1 < 0 ? suggestions.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0) {
      event.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestionIndex].id);
      return;
    }

    if (event.key === "Escape") {
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="bg-background border-b border-border shadow-sm py-4 px-4 md:px-6 sticky top-0 z-50 w-full transition-colors">
      <CartSheet />
      <div className="max-w-8xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Sidebar />
          <div className="text-3xl font-extrabold text-purple-700 tracking-wide shrink-0">
            ShopZone
          </div>
        </div>

        <div
          ref={searchContainerRef}
          className="relative w-full md:max-w-md lg:max-w-lg flex-1 rounded-2xl"
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
            <SearchIcon />
          </span>
          <label htmlFor="search" className="sr-only">
            Search products
          </label>
          <Input
            id="search"
            name="search"
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            autoComplete="off"
            className="pl-11 pr-10 shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-all duration-300 focus-visible:shadow-[0_16px_45px_rgba(126,34,206,0.12)]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition focus:outline-none"
              title="Clear search"
            >
              <ClearIcon />
            </button>
          )}
          <div
            className={`absolute top-full left-0 right-0 mt-3 overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/95 shadow-[0_28px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl z-50 text-foreground transition-all duration-200 ease-out transform-gpu ${
              shouldShowSuggestions
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none translate-y-2 scale-[0.98] opacity-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground/80">
                  {searchTerm.trim() ? "Suggestions" : "Popular picks"}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {suggestions.length} result
                  {suggestions.length === 1 ? "" : "s"}
                </p>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground shadow-sm">
                Enter to open
              </span>
            </div>

            {!searchTerm.trim() && (
              <div className="border-b border-border/70 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                  Trending searches
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickSearchTerms.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setSearchTerm(term);
                        setIsSearchFocused(true);
                      }}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-500/10 dark:hover:text-purple-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ul className="max-h-[24rem] overflow-auto p-2">
              {suggestions.map((product, index) => {
                const isActive = index === activeSuggestionIndex;

                return (
                  <li
                    key={product.id}
                    className={`group flex cursor-pointer items-center gap-3 rounded-[1.2rem] px-3 py-3 transition-all duration-200 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)]"
                        : "hover:bg-slate-100 hover:shadow-sm dark:hover:bg-white/5"
                    }`}
                    style={{ transitionDelay: `${index * 35}ms` }}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSuggestionClick(product.id);
                    }}
                  >
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border transition-all ${
                        isActive
                          ? "border-white/20 bg-white/10"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <img
                        src={
                          product.image?.startsWith("/")
                            ? process.env.PUBLIC_URL + product.image
                            : product.image
                        }
                        alt={product.name}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-semibold ${
                              isActive ? "text-white" : "text-foreground"
                            }`}
                          >
                            {highlightText(product.name, debouncedSearchTerm)}
                          </p>
                          <p
                            className={`mt-1 truncate text-xs ${
                              isActive
                                ? "text-white/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {product.color ?? "Product"}{" "}
                            {product.size ? `• ${product.size}` : ""}
                          </p>
                        </div>

                        <ChevronRightIcon
                          className={`mt-1 h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                            isActive ? "text-white/90" : "text-muted-foreground"
                          }`}
                        />
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-[11px] font-medium">
                        <span
                          className={`rounded-full px-2.5 py-1 ${
                            isActive
                              ? "bg-white/14 text-white"
                              : "border border-border bg-background text-foreground shadow-sm"
                          }`}
                        >
                          {formatPrice(product.price)}
                        </span>
                        <span
                          className={`${isActive ? "text-white/80" : "text-foreground/80"}`}
                        >
                          {product.rating?.toFixed(1) ?? "0.0"} rating
                        </span>
                        <span
                          className={`${isActive ? "text-white/70" : "text-foreground/70"}`}
                        >
                          {product.reviewsCount ?? 0} reviews
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 shrink-0 w-full md:w-auto overflow-x-auto">
          <nav className="flex gap-4 md:gap-6 text-muted-foreground font-medium whitespace-nowrap">
            <Link
              to="/home"
              className="hover:text-purple-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="hover:text-purple-600 transition-colors"
            >
              About Us
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-pressed={isDark}
              onClick={toggleTheme}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-purple-600 hover:shadow-[0_12px_28px_rgba(124,58,237,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
                  isDark
                    ? "bg-purple-950 text-purple-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "bg-purple-600 text-white shadow-[0_8px_18px_rgba(124,58,237,0.25)]"
                }`}
              >
                {isDark ? (
                  <MoonIcon className="h-4 w-4" />
                ) : (
                  <SunIcon className="h-4 w-4" />
                )}
              </span>
            </button>

            <div className="flex gap-1">
              <Button
                onClick={openCart}
                title="Cart"
                size="icon"
                className="relative rounded-full bg-purple-600 hover:bg-purple-800"
              >
                <ShoppingCartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-1 bg-red-500 text-white text-[10px] font-extrabold min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Button>
              <Button
                onClick={handleLogout}
                title="Logout"
                size="icon"
                className="rounded-full bg-purple-600 hover:bg-purple-800"
              >
                <SignOutIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
