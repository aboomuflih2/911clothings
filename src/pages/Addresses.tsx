import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountSidebar from "@/components/account/AccountSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Trash2, Edit, Star } from "lucide-react";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(50),
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number required").max(15),
  addressLine1: z.string().trim().min(1, "Address is required").max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  postalCode: z.string().trim().min(1, "Postal code is required").max(10),
  country: z.string().trim().min(1, "Country is required").max(100),
});

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const Addresses = () => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const fetchAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAddresses(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFormData({
      label: "",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    });
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      fullName: address.full_name,
      phone: address.phone,
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = addressSchema.parse(formData);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const addressData = {
        user_id: user.id,
        label: validatedData.label,
        full_name: validatedData.fullName,
        phone: validatedData.phone,
        address_line_1: validatedData.addressLine1,
        address_line_2: validatedData.addressLine2 || null,
        city: validatedData.city,
        state: validatedData.state,
        postal_code: validatedData.postalCode,
        country: validatedData.country,
      };

      if (editingAddress) {
        const { error } = await supabase
          .from("addresses")
          .update(addressData)
          .eq("id", editingAddress.id);

        if (error) throw error;

        toast({
          title: "Address updated",
          description: "Your address has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert([addressData]);

        if (error) throw error;

        toast({
          title: "Address added",
          description: "Your new address has been saved.",
        });
      }

      resetForm();
      setDialogOpen(false);
      fetchAddresses();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save address. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete address.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Address deleted",
        description: "The address has been removed.",
      });
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Remove default from all addresses
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    // Set new default
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to set default address.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Default address updated",
        description: "This address is now your default.",
      });
      fetchAddresses();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <AccountSidebar />
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">My Addresses</h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAddress ? "Edit Address" : "Add New Address"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="label">Address Label</Label>
                          <Input
                            id="label"
                            placeholder="Home, Office, etc."
                            value={formData.label}
                            onChange={(e) =>
                              setFormData({ ...formData, label: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({ ...formData, fullName: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="addressLine1">Address Line 1</Label>
                          <Input
                            id="addressLine1"
                            value={formData.addressLine1}
                            onChange={(e) =>
                              setFormData({ ...formData, addressLine1: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                          <Input
                            id="addressLine2"
                            value={formData.addressLine2}
                            onChange={(e) =>
                              setFormData({ ...formData, addressLine2: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) =>
                              setFormData({ ...formData, state: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            value={formData.postalCode}
                            onChange={(e) =>
                              setFormData({ ...formData, postalCode: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) =>
                              setFormData({ ...formData, country: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        {editingAddress ? "Update Address" : "Save Address"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <p className="text-center">Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No addresses saved</h3>
                    <p className="text-muted-foreground mb-6">
                      Add an address for faster checkout
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <Card key={address.id} className="relative">
                      {address.is_default && (
                        <div className="absolute top-3 right-3">
                          <Star className="h-5 w-5 fill-primary text-primary" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{address.label}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm space-y-1">
                          <p className="font-semibold">{address.full_name}</p>
                          <p>{address.phone}</p>
                          <p>{address.address_line_1}</p>
                          {address.address_line_2 && <p>{address.address_line_2}</p>}
                          <p>
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p>{address.country}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(address)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {!address.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(address.id)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(address.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Addresses;
