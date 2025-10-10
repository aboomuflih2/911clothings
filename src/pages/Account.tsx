import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountSidebar from "@/components/account/AccountSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, MapPin, User, Package } from "lucide-react";

const Account = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    recentOrders: 0,
    savedAddresses: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch total orders
      const { count: totalCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch recent orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: recentCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Fetch saved addresses
      const { count: addressCount } = await supabase
        .from("addresses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        totalOrders: totalCount || 0,
        recentOrders: recentCount || 0,
        savedAddresses: addressCount || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <AccountSidebar />
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">All time purchases</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.recentOrders}</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Saved Addresses</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.savedAddresses}</div>
                    <p className="text-xs text-muted-foreground">Delivery locations</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link
                      to="/account/orders"
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">View Orders</p>
                        <p className="text-sm text-muted-foreground">
                          Track and manage your purchases
                        </p>
                      </div>
                    </Link>
                    <Link
                      to="/account/addresses"
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Manage Addresses</p>
                        <p className="text-sm text-muted-foreground">
                          Add or edit shipping addresses
                        </p>
                      </div>
                    </Link>
                    <Link
                      to="/account/profile"
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Edit Profile</p>
                        <p className="text-sm text-muted-foreground">
                          Update your personal information
                        </p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground">
                      Have questions about your orders or account?
                    </p>
                    <div className="space-y-2">
                      <Link
                        to="/contact"
                        className="block text-primary hover:underline"
                      >
                        Contact Customer Support
                      </Link>
                      <Link
                        to="/faq"
                        className="block text-primary hover:underline"
                      >
                        View FAQs
                      </Link>
                      <Link
                        to="/shipping"
                        className="block text-primary hover:underline"
                      >
                        Shipping Information
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Account;
