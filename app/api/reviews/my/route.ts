import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest
) {
  try {
    await connectDB();

    // 로그인 토큰 확인
    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "로그인이 필요합니다.",
        },
        {
          status: 401,
        }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        {
          message: "로그인이 필요합니다.",
        },
        {
          status: 401,
        }
      );
    }

    // 현재 로그인한 사용자가 작성한 리뷰만 조회
    const reviews = await Review.find({
      userId: user.userId,
    })
      .populate(
        "restaurantId",
        "name address imageUrl category"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error(
      "내 리뷰 조회 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "내 리뷰를 불러오지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}