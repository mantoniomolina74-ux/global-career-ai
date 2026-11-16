import { supabaseServer } from "@/lib/supabase-server";

const PAGE_SIZE = 24;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const pageParam = Number(searchParams.get("page") ?? "1");
    const page =
      Number.isFinite(pageParam) && pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const search = searchParams.get("search")?.trim() ?? "";
    const country = searchParams.get("country")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const escapedSearch = search.replace(/[%_,]/g, "\\$&");

    let jobsQuery = supabaseServer
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("source", "hirebase")
      .eq("is_active", true)
      .not("url", "is", null)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      jobsQuery = jobsQuery.or(
        `title.ilike.%${escapedSearch}%,company.ilike.%${escapedSearch}%`
      );
    }

    if (country) {
      jobsQuery = jobsQuery.eq("country", country);
    }

    if (category) {
      jobsQuery = jobsQuery.eq("category", category);
    }

    const [jobsResult, catalogResult] = await Promise.all([
      jobsQuery,
      supabaseServer
        .from("jobs")
        .select("country, category")
        .eq("source", "hirebase")
        .eq("is_active", true)
        .not("url", "is", null),
    ]);

    const {
      data: jobs,
      error: jobsError,
      count,
    } = jobsResult;

    if (jobsError) {
      return Response.json(
        {
          success: false,
          error: jobsError.message,
        },
        { status: 500 }
      );
    }

    const { data: catalogRows, error: catalogError } = catalogResult;

    if (catalogError) {
      return Response.json(
        {
          success: false,
          error: catalogError.message,
        },
        { status: 500 }
      );
    }

    const countries = Array.from(
      new Set(
        (catalogRows ?? [])
          .map((job) => job.country?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b));

    const categories = Array.from(
      new Set(
        (catalogRows ?? [])
          .map((job) => job.category?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b));

    const total = count ?? 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    return Response.json({
      success: true,
      jobs: jobs ?? [],
      meta: {
        matching: false,
        source: "hirebase",
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        search,
        country,
        category,
        countries,
        categories,
      },
    });
  } catch (error: unknown) {
    console.error("JOBS API ERROR:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error cargando empleos",
      },
      { status: 500 }
    );
  }
}