import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface StockStatusProps {
  stock: number;
}

const StockStatus = ({ stock }: StockStatusProps) => {
  if (stock === 0) {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <XCircle className="h-4 w-4" />
        Out of Stock
      </Badge>
    );
  }

  if (stock <= 5) {
    return (
      <Badge variant="secondary" className="gap-1.5 bg-accent text-accent-foreground">
        <AlertCircle className="h-4 w-4" />
        Only {stock} left!
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1.5 bg-secondary text-secondary-foreground">
      <CheckCircle2 className="h-4 w-4" />
      In Stock
    </Badge>
  );
};

export default StockStatus;
