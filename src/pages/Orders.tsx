import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Button } from "../components/ui/button";
import useAuthStore from "../store/useAuthStore";
import useShopStore from "../store/useShopStore";
import {
  acceptDelivery,
  acceptReturn,
  cancelOrder,
  cancelOrderItem,
  downloadInvoice,
  fetchDeliveryOrders,
  fetchOrders,
  returnOrder,
  returnOrderItem,
  updateOrderStatus,
} from "../api/commerce";
import { OrderSummary } from "../types/shop";
import {
  FaTruck,
  FaShoppingBag,
  FaCheckCircle,
  FaUser,
  FaPhoneAlt,
  FaTimesCircle,
  FaUndoAlt,
  FaReceipt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toIconComponent } from "../utils/icons";

const TruckIcon = toIconComponent(FaTruck);
const ShoppingBagIcon = toIconComponent(FaShoppingBag);
const CheckCircleIcon = toIconComponent(FaCheckCircle);
const UserIcon = toIconComponent(FaUser);
const PhoneIcon = toIconComponent(FaPhoneAlt);
const TimesCircleIcon = toIconComponent(FaTimesCircle);
const UndoIcon = toIconComponent(FaUndoAlt);
const ReceiptIcon = toIconComponent(FaReceipt);
const ExclamationIcon = toIconComponent(FaExclamationTriangle);

type ActionModalState = {
  type: "cancel-order" | "cancel-item" | "return-order" | "return-item";
  orderId: number;
  itemId?: number;
  itemName?: string;
  title: string;
} | null;

const Orders: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.currentUser);
  const setAuthTokens = useAuthStore((state) => state.setAuthTokens);
  const clearShop = useShopStore((state) => state.clearShop);

  const [activeTab, setActiveTab] = useState<"my-orders" | "delivery-console">("my-orders");
  const [downloadingInvoice, setDownloadingInvoice] = useState<number | null>(null);
  const [actionModal, setActionModal] = useState<ActionModalState>(null);
  const [reasonInput, setReasonInput] = useState("");

  const paymentResult = searchParams.get("payment");
  const orderParam = searchParams.get("order");
  const tokenParam = searchParams.get("token");
  const refreshParam = searchParams.get("refresh");

  // Handle post-payment callback params and token recovery
  useEffect(() => {
    if (tokenParam) {
      void setAuthTokens(tokenParam, refreshParam || undefined);
    }

    if (paymentResult === "success") {
      clearShop();
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Payment completed successfully! Your order has been placed.");
    } else if (paymentResult === "failure") {
      toast.error("Payment was not successful. Please try again.");
    }

    // Clean up sensitive tokens from the browser URL bar while preserving payment result
    if (tokenParam || refreshParam) {
      const cleanParams = new URLSearchParams();
      if (paymentResult) cleanParams.set("payment", paymentResult);
      if (orderParam) cleanParams.set("order", orderParam);
      const newUrl = `${window.location.pathname}${cleanParams.toString() ? `?${cleanParams.toString()}` : ""}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [paymentResult, orderParam, tokenParam, refreshParam, clearShop, setAuthTokens, queryClient]);

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

  // Staff Mutation to accept delivery
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

  // Staff Mutation to update order status
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

  // Staff Mutation to accept return
  const acceptReturnMutation = useMutation({
    mutationFn: (orderId: number) => {
      if (!accessToken) throw new Error("Not authenticated");
      return acceptReturn(orderId, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["delivery-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Return processed and accepted.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept return.");
    },
  });

  // Customer Mutation: Cancel Order
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return cancelOrder(orderId, reason, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["delivery-orders"] });
      toast.success("Order cancelled successfully.");
      setActionModal(null);
      setReasonInput("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to cancel order.");
    },
  });

  // Customer Mutation: Cancel Item
  const cancelItemMutation = useMutation({
    mutationFn: ({ orderId, itemId, reason }: { orderId: number; itemId: number; reason: string }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return cancelOrderItem(orderId, itemId, reason, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["delivery-orders"] });
      toast.success("Item cancelled successfully.");
      setActionModal(null);
      setReasonInput("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to cancel item.");
    },
  });

  // Customer Mutation: Return Order
  const returnOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return returnOrder(orderId, reason, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["delivery-orders"] });
      toast.success("Return request submitted successfully.");
      setActionModal(null);
      setReasonInput("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to request return.");
    },
  });

  // Customer Mutation: Return Item
  const returnItemMutation = useMutation({
    mutationFn: ({ orderId, itemId, reason }: { orderId: number; itemId: number; reason: string }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return returnOrderItem(orderId, itemId, reason, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["delivery-orders"] });
      toast.success("Item return request submitted successfully.");
      setActionModal(null);
      setReasonInput("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to request return for item.");
    },
  });

  const handleModalSubmit = () => {
    if (!actionModal) return;
    const reason = reasonInput.trim() || "No reason provided";

    if (actionModal.type === "cancel-order") {
      cancelOrderMutation.mutate({ orderId: actionModal.orderId, reason });
    } else if (actionModal.type === "cancel-item" && actionModal.itemId) {
      cancelItemMutation.mutate({ orderId: actionModal.orderId, itemId: actionModal.itemId, reason });
    } else if (actionModal.type === "return-order") {
      returnOrderMutation.mutate({ orderId: actionModal.orderId, reason });
    } else if (actionModal.type === "return-item" && actionModal.itemId) {
      returnItemMutation.mutate({ orderId: actionModal.orderId, itemId: actionModal.itemId, reason });
    }
  };

  const isActionPending =
    cancelOrderMutation.isPending ||
    cancelItemMutation.isPending ||
    returnOrderMutation.isPending ||
    returnItemMutation.isPending;

  const getOrderStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
      case "PROCESSING":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800";
      case "RETURN_REQUESTED":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
      case "RETURNED":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800";
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800";
    }
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    if (paymentStatus === "SUCCESS") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircleIcon className="text-[10px]" /> Paid
        </span>
      );
    }
    if (paymentStatus === "FAILED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
          <TimesCircleIcon className="text-[10px]" /> Payment Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
        <ExclamationIcon className="text-[10px]" /> Payment Pending
      </span>
    );
  };

  const displayedOrders = activeTab === "my-orders" ? myOrders : deliveryOrders;
  const isCurrentLoading = activeTab === "my-orders" ? isMyOrdersLoading : isDeliveryLoading;
  const isCurrentError = activeTab === "my-orders" ? isMyOrdersError : isDeliveryError;

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Payment Confirmation Banner */}
        {paymentResult === "success" && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-start gap-3">
            <CheckCircleIcon className="text-xl text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-base">Payment Confirmed!</p>
              <p className="text-sm mt-0.5 opacity-90">
                Your payment was received successfully{orderParam ? ` for Order #${orderParam}` : ""}. Your order has been moved to Processing and is being prepared for shipment.
              </p>
            </div>
          </div>
        )}

        {paymentResult === "failure" && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-sm dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200 flex items-start gap-3">
            <TimesCircleIcon className="text-xl text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-base">Payment Not Completed</p>
              <p className="text-sm mt-0.5 opacity-90">
                Your payment transaction could not be verified or was cancelled by the gateway. Please review your order or try again from the Cart.
              </p>
            </div>
          </div>
        )}

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
                ? "Accept checkouts, manage shipments, and process returns"
                : "Track your orders, cancel before shipping, or initiate returns after delivery"}
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
          <div className="py-20 text-center text-muted-foreground font-medium flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p>Loading orders...</p>
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
            {displayedOrders.map((order) => {
              const canCancel = order.canCancel ?? (order.status === "PENDING" || order.status === "PROCESSING");
              const canReturn = order.canReturn ?? (order.status === "DELIVERED");

              return (
                <div
                  key={order.id}
                  className="bg-card rounded-2xl border border-border shadow-sm p-6 transition-all hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-lg font-bold text-foreground">Order #{order.id}</p>
                        {getPaymentStatusBadge(order.paymentStatus)}
                        <span
                          className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getOrderStatusBadgeStyle(
                            order.status,
                          )}`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>

                      {/* Reasons display if cancelled or returned */}
                      {order.cancellationReason && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                          Cancellation note: {order.cancellationReason}
                        </p>
                      )}
                      {order.returnReason && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                          Return note: {order.returnReason}
                        </p>
                      )}

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

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Customer Actions: Cancel entire order until shipped */}
                      {activeTab === "my-orders" && canCancel && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActionModal({
                              type: "cancel-order",
                              orderId: order.id,
                              title: `Cancel Entire Order #${order.id}`,
                            });
                            setReasonInput("");
                          }}
                          className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40 text-xs font-bold h-9 px-3 rounded-xl flex items-center gap-1.5"
                        >
                          <TimesCircleIcon /> Cancel Order
                        </Button>
                      )}

                      {/* Customer Actions: Return entire order after delivered */}
                      {activeTab === "my-orders" && canReturn && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActionModal({
                              type: "return-order",
                              orderId: order.id,
                              title: `Request Return for Order #${order.id}`,
                            });
                            setReasonInput("");
                          }}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40 text-xs font-bold h-9 px-3 rounded-xl flex items-center gap-1.5"
                        >
                          <UndoIcon /> Return Order
                        </Button>
                      )}

                      {/* Delivery Staff Actions */}
                      {activeTab === "delivery-console" && (
                        <div className="flex flex-wrap items-center gap-2">
                          {(order.status === "PENDING" || order.status === "PROCESSING") && (
                            <Button
                              onClick={() => acceptMutation.mutate(order.id)}
                              disabled={acceptMutation.isPending}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-3 rounded-xl flex items-center gap-1.5 shadow-sm"
                            >
                              <TruckIcon /> Accept Delivery
                            </Button>
                          )}
                          {order.status === "SHIPPED" && (
                            <Button
                              onClick={() =>
                                updateStatusMutation.mutate({ orderId: order.id, status: "DELIVERED" })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3 rounded-xl flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircleIcon /> Mark as Delivered
                            </Button>
                          )}
                          {order.status === "RETURN_REQUESTED" && (
                            <Button
                              onClick={() => acceptReturnMutation.mutate(order.id)}
                              disabled={acceptReturnMutation.isPending}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs h-9 px-3 rounded-xl flex items-center gap-1.5 shadow-sm"
                            >
                              <UndoIcon /> Accept & Complete Return
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mt-4 space-y-3">
                    {order.items.map((item) => {
                      const isItemCancelled = item.status === "CANCELLED";
                      const isItemReturned = item.status === "RETURNED" || item.status === "RETURN_REQUESTED";

                      return (
                        <div
                          key={item.id}
                          className={`flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center bg-background transition-opacity ${
                            isItemCancelled ? "opacity-60" : ""
                          }`}
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
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-foreground">{item.productName}</p>
                                {isItemCancelled && (
                                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                    Cancelled
                                  </span>
                                )}
                                {item.status === "RETURN_REQUESTED" && (
                                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                    Return Requested
                                  </span>
                                )}
                                {item.status === "RETURNED" && (
                                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    Returned
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                Qty: {item.quantity} · Unit Price: ₹{item.unitPrice}
                              </p>
                              {item.cancellationReason && (
                                <p className="text-xs text-rose-500 mt-0.5">Note: {item.cancellationReason}</p>
                              )}
                              {item.returnReason && (
                                <p className="text-xs text-amber-500 mt-0.5">Return: {item.returnReason}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right font-bold text-foreground">
                              ₹{item.lineTotal}
                            </div>

                            {/* Item-Level Actions for Customer */}
                            {activeTab === "my-orders" && !isItemCancelled && (
                              <div className="flex items-center gap-2">
                                {canCancel && order.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionModal({
                                        type: "cancel-item",
                                        orderId: order.id,
                                        itemId: item.id,
                                        itemName: item.productName,
                                        title: `Cancel ${item.productName}`,
                                      });
                                      setReasonInput("");
                                    }}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline px-2 py-1"
                                  >
                                    Cancel Item
                                  </button>
                                )}
                                {canReturn && !isItemReturned && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionModal({
                                        type: "return-item",
                                        orderId: order.id,
                                        itemId: item.id,
                                        itemName: item.productName,
                                        title: `Return ${item.productName}`,
                                      });
                                      setReasonInput("");
                                    }}
                                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline px-2 py-1"
                                  >
                                    Return Item
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm">
                    <div className="flex items-center gap-3">
                      {activeTab === "my-orders" && order.paymentStatus === "SUCCESS" && (
                        <Button
                          onClick={() => {
                            if (!accessToken) return;
                            setDownloadingInvoice(order.id);
                            void downloadInvoice(order.id, accessToken)
                              .then(() => toast.success("Invoice downloaded!"))
                              .catch((error: Error) => toast.error(error.message))
                              .finally(() => setDownloadingInvoice(null));
                          }}
                          disabled={downloadingInvoice === order.id}
                          className="h-9 bg-purple-600 hover:bg-purple-700 text-xs text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                        >
                          <ReceiptIcon />
                          {downloadingInvoice === order.id ? "Preparing PDF…" : "Download Tax Invoice"}
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <span className="text-muted-foreground">
                        Subtotal: <span className="font-semibold text-foreground">₹{order.subtotal}</span>
                      </span>
                      {order.discountAmount > 0 && (
                        <span className="text-emerald-600 font-medium">
                          Discount: <span className="font-semibold">-₹{order.discountAmount}</span>
                        </span>
                      )}
                      <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
                        Total: ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal for Cancel / Return */}
        {actionModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{actionModal.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {actionModal.type.startsWith("cancel")
                      ? "Are you sure you want to cancel? This action cannot be reversed."
                      : "Please specify why you would like to return this item/order."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {actionModal.itemName && (
                <div className="my-3 p-2.5 rounded-xl bg-muted/60 text-xs font-medium text-foreground">
                  Item: <span className="font-bold">{actionModal.itemName}</span>
                </div>
              )}

              <div className="mt-4">
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {actionModal.type.startsWith("cancel") ? "Reason for cancellation (optional):" : "Reason for return (required):"}
                </label>
                <select
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full h-10 mb-2 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="">-- Choose a standard reason or type below --</option>
                  {actionModal.type.startsWith("cancel") ? (
                    <>
                      <option value="Changed my mind">Changed my mind</option>
                      <option value="Ordered by mistake">Ordered by mistake</option>
                      <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                      <option value="Delivery time is too long">Delivery time is too long</option>
                      <option value="Incorrect shipping address">Incorrect shipping address</option>
                    </>
                  ) : (
                    <>
                      <option value="Item defective or damaged">Item defective or damaged</option>
                      <option value="Wrong item or size received">Wrong item or size received</option>
                      <option value="Item not as described">Item not as described</option>
                      <option value="Quality not as expected">Quality not as expected</option>
                      <option value="No longer needed">No longer needed</option>
                    </>
                  )}
                </select>

                <textarea
                  rows={2}
                  placeholder="Or provide details..."
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActionModal(null)}
                  disabled={isActionPending}
                  className="text-xs font-semibold h-9 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleModalSubmit}
                  disabled={isActionPending || (actionModal.type.startsWith("return") && !reasonInput.trim())}
                  className={`text-xs font-bold h-9 rounded-xl text-white ${
                    actionModal.type.startsWith("cancel")
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {isActionPending
                    ? "Submitting…"
                    : actionModal.type.startsWith("cancel")
                    ? "Confirm Cancellation"
                    : "Submit Return Request"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
