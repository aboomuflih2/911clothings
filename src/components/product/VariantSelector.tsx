import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Color {
  id: string;
  name: string;
  hex: string;
}

interface Size {
  id: string;
  name: string;
}

interface VariantSelectorProps {
  colors: Color[];
  sizes: Size[];
  selectedColor: string;
  selectedSize: string;
  onColorChange: (colorId: string) => void;
  onSizeChange: (sizeId: string) => void;
}

const VariantSelector = ({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
}: VariantSelectorProps) => {
  return (
    <div className="space-y-6">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Color</h3>
            <span className="text-sm text-muted-foreground">
              {colors.find((c) => c.id === selectedColor)?.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => onColorChange(color.id)}
                className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                  selectedColor === color.id
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={`Select ${color.name}`}
              >
                {selectedColor === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white drop-shadow-lg" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Size</h3>
            <span className="text-sm text-muted-foreground">
              {sizes.find((s) => s.id === selectedSize)?.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Button
                key={size.id}
                variant={selectedSize === size.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSizeChange(size.id)}
                className="min-w-[60px]"
              >
                {size.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
