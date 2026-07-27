import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public");

  if (error) {
    console.error("Database error:", error.message);
    process.exit(1);
  }

  console.log("Public tables:");
  console.table(data);
}

main();