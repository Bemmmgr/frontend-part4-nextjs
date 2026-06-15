"use server";

import { signInFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { email, success } from "zod";

// 034 - signIn & signOut actions
// Sign in user with credentials
export async function signInwithCredentials(
  prevState: unknown,
  formdata: FormData,
) {
  try {
    const user = signInFormSchema.parse({
      email: formdata.get("email"),
      password: formdata.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: "Invaild email or password" };
  }
}

// Sign user out
export async function signOutUser() {
  await signOut();
}
