import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MapPin, 
  User 
} from "lucide-react";

const AccountSidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/account",
    },
    {
      icon: ShoppingBag,
      label: "Orders",
      path: "/account/orders",
    },
    {
      icon: MapPin,
      label: "Addresses",
      path: "/account/addresses",
    },
    {
      icon: User,
      label: "Profile",
      path: "/account/profile",
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="font-bold text-lg mb-4">My Account</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AccountSidebar;
