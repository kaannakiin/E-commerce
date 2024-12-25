"use server";

import { auth } from "@/auth";
import { cache } from "react";

const session = cache(async () => {
  const user = await auth();
  if (user?.user?.id) return user.user.id;
  return null;
});
export { session as SessionId };
