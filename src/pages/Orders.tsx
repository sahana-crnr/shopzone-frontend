import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Button } from "../components/ui/button";
import useAuthStore from "../store/useAuthStore";
import {
  acceptDelivery,
  fetchDeliveryOrders,
  fetchOrders,
  updateOrderStatus,
} from "../api/commerce";
import { OrderSummary } from "../types/shop";
import { FaTruck, FaShoppingBag, FaCheckCircle, FaUser, FaPhoneAlt } from "react-icons/fa";
import { toIconComponent } from "../utils/icons";

const TruckIcon = toIconComponent(FaTruck);
const ShoppingBagIcon = toIconComponent(FaShoppingBag);
const CheckCircleIcon = toIconComponent(FaCheckCircle);
const UserIcon = toIconComponent(FaUser);
const PhoneIcon = toIconComponent(FaPhoneAlt);

const Orders: React.FC = () => {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.currentUser);

  const [activeTab, setActiveTab] = useState<"my-orders" | "delivery-console">("my-orders");

  const roles = (currentUser as any)?.roles || [];
  const primaryRole = (currentUser as any)?.primary_role || "customer";
  const isDeliveryOrStaff =
    (currentUser as any)?.is_staff ||
    roles.some((r: string) =>
      ["delivery_staff", "admin", "owner", "shop_manager", "inventory_manager"].includes(r),
    ) ||
    primaryRole === "delivery_staff";

  // Fetch Customer's Own Orders
  const {
    data: myOrders = [],
    isLoading: isMyOrdersLoading,
    isError: isMyOrdersError,
  } = useQuery<OrderSummary[]>({
    queryKey: ["my-orders"],
    queryFn: () => fetchOrders(accessToken ?? ""),
    enabled: Boolean(accessToken) && activeTab === "my-orders",
    retry: false,
  });

  // Fetch Delivery Orders (Staff Console)
  const {
    data: deliveryOrders = [],
    isLoading: isDeliveryLoading,
    isError: isDeliveryError,
  } = useQuery<OrderSummary[]>({
    queryKey: ["delivery-orders"],
    queryFn: () => fetchDeliveryOrders(accessToken ?? ""),
    enabled: Boolean(accessToken) && (activeTab === "delivery-console" || isDeliveryOrStaff),
    retry: false,
  });

  // Mutation to accept delivery
  const acceptMutation = useMutation({
    mutationFn: (orderId: number) => {
      if (!accessToken) throw new Error("Not authenticated");
      return acceptDelivery(orderId, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["delivery-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Delivery accepted! Order is now Out for Delivery.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept delivery.");
    },
  });

  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return updateOrderStatus(orderId, status, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["delivery-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Order status updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update order status.");
    },
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "PROCESSING":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
    }
  };

  const displayedOrders = activeTab === "my-orders" ? myOrders : deliveryOrders;
  const isCurrentLoading = activeTab === "my-orders" ? isMyOrdersLoading : isDeliveryLoading;
  const isCurrentError = activeTab === "my-orders" ? isMyOrdersError : isDeliveryError;

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Header & Tabs */}
        <div className="mb-6 border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              {activeTab === "delivery-console" ? (
                <>
                  <TruckIcon className="text-purple-600" /> Delivery Staff Console
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="text-purple-600" /> My Orders
                </>
              )}
            </h1>
            <p className="text-muted-foreground font-medium mt-1 text-sm">
              {activeTab === "delivery-console"
                ? "Accept checkouts and manage order deliveries"
                : "Track and review your recent store purchases"}
            </p>
          </div>

          {/* Navigation Tabs if User has Delivery/Staff Role */}
          {isDeliveryOrStaff && (
            <div className="flex bg-muted p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("my-orders")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === "my-orders"
                    ? "bg-card text-purple-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My Customer Orders
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("delivery-console")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === "delivery-console"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TruckIcon className="text-xs" /> Delivery Staff Portal
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        {isCurrentLoading ? (
          <div className="py-20 text-center text-muted-foreground font-medium">
            Loading orders...
          </div>
        ) : isCurrentError ? (
          <div className="py-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
            Unable to load orders. Please verify your authentication.
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center bg-card rounded-3xl p-8 border border-border shadow-sm">
            <p className="text-muted-foreground text-lg opacity-80">
              {activeTab === "delivery-console"
                ? "No checkout orders available for delivery at this time."
                : "You have no active orders yet."}
            </p>
            <Link to="/home">
              <Button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-2xl border border-border shadow-sm p-6 transition-all hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-foreground">Order #{order.id}</p>
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusBadgeStyle(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>

                    {/* Customer Info (Visible in Delivery Staff Console) */}
                    {activeTab === "delivery-console" && (
                      <div className="mt-2 space-y-1 bg-muted/40 p-3 rounded-xl border border-border">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                          <UserIcon className="text-purple-600" /> Customer:{" "}
                          <span className="font-bold">{order.customerName || "Customer Account"}</span>
                        </p>
                        {order.customerPhone && (
                          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                            <PhoneIcon /> Phone: {order.customerPhone}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          📍 <span className="font-semibold text-foreground">Delivery Location:</span>{" "}
                          {order.shippingAddress}
                        </p>
                      </div>
                    )}

                    {activeTab === "my-orders" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 Shipping address: <span className="font-medium text-foreground">{order.shippingAddress}</span>
                      </p>
                    )}
                  </div>

                  {/* Delivery Actions for Staff */}
                  {activeTab === "delivery-console" && (
                    <div className="flex flex-wrap items-center gap-3">
                      {order.status === "PENDING" || order.status === "PROCESSING" ? (
                        <Button
                          onClick={() => acceptMutation.mutate(order.id)}
                          disabled={acceptMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm"
                        >
                          <TruckIcon /> Accept Delivery
                        </Button>
                      ) : order.status === "SHIPPED" ? (
                        <Button
                          onClick={() =>
                            updateStatusMutation.mutate({ orderId: order.id, status: "DELIVERED" })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm"
                        >
                          <CheckCircleIcon /> Mark as Delivered
                        </Button>
                      ) : order.status === "DELIVERED" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircleIcon /> Completed
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center bg-background"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={
                            item.productImage?.startsWith("/")
                              ? process.env.PUBLIC_URL + item.productImage
                              : item.productImage
                          }
                          alt={item.productName}
                          className="h-16 w-16 rounded-lg border border-border object-contain bg-card p-1"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} · Unit Price: ₹{item.unitPrice}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-bold text-foreground">
                        ₹{item.lineTotal}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="mt-5 flex flex-wrap items-center justify-end gap-6 border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">
                    Subtotal: <span className="font-semibold text-foreground">₹{order.subtotal}</span>
                  </span>
                  {order.discountAmount > 0 && (
                    <span className="text-green-600 font-medium">
                      Discount: <span className="font-semibold">-₹{order.discountAmount}</span>
                    </span>
                  )}
                  <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
                    Total: ₹{order.totalAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
