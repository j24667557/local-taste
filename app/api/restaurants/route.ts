import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const situation = searchParams.get("situation");

    const filter: {
      category?: string;
      tags?: string;
    } = {};

    // 음식 종류 필터
    if (category && category !== "전체") {
      filter.category = category;
    }

    // 상황 필터
    if (situation && situation !== "전체") {
      filter.tags = situation;
    }

    const restaurants = await Restaurant.find(filter)
      .sort({ averageRating: -1 })
      .lean();

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("맛집 목록 조회 실패:", error);

    return NextResponse.json(
      {
        message: "맛집 목록을 불러오지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}