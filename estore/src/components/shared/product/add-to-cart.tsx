"use client";
import { toast } from "sonner";
import { CartItem } from "@/types";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addItemToCart } from "@/lib/actions/cart.actions";

// 046 - Add to cart component
const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const response = await addItemToCart(item);

    if (!response.success) {
      toast.error(response.message || "Failed to add item to cart");
      return;
    }

    // success
    toast.success(`${item.name} added to cart`, {
      action: {
        label: "Go To Cart",
        onClick: () => router.push("/cart"),
      },
    });
  };

  return (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      <Plus />
      Add To Cart
    </Button>
  );
};

export default AddToCart;
