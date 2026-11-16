import { NextResponse } from "next/server";
import {
createEnterpriseOrganization,
getUserOrganizations,
} from "@/lib/enterprise/organizationService";
import { createSupabaseServerAuth } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
const supabase = await createSupabaseServerAuth();

const {
data: { user },
error,
} = await supabase.auth.getUser();

if (error || !user) {
throw new Error("Authentication required");
}

return user;
}

export async function GET() {
try {
const user = await getAuthenticatedUser();
const organizations = await getUserOrganizations(user.id);

return NextResponse.json({
  success: true,
  organizations,
});

} catch (error: unknown) {
return NextResponse.json(
{
success: false,
error: error instanceof Error ? error.message : "Unknown error",
},
{ status: 401 }
);
}
}

export async function POST(req: Request) {
try {
const user = await getAuthenticatedUser();
const body = await req.json();

if (
  typeof body !== "object" ||
  body === null ||
  Array.isArray(body)
) {
  throw new Error("Invalid request body");
}

const name = (body as { name?: unknown }).name;

if (typeof name !== "string") {
  throw new Error("Organization name is required");
}

const organization = await createEnterpriseOrganization(
  user.id,
  name
);

return NextResponse.json(
  {
    success: true,
    organization,
  },
  { status: 201 }
);

} catch (error: unknown) {
return NextResponse.json(
{
success: false,
error: error instanceof Error ? error.message : "Unknown error",
},
{ status: 400 }
);
}
}
