import { auth } from "@/auth";
import { redirect } from "next/navigation";

// 098 - protecting admin routes
export async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  return session;
}
