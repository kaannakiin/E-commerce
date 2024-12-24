"use server";

import { signOut } from "@/auth";

export async function signOutUser() {
  try {
    await signOut({ redirect: true, redirectTo: "/" });
  } catch (error) {}
}
