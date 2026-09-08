import React from "react";
import {
  LayoutGrid,
  Footprints,
  Laptop,
  Home as HomeIcon,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

interface CategoryQuickNavProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  {
    id: "all",
    label: "All Products",
    value: "",
    icon: LayoutGrid,
    badge: "58 items",
  },
  {
    id: "electronics",
    label: "Electronics",
    value: "Electronics",
    icon: Laptop,
    badge: "Popular",
  },
  {
    id: "footwear",
    label: "Footwear",
    value: "Footwear",
    icon: Footprints,
    badge: "Trending",
  },
  {
    id: "home-kitchen",
    label: "Home & Kitchen",
    value: "Home & Kitchen",
    icon: HomeIcon,
    badge: "Hot Deals",
  },
  {
    id: "personal-care",
    label: "Personal Care",
    value: "Personal Care",
    icon: Sparkles,
    badge: "Wellness",
  },
  {
    id: "accessories",
    label: "Accessories",
    value: "Accessories",
    icon: ShoppingBag,
    badge: "Essentials",
  },
];

const CategoryQuickNav: React.FC<CategoryQuickNavProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const handleClick = (catValue: string) => {
    onSelectCategory(catValue);
    const collectionElement = document.getElementById("product-collection");
    if (collectionElement) {
      collectionElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="mb-10 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Shop by Category
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quickly browse our most popular collections
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        {CATEGORIES.map((cat) => {
          const isSelected =
            cat.value === ""
              ? selectedCategory === ""
              : selectedCategory.toLowerCase() === cat.value.toLowerCase();
          const IconComponent = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleClick(cat.value)}
              className={`group shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/25 scale-[1.02]"
                  : "bg-card hover:bg-slate-100 dark:hover:bg-white/5 text-foreground border-border hover:border-purple-300 hover:shadow-md"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 group-hover:scale-105"
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="text-left">
                <div className="text-sm font-bold leading-none mb-1">
                  {cat.label}
                </div>
                <div
                  className={`text-[11px] font-medium leading-none ${
                    isSelected
                      ? "text-purple-100"
                      : "text-muted-foreground group-hover:text-purple-600"
                  }`}
                >
                  {cat.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryQuickNav;
