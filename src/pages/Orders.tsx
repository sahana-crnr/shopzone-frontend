import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Button } from "../components/ui/button";
import useAuthStore from "../store/useAuthStore";
import { fetchOrders } from "../api/commerce";
import { OrderSummary } from "../types/shop";

const Orders: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery<OrderSummary[]>({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(accessToken ?? ""),
    enabled: Boolean(accessToken),
    retry: false,
  });

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            My Orders
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Recent order history from the backend
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">
            Loading orders...
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-muted-foreground">
            Unable to load orders.
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-lg opacity-70">
              You have no orders yet.
            </p>
            <Link to="/home">
              <Button className="mt-6 bg-purple-600 hover:bg-purple-700">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-2xl border border-border shadow-sm p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-lg font-bold">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Shipping address: {order.shippingAddress}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-purple-600/10 px-3 py-1 font-semibold text-purple-700 dark:text-purple-300">
                      {order.status}
                    </span>
                    {order.coupon ? (
                      <span className="rounded-full bg-green-600/10 px-3 py-1 font-semibold text-green-700 dark:text-green-300">
                        {order.coupon.code} ({order.coupon.discountPercent}%)
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={
                            item.productImage?.startsWith("/")
                              ? process.env.PUBLIC_URL + item.productImage
                              : item.productImage
                          }
                          alt={item.productName}
                          className="h-16 w-16 rounded-lg border border-border object-contain bg-background p-1"
                        />
                        <div>
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} · Unit Price: ₹{item.unitPrice}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-semibold">
                        ₹{item.lineTotal}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-end gap-6 border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">
                    Subtotal: <span className="font-semibold">₹{order.subtotal}</span>
                  </span>
                  <span className="text-green-600">
                    Discount:{" "}
                    <span className="font-semibold">-₹{order.discountAmount}</span>
                  </span>
                  <span className="text-lg font-bold text-foreground">
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
