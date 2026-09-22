import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    console.log("상세 맛집 ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          message: "잘못된 맛집 ID입니다.",
        },
        {
          status: 400,
        }
      );
    }

    const restaurant =
      await Restaurant.findById(id).lean();

    console.log(
      "상세 맛집 데이터:",
      restaurant
    );

    if (!restaurant) {
      return NextResponse.json(
        {
          message: "맛집을 찾을 수 없습니다.",
        },
        {
          status: 404,
        }
      );
    }

    // 프론트에서 사용하는 데이터 형태로 정리
    const result = {
      _id: restaurant._id.toString(),

      name:
        restaurant.name || "",

      address:
        restaurant.address || "",

      category:
        restaurant.category || "",

      tags:
        Array.isArray(restaurant.tags)
          ? restaurant.tags
          : [],

      imageUrl:
        restaurant.imageUrl || "",

      location:
        restaurant.location &&
        typeof restaurant.location.lat ===
          "number" &&
        typeof restaurant.location.lng ===
          "number"
          ? {
              lat: restaurant.location.lat,
              lng: restaurant.location.lng,
            }
          : null,

      averageRating:
        typeof restaurant.averageRating ===
        "number"
          ? restaurant.averageRating
          : 0,
    };

    console.log(
      "프론트로 보내는 데이터:",
      result
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "맛집 상세 조회 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "맛집 정보를 불러오지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}