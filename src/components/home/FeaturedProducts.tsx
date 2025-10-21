import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          id,
          title,
          category_id,
          categories (
            name
          ),
          product_images (
            image_url,
            is_primary
          ),
          product_variants (
            price
          )
        `)
        .eq("is_active", true)
        .limit(4);

      if (productsError) throw productsError;

      return productsData?.map((product) => ({
        id: product.id,
        name: product.title,
        price: product.product_variants?.[0]?.price || 0,
        image: product.product_images?.find((img) => img.is_primary)?.image_url || 
               product.product_images?.[0]?.image_url || 
               "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
        category: product.categories?.name || "Uncategorized",
      }));
    },
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
          <p className="text-muted-foreground">Handpicked favorites for your little ones</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
        <p className="text-muted-foreground">Handpicked favorites for your little ones</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all">
            <CardContent className="p-0">
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-primary font-bold text-xl">₹{product.price.toLocaleString()}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button size="lg" variant="outline" asChild>
          <Link to="/shop">View All Products</Link>
        </Button>
      </div>
    </section>
  );
};

export default FeaturedProducts;
