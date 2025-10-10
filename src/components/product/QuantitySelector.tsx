import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
}

const QuantitySelector = ({
  quantity,
  maxQuantity,
  onQuantityChange,
  disabled,
}: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-semibold">Quantity:</span>
      <div className="flex items-center border border-border rounded-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDecrease}
          disabled={disabled || quantity <= 1}
          className="h-10 w-10 rounded-r-none"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="w-14 h-10 flex items-center justify-center border-x border-border font-semibold">
          {quantity}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleIncrease}
          disabled={disabled || quantity >= maxQuantity}
          className="h-10 w-10 rounded-l-none"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {maxQuantity > 0 && (
        <span className="text-sm text-muted-foreground">
          (Max: {maxQuantity})
        </span>
      )}
    </div>
  );
};

export default QuantitySelector;
