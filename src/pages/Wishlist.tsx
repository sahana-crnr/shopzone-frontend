import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { FaHeartBroken, FaTrash } from "react-icons/fa";
import useShopStore from "../store/useShopStore";
import { Button } from "../components/ui/button";
import { Product } from "../types/shop";
import { toIconComponent } from "../utils/icons";

const HeartBrokenIcon = toIconComponent(FaHeartBroken);
const TrashIcon = toIconComponent(FaTrash);

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const wishlistItems = useShopStore((state) => state.wishlist) as Product[];
  const handleRemoveItem = useShopStore(
    (state) => state.removeFromWishlist,
  ) as (id: number) => void;

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-8xl mx-auto w-full">
        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            My Wishlist
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "Item" : "Items"} Saved
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <HeartBrokenIcon className="text-6xl mb-4 text-muted-foreground opacity-70" />
            <p className="text-muted-foreground text-lg opacity-70">
              My wishlist is currently empty.
            </p>
            <Link to="/home">
              <Button className="mt-6 bg-purple-600 hover:bg-purple-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-5xl mx-auto">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row items-center gap-4"
              >
                <div
                  className="w-24 h-24 flex-shrink-0 bg-muted/60 border border-border rounded-xl p-2 cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img
                    src={
                      item.image?.startsWith("/")
                        ? process.env.PUBLIC_URL + item.image
                        : item.image
                    }
                    alt={item.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 flex flex-col text-center sm:text-left">
                  <h3
                    className="font-bold text-lg text-foreground cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Size: {item.size} | Color: {item.color}
                  </p>
                  <p className="text-purple-700 font-bold text-lg mt-2">
                    ₹{item.price}
                  </p>
                </div>

                <button
                  onClick={() => void handleRemoveItem(item.id)}
                  className="text-red-500 hover:bg-red-50 p-3 rounded-full transition-colors"
                  title="Remove"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
