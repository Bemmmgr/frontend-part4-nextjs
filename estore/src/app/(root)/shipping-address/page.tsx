import { auth } from "@/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShippingAddress } from "@/types";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";

// 058 - shipping address page
export const metadata: Metadata = {
  title: "Shipping Address",
};

const shippingAddresssPage = async () => {
  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) throw new Error("No user ID");

  const user = await getUserById(userId);

  return <>Address</>;
};

export default shippingAddresssPage;
