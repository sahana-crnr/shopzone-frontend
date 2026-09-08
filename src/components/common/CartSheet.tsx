import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { Truck } from "lucide-react";
import useShopStore, {
  getCartTotalItems,
  getCartTotalPrice,
} from "../../store/useShopStore";
import { toIconComponent } from "../../utils/icons";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

const TrashIcon = toIconComponent(FaTrash);
const ShoppingCartIcon = toIconComponent(FiShoppingCart);

export default function CartSheet() {
  const navigate = useNavigate();
  const isCartOpen = useShopStore((state) => state.isCartOpen);
  const closeCart = useShopStore((state) => state.closeCart);
  const cart = useShopStore((state) => state.cart);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const cartTotalPrice = useShopStore(getCartTotalPrice);
  const cartTotalItems = useShopStore(getCartTotalItems);

  const handleNavigate = (path: string) => {
    navigate(path);
    closeCart();
  };

  return (
    <Sheet
      open={isCartOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeCart();
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>My Cart ({cartTotalItems})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cart.length > 0 && (
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-xl p-3 my-1 text-xs">
            <div className="flex items-center justify-between font-semibold mb-1.5 text-foreground">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                {cartTotalPrice >= 1000 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    🎉 You unlocked FREE Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-purple-600 dark:text-purple-400">₹{1000 - cartTotalPrice}</strong> more for FREE Delivery
                  </span>
                )}
              </span>
              <span className="text-muted-foreground font-mono">
                {Math.min(100, Math.round((cartTotalPrice / 1000) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-purple-200 dark:bg-purple-900/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  cartTotalPrice >= 1000 ? "bg-emerald-500" : "bg-purple-600"
                }`}
                style={{
                  width: `${Math.min(100, Math.round((cartTotalPrice / 1000) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <ShoppingCartIcon className="text-6xl text-muted-foreground" />
            <p className="text-lg text-muted-foreground">My cart is empty.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <img
                  src={
                    item.image?.startsWith("/")
                      ? process.env.PUBLIC_URL + item.image
                      : item.image
                  }
                  alt={item.name}
                  className="w-16 h-16 object-contain rounded-md border p-1"
                />
                <div className="flex-1">
                  <p className="font-semibold line-clamp-1">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                  <p className="font-bold text-sm mt-1">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => void removeFromCart(item.cartItemId ?? item.id)}
                >
                  <TrashIcon size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
        {cart.length > 0 && (
          <SheetFooter className="flex flex-col gap-4 sm:flex-col pt-4 border-t">
            <div className="flex justify-between font-bold text-lg">
              <span>Subtotal</span>
              <span>₹{cartTotalPrice}</span>
            </div>
            <Button
              onClick={() => handleNavigate("/cart")}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              View Cart & Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
