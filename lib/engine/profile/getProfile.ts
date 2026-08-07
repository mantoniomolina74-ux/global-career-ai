import { supabaseServer } from "@/lib/supabase-server";

export async function getProfile(userId: string) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}