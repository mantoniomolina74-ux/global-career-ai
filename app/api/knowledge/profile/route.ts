import { NextResponse } from "next/server";

import {
  analyzeKnowledgeProfile
} from "@/lib/knowledge/services/knowledgeProfileService";


export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();


    const {
      professionalText
    } = body;


    if (
      !professionalText ||
      typeof professionalText !== "string"
    ) {

      return NextResponse.json(
        {
          error:
            "professionalText is required"
        },
        {
          status:400
        }
      );

    }


    const result =
      analyzeKnowledgeProfile(
        professionalText
      );


    return NextResponse.json(
      {
        success:true,
        result
      }
    );


  } catch(error: unknown) {


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal error"
      },
      {
        status:500
      }
    );

  }

}