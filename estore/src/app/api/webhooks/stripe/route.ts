import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { updateOrderToPaid } from "@/lib/actions/order.actions";

// 150 - webhook to mark as paid
export async function POST(req: NextRequest) {
  // build webhook event
  const event = await Stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string,
  );

  // check for success payment
  if (event.type === "charge.succeeded") {
    const { object } = event.data;

    // update order status
    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: "COMPLETED",
        email_address: object.billing_details.email!,
        pricePaid: (object.amount / 100).toFixed(),
      },
    });

    return NextResponse.json({
      message: "updateOrderToPaid was successful",
    });
  }

  return NextResponse.json({
    message: "Event is not charge.succeeded",
  });
}
