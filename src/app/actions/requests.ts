"use server";

import { revalidatePath } from "next/cache";

export async function refreshRequestsAction() {
  try {
    revalidatePath("/requests");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to revalidate requests path:", error);
  }
}
