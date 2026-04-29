import React, { ChangeEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import useShopStore, {
  getCartTotalItems,
  getCartTotalPrice,
} from "../store/useShopStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { CartItem } from "../types/shop";
import { toIconComponent } from "../utils/icons";
import {
  quantityButtonClass,
  quantityContainerClass,
  removeButtonClass,
} from "../utils/stylesUtils";

const TrashIcon = toIconComponent(FaTrash);
const MinusIcon = toIconComponent(FaMinus);
const PlusIcon = toIconComponent(FaPlus);
const ShoppingCartIcon = toIconComponent(FiShoppingCart);

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const cartItems = useShopStore((state) => state.cart) as CartItem[];
  const cartTotalItems = useShopStore(getCartTotalItems);
  const cartTotalPrice = useShopStore(getCartTotalPrice);
  const updateQuantity = useShopStore((state) => state.updateCartQuantity);
  const removeItem = useShopStore((state) => state.removeFromCart);
  const discountPercent = useShopStore((state) => state.discountPercent);
  const discountCode = useShopStore((state) => state.discountCode);
  const applyDiscount = useShopStore((state) => state.applyDiscount);
  const removeDiscount = useShopStore((state) => state.removeDiscount);
  const [couponInput, setCouponInput] = useState<string>("");

  const discountAmount = Math.round(cartTotalPrice * (discountPercent / 100));
  const finalPrice = cartTotalPrice - discountAmount;

  const handleCouponChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCouponInput(event.target.value.toUpperCase());
  };

  const handleApplyCoupon = () => {
    applyDiscount(couponInput);
    setCouponInput("");
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            {cartTotalItems} {cartTotalItems === 1 ? "Item" : "Items"} in my
            cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <ShoppingCartIcon className="text-6xl mb-4 text-muted-foreground opacity-70" />
            <p className="text-muted-foreground text-lg opacity-70">
              My cart is currently empty.
            </p>
            <Link to="/home">
              <Button className="mt-6 bg-purple-600 hover:bg-purple-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div
                    className="w-24 h-24 flex-shrink-0 bg-muted/60 border border-border rounded-xl p-2 cursor-pointer transition-transform duration-300 group-hover:scale-[1.03]"
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

                  <div className="flex items-center justify-center gap-4 mt-2 sm:mt-0">
                    <div className={quantityContainerClass}>
                      <button
                        type="button"
                        onClick={() => void updateQuantity(item.id, -1)}
                        className={quantityButtonClass}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <MinusIcon size={12} />
                      </button>
                      <span className="min-w-8 px-1 text-center text-sm font-bold text-foreground tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => void updateQuantity(item.id, 1)}
                        className={quantityButtonClass}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <PlusIcon size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeItem(item.id)}
                      className={removeButtonClass}
                      title="Remove"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-80 h-fit bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col gap-4 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">
                Order Summary
              </h2>

              <div className="flex flex-col gap-2 border-b pb-4">
                <label className="text-sm font-medium">Apply Coupon</label>
                {discountCode ? (
                  <div className="flex justify-between items-center bg-green-50 text-green-700 px-3 py-2 rounded-xl border border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20">
                    <span className="font-bold text-sm">
                      {discountCode} Applied
                    </span>
                    <button
                      onClick={removeDiscount}
                      className="text-red-500 text-sm font-bold hover:underline dark:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter Code (e.g. SAVE10)"
                      value={couponInput}
                      onChange={handleCouponChange}
                      className="h-10 text-sm uppercase bg-background border-border text-foreground shadow-sm"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      className="h-10 shrink-0 bg-gray-900 text-white hover:bg-gray-800 dark:bg-purple-600 dark:hover:bg-purple-500"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  ₹{cartTotalPrice}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="font-semibold">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              <div className="border-t border-border pt-4 mt-2 flex justify-between items-center">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-purple-700">
                  ₹{finalPrice}
                </span>
              </div>
              <Button className="w-full mt-4 text-lg h-12 bg-purple-600 hover:bg-purple-700">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
