"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function entrar(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      senha: formData.get("senha"),
      redirectTo: "/agenda",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?erro=credenciais");
    }
    throw error;
  }
}
