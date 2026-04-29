import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBoxOpen,
  FaChevronDown,
  FaHeart,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import useAuthStore from "../../store/useAuthStore";
import useShopStore from "../../store/useShopStore";
import { toIconComponent } from "../../utils/icons";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

const BarsIcon = toIconComponent(FaBars);
const BoxOpenIcon = toIconComponent(FaBoxOpen);
const ChevronDownIcon = toIconComponent(FaChevronDown);
const HeartIcon = toIconComponent(FaHeart);
const SignOutIcon = toIconComponent(FaSignOutAlt);
const UserCircleIcon = toIconComponent(FaUserCircle);
const CategoryIcon = toIconComponent(MdCategory);

const Sidebar = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const navigate = useNavigate();
  const wishlistCount = useShopStore((state) => state.wishlist.length);

  const toggleCategories = () => setIsCategoryOpen((current) => !current);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSignOut = () => {
    useAuthStore.getState().logoutUser();
    navigate("/", { replace: true });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <BarsIcon size={24} />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-2xl font-bold text-purple-700">
            Menu
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <div className="flex-1 px-4 py-2 space-y-1">
            <Button
              variant="ghost"
              onClick={toggleCategories}
              className="w-full justify-between text-base h-12"
            >
              <div className="flex items-center gap-4">
                <CategoryIcon className="h-5 w-5" />
                <span>Products Category</span>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
              />
            </Button>

            <div
              className={`pl-8 transition-all duration-300 overflow-hidden ${
                isCategoryOpen ? "max-h-60" : "max-h-0"
              }`}
            >
              <ul className="py-2 space-y-2 text-muted-foreground">
                <li className="hover:text-purple-600 cursor-pointer">
                  Electronics
                </li>
                <li className="hover:text-purple-600 cursor-pointer">
                  Fashion & Apparel
                </li>
                <li className="hover:text-purple-600 cursor-pointer">
                  Home & Furniture
                </li>
                <li className="hover:text-purple-600 cursor-pointer">
                  Books & Media
                </li>
                <li className="hover:text-purple-600 cursor-pointer">
                  Sports & Outdoors
                </li>
              </ul>
            </div>

            <Button
              variant="ghost"
              onClick={() => handleNavigation("/wishlist")}
              className="w-full justify-start text-base h-12 gap-4"
            >
              <HeartIcon className="h-5 w-5" />
              <span>My Wishlist</span>
              {wishlistCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleNavigation("/orders")}
              className="w-full justify-start text-base h-12 gap-4"
            >
              <BoxOpenIcon className="h-5 w-5" />
              <span>My Orders</span>
            </Button>
          </div>

          <div className="p-4 border-t border-border mt-auto">
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/account")}
              className="w-full justify-start text-base h-12 gap-4"
            >
              <UserCircleIcon className="h-5 w-5" />
              <span>My Account</span>
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full justify-start text-base h-12 gap-4 mt-2"
            >
              <SignOutIcon className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
