import { getDashboardData } from "@/lib/dashboard/dashboardAdapter.v1";
import { createSupabaseServerAuth } from "@/lib/supabase/server";

export default async function DashboardPage() {

  /**
   * Dashboard V1.1
   *
   * The page layer only consumes
   * the Dashboard Product Contract.
   *
   * Intelligence composition happens
   * below this layer.
   */


  const supabase =
    await createSupabaseServerAuth();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();



  if (!user) {

    return (

      <div style={{ padding: 24 }}>

        <h1>
          Career Intelligence Dashboard
        </h1>

        <p>
          User session required.
          Please login to access your career intelligence.
        </p>

      </div>

    );

  }



  const data =
    await getDashboardData(
      user.id
    );



  if (
    !data ||
    data.empty ||
    !data.analytics
  ) {

    return (

      <div style={{ padding: 24 }}>

        <h1>
          Career Intelligence Dashboard
        </h1>

        <p>
          No data available yet.
          Start using the system to generate insights.
        </p>

      </div>

    );

  }



  const analytics =
    data.analytics;



  return (


    <div style={{ padding: 24 }}>


      <h1>
        Career Intelligence Dashboard
      </h1>



      <h2>
        Performance
      </h2>


      <p>
        ATS Avg:{" "}
        {
          (
            analytics?.performance?.avgATS ?? 0
          ).toFixed(2)
        }
      </p>


      <p>
        Ranking Avg:{" "}
        {
          (
            analytics?.performance?.avgRanking ?? 0
          ).toFixed(2)
        }
      </p>



      <h2>
        Funnel
      </h2>


      <p>
        Applications:
        {" "}
        {
          analytics.funnel.applications
        }
      </p>



      <p>

        Hire Probability:
        {" "}

        {
          (
            analytics.funnel.estimatedHireProbability *
            100
          ).toFixed(1)
        }

        %

      </p>



      <h2>
        Status
      </h2>



      <strong>
        {
          data.ui?.status ??
          "UNKNOWN"
        }
      </strong>



      <h2>
        Insights
      </h2>



      <ul>

        {
          (
            analytics?.insights ?? []
          )
          .map(
            (
              insight: string,
              index: number
            ) => (

              <li key={index}>
                {insight}
              </li>

            )
          )
        }

      </ul>


    </div>

  );

}