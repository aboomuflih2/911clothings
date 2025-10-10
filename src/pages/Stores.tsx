import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Store {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string | null;
  opening_hours: any;
  latitude: number;
  longitude: number;
}

const Stores = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState("");
  const [tokenSet, setTokenSet] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (tokenSet && stores.length > 0 && mapContainer.current) {
      initializeMap();
    }
  }, [tokenSet, stores]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setStores((data || []) as Store[]);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetToken = () => {
    if (mapboxToken.trim()) {
      setTokenSet(true);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    const centerLat = stores.length > 0
      ? stores.reduce((sum, store) => sum + store.latitude, 0) / stores.length
      : 20.5937;
    const centerLng = stores.length > 0
      ? stores.reduce((sum, store) => sum + store.longitude, 0) / stores.length
      : 78.9629;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [centerLng, centerLat],
      zoom: stores.length === 1 ? 12 : 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    stores.forEach((store) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-lg mb-2">${store.name}</h3>
          <p class="text-sm mb-1">${store.address_line_1}</p>
          <p class="text-sm mb-1">${store.city}, ${store.state} ${store.postal_code}</p>
          <p class="text-sm font-medium mt-2">📞 ${store.phone}</p>
        </div>
      `);

      new mapboxgl.Marker({ color: "#8B5CF6" })
        .setLngLat([store.longitude, store.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  const formatOpeningHours = (hours: { [key: string]: string }) => {
    return Object.entries(hours).map(([day, time]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      time,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Our Showrooms
            </h1>
            <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto">
              Visit us at any of our locations to experience our products firsthand
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {!tokenSet ? (
            <Card className="max-w-md mx-auto mb-8">
              <CardHeader>
                <CardTitle>Enter Mapbox Token</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
                  <Input
                    id="mapbox-token"
                    type="text"
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                    placeholder="pk.eyJ1Ij..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Get your token from{" "}
                    <a
                      href="https://account.mapbox.com/access-tokens/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Mapbox Dashboard
                    </a>
                  </p>
                </div>
                <Button onClick={handleSetToken} className="w-full">
                  Load Map
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div ref={mapContainer} className="w-full h-[500px] rounded-lg shadow-lg mb-12" />
          )}

          {loading ? (
            <div className="text-center py-12">Loading stores...</div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No stores available at the moment
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <Card key={store.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>{store.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {store.address_line_1}
                        {store.address_line_2 && <>, {store.address_line_2}</>}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {store.city}, {store.state} {store.postal_code}
                      </p>
                      <p className="text-sm text-muted-foreground">{store.country}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <a
                        href={`tel:${store.phone}`}
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {store.phone}
                      </a>
                    </div>

                    {store.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <a
                          href={`mailto:${store.email}`}
                          className="text-sm hover:text-primary transition-colors"
                        >
                          {store.email}
                        </a>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Operating Hours</p>
                      </div>
                      <div className="space-y-1 ml-6">
                        {formatOpeningHours(store.opening_hours).map(({ day, time }) => (
                          <div key={day} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{day}</span>
                            <span>{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Stores;
