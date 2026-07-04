"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/actions/order.actions";

const PlaceOrderButton = ({ isPending }: { isPending: boolean }) => {
  return (
    <Button disabled={isPending} className="w-full">
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Check className="w-4 h-4" />
      )}{" "}
      Place Order
    </Button>
  );
};

// 072 - place order form
const PlaceOrderForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const response = await createOrder();

      if (!response.success) {
        toast.error(response.message || "Failed to place order");

        if (response.redirectTo) {
          router.push(response.redirectTo);
        }

        return;
      }

      toast.success(response.message);

      if (response.redirectTo) {
        router.push(response.redirectTo);
      }
    });
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <PlaceOrderButton isPending={isPending} />
    </form>
  );
};

export default PlaceOrderForm;
