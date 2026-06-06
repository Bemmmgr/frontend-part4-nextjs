import { cn } from "@/lib/utils";

// 017 - product price
const ProductPrice = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  // ensure two decimal places
  const stringValue = value.toFixed(2);
  //   get int/float
  const [intValue, floavalue] = stringValue.split(".");

  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">$</span>
      {intValue}
      <span className="text-xs align-super">.{floavalue}</span>
    </p>
  );
};

export default ProductPrice;
