import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShippingAddress } from "@/types";
import { getOrderById } from "@/lib/actions/order.actions";

// 072 - order page
export const metadata: Metadata = {
  title: "Order Details",
};

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return <>details {id}</>;
};

export default OrderDetailsPage;
