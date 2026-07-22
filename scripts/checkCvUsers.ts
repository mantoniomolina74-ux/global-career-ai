import dotenv from "dotenv";

dotenv.config({
  path: ".env.local"
});
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from("cv_analyses")
    .select("user_id, created_at")
    .limit(5);

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }

  console.log("CV Users:");
  console.log(data);
}

main();