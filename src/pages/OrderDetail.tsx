import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountSidebar from "@/components/account/AccountSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ChevronLeft, Package, MapPin, Truck } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  variant_color: string | null;
  variant_size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Address {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  addresses: Address | null;
  payment_method?: string | null;
  payment_status?: string | null;
  payment_proof_url?: string | null;
}

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofSrc, setProofSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch order with address
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          addresses (
            full_name,
            phone,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (!orderError && orderData) {
        setOrderData(orderData);
        if (orderData.payment_method === "upi" && orderData.payment_proof_url) {
          const match = String(orderData.payment_proof_url).match(/payment-proofs\/(.*)$/);
          const path = match ? match[1] : null;
          if (path) {
            const { data, error } = await supabase.storage
              .from("payment-proofs")
              .createSignedUrl(path, 3600);
            if (!error && data?.signedUrl) {
              setProofSrc(data.signedUrl);
            } else {
              const { data: blob, error: dlErr } = await supabase.storage
                .from("payment-proofs")
                .download(path);
              if (!dlErr && blob) {
                setProofSrc(URL.createObjectURL(blob));
              } else {
                setProofSrc(orderData.payment_proof_url);
              }
            }
          } else {
            setProofSrc(orderData.payment_proof_url);
          }
        } else {
          setProofSrc(null);
        }
      }

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (!itemsError && itemsData) {
        setItems(itemsData);
      }

      setLoading(false);
    };

    fetchOrderDetails();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <p className="text-center">Loading order details...</p>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <p className="text-center">Order not found</p>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <AccountSidebar />
            
            <div className="flex-1">
              <Link
                to="/account/orders"
                className="inline-flex items-center text-primary hover:underline mb-6"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Orders
              </Link>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold">{order.order_number}</h1>
                  <p className="text-muted-foreground">
                    Placed on {format(new Date(order.created_at), "PPP")}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.product_name}</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {item.variant_color && (
                                <p>Color: {item.variant_color}</p>
                              )}
                              {item.variant_size && (
                                <p>Size: {item.variant_size}</p>
                              )}
                              <p>Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ₹{item.total_price.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ₹{item.unit_price.toLocaleString()} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Tracking Information */}
                  {order.tracking_number && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="h-5 w-5" />
                          Tracking Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Tracking Number
                        </p>
                        <p className="font-mono font-semibold">
                          {order.tracking_number}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment Proof (UPI) */}
                  {order.payment_method === "upi" && order.payment_proof_url && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Proof</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <img
                            src={proofSrc || order.payment_proof_url || undefined}
                            alt="Payment proof"
                            className="max-h-64 rounded border"
                            crossOrigin="anonymous"
                            onError={async () => {
                              const match = String(order.payment_proof_url).match(/payment-proofs\/(.*)$/);
                              const path = match ? match[1] : null;
                              if (!path) return;
                              const { data, error } = await supabase.storage
                                .from("payment-proofs")
                                .createSignedUrl(path, 3600);
                              if (!error && data?.signedUrl) {
                                setProofSrc(data.signedUrl);
                                return;
                              }
                              const { data: blob, error: dlErr } = await supabase.storage
                                .from("payment-proofs")
                                .download(path);
                              if (!dlErr && blob) {
                                setProofSrc(URL.createObjectURL(blob));
                              }
                            }}
                          />
                          {proofSrc && (
                            <a href={proofSrc} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Open full image</a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Order Summary & Shipping */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{order.total_amount.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{order.total_amount.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {order.addresses && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Shipping Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-1">
                          <p className="font-semibold">{order.addresses.full_name}</p>
                          <p>{order.addresses.phone}</p>
                          <p>{order.addresses.address_line_1}</p>
                          {order.addresses.address_line_2 && (
                            <p>{order.addresses.address_line_2}</p>
                          )}
                          <p>
                            {order.addresses.city}, {order.addresses.state}{" "}
                            {order.addresses.postal_code}
                          </p>
                          <p>{order.addresses.country}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {order.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{order.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default OrderDetail;
