import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/product/ImageGallery";
import VariantSelector from "@/components/product/VariantSelector";
import StockStatus from "@/components/product/StockStatus";
import QuantitySelector from "@/components/product/QuantitySelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, Share2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock product data with variants
const mockProductData = {
  id: 1,
  name: "Premium Cotton Baby Romper Set",
  description:
    "Soft, breathable cotton romper perfect for your little one. Features easy snap buttons for quick diaper changes and adorable designs that your baby will love.",
  category: "Newborn",
  basePrice: 1299,
  colors: [
    { id: "pink", name: "Pink", hex: "#EC4899" },
    { id: "blue", name: "Blue", hex: "#3B82F6" },
    { id: "yellow", name: "Yellow", hex: "#F59E0B" },
    { id: "mint", name: "Mint Green", hex: "#10B981" },
  ],
  sizes: [
    { id: "0-3m", name: "0-3M" },
    { id: "3-6m", name: "3-6M" },
    { id: "6-12m", name: "6-12M" },
    { id: "12-18m", name: "12-18M" },
  ],
  variants: {
    "pink-0-3m": { stock: 8, price: 1299, images: generateImages(5, 1522771739844) },
    "pink-3-6m": { stock: 12, price: 1299, images: generateImages(4, 1522771739844) },
    "pink-6-12m": { stock: 3, price: 1399, images: generateImages(5, 1522771739844) },
    "pink-12-18m": { stock: 0, price: 1399, images: generateImages(3, 1522771739844) },
    "blue-0-3m": { stock: 15, price: 1299, images: generateImages(4, 1503944583220) },
    "blue-3-6m": { stock: 20, price: 1299, images: generateImages(5, 1503944583220) },
    "blue-6-12m": { stock: 7, price: 1399, images: generateImages(4, 1503944583220) },
    "blue-12-18m": { stock: 4, price: 1399, images: generateImages(3, 1503944583220) },
    "yellow-0-3m": { stock: 10, price: 1349, images: generateImages(4, 1515488042361) },
    "yellow-3-6m": { stock: 6, price: 1349, images: generateImages(5, 1515488042361) },
    "yellow-6-12m": { stock: 2, price: 1449, images: generateImages(4, 1515488042361) },
    "yellow-12-18m": { stock: 8, price: 1449, images: generateImages(3, 1515488042361) },
    "mint-0-3m": { stock: 12, price: 1299, images: generateImages(5, 1518831959646) },
    "mint-3-6m": { stock: 0, price: 1299, images: generateImages(4, 1518831959646) },
    "mint-6-12m": { stock: 5, price: 1399, images: generateImages(5, 1518831959646) },
    "mint-12-18m": { stock: 9, price: 1399, images: generateImages(3, 1518831959646) },
  },
  details: {
    material: "100% Organic Cotton",
    careInstructions: "Machine wash cold, tumble dry low",
    origin: "Imported",
    features: [
      "Soft and breathable fabric",
      "Easy snap button closures",
      "Expandable shoulders for easy dressing",
      "Tag-free for comfort",
      "Meets safety standards",
    ],
  },
};

function generateImages(count: number, baseId: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `https://images.unsplash.com/photo-${baseId + i}?w=800&h=800&fit=crop`
  );
}

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState(mockProductData.colors[0].id);
  const [selectedSize, setSelectedSize] = useState(mockProductData.sizes[0].id);
  const [quantity, setQuantity] = useState(1);

  const variantKey = `${selectedColor}-${selectedSize}`;
  const currentVariant = mockProductData.variants[variantKey as keyof typeof mockProductData.variants];
  const currentPrice = currentVariant?.price || mockProductData.basePrice;
  const currentStock = currentVariant?.stock || 0;
  const currentImages = currentVariant?.images || generateImages(3, 1515488042361);

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize]);

  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId);
  };

  const handleSizeChange = (sizeId: string) => {
    setSelectedSize(sizeId);
  };

  const handleAddToCart = () => {
    if (currentStock === 0) return;

    toast({
      title: "Added to cart!",
      description: `${quantity}x ${mockProductData.name} - ${
        mockProductData.colors.find((c) => c.id === selectedColor)?.name
      }, ${mockProductData.sizes.find((s) => s.id === selectedSize)?.name}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link to="/shop" className="text-muted-foreground hover:text-primary">
                Shop
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link
                to={`/category/${mockProductData.category.toLowerCase()}`}
                className="text-muted-foreground hover:text-primary"
              >
                {mockProductData.category}
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{mockProductData.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div>
              <ImageGallery images={currentImages} productName={mockProductData.name} />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Category */}
              <div>
                <Badge variant="secondary" className="mb-3">
                  {mockProductData.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{mockProductData.name}</h1>
              </div>

              {/* Price & Stock */}
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-primary">₹{currentPrice}</p>
                <StockStatus stock={currentStock} />
              </div>

              <Separator />

              {/* Description */}
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {mockProductData.description}
                </p>
              </div>

              <Separator />

              {/* Variant Selector */}
              <VariantSelector
                colors={mockProductData.colors}
                sizes={mockProductData.sizes}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onColorChange={handleColorChange}
                onSizeChange={handleSizeChange}
              />

              <Separator />

              {/* Quantity Selector */}
              <QuantitySelector
                quantity={quantity}
                maxQuantity={currentStock}
                onQuantityChange={setQuantity}
                disabled={currentStock === 0}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <Separator />

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Product Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="font-medium w-32">Material:</dt>
                    <dd className="text-muted-foreground">{mockProductData.details.material}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium w-32">Care:</dt>
                    <dd className="text-muted-foreground">
                      {mockProductData.details.careInstructions}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium w-32">Origin:</dt>
                    <dd className="text-muted-foreground">{mockProductData.details.origin}</dd>
                  </div>
                </dl>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Features</h3>
                <ul className="space-y-2">
                  {mockProductData.details.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
