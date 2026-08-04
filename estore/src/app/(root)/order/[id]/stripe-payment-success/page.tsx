import Stripe from "stripe";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";

// 149 - stripe success page
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const StripePaymentSuccessPage = async (props: {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ payment_intent: string }>;
}) => {
  const { id } = await props.params;
  const { payment_intent: paymentIntentId } = await props.searchParams;

  // fetch order
  const order = await getOrderById(id);
  if (!order) notFound();

  // retrieve payment intent
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // check if intent is valid
  if (
    paymentIntent.metadata.orderId === null ||
    paymentIntent.metadata.orderId !== order.id.toString()
  ) {
    return notFound();
  }

  // check if payment is successful
  const isSuccess = paymentIntent.status === "succeeded";
  if (!isSuccess) return redirect(`/order/${id}`);

  return (
    <div className="mx-auto max-w-md space-y-4 py-10 text-center">
      <h1 className="text-2xl">Thanks for your purchase</h1>
      <p className="text-muted-foreground">We are processing your order</p>

      <Button asChild>
        <Link href={`/order/${id}`}>View Order</Link>
      </Button>
    </div>
  );
};

export default StripePaymentSuccessPage;
