import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Restaurant from "@/models/Restaurant";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "잘못된 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        { message: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 현재는 로그인 기능 전이므로 리뷰 ID로 삭제
    await Review.findByIdAndDelete(id);

    // 삭제 후 평균 평점 다시 계산
    const reviews = await Review.find({
      restaurantId: review.restaurantId,
    });

    const totalRating = reviews.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    const averageRating =
      reviews.length > 0
        ? totalRating / reviews.length
        : 0;

    await Restaurant.findByIdAndUpdate(
      review.restaurantId,
      {
        averageRating:
          Math.round(averageRating * 10) / 10,
      }
    );

    return NextResponse.json({
      message: "리뷰가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("리뷰 삭제 실패:", error);

    return NextResponse.json(
      {
        message: "리뷰를 삭제하지 못했습니다.",
      },
      { status: 500 }
    );
  }
}