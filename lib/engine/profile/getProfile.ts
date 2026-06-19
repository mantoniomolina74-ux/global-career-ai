import { supabase } from "@/lib/supabase";

export async function getProfile(userId: string) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}