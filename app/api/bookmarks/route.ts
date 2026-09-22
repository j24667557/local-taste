import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Bookmark from "@/models/Bookmark";
import Restaurant from "@/models/Restaurant";
import { verifyToken } from "@/lib/auth";

async function getLoginUser(
  request: NextRequest
) {
  const token =
    request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  return payload;
}

/* =========================
   GET
   내 북마크 목록
========================= */

export async function GET(
  request: NextRequest
) {
  try {
    await connectDB();

    const user =
      await getLoginUser(request);

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

    const bookmarks =
      await Bookmark.find({
        userId: user.userId,
      })
        .populate(
          "restaurantId",
          "name address category tags imageUrl averageRating"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json(
      bookmarks
    );
  } catch (error) {
    console.error(
      "북마크 조회 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "북마크를 불러오지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   POST
   북마크 추가
========================= */

export async function POST(
  request: NextRequest
) {
  try {
    await connectDB();

    const user =
      await getLoginUser(request);

    if (!user) {
      return NextResponse.json(
        {
          message:
            "북마크를 사용하려면 로그인이 필요합니다.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const restaurantId =
      typeof body.restaurantId === "string"
        ? body.restaurantId
        : "";

    if (
      !restaurantId ||
      !mongoose.Types.ObjectId.isValid(
        restaurantId
      )
    ) {
      return NextResponse.json(
        {
          message:
            "올바른 맛집 ID가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    const restaurant =
      await Restaurant.findById(
        restaurantId
      );

    if (!restaurant) {
      return NextResponse.json(
        {
          message:
            "맛집을 찾을 수 없습니다.",
        },
        {
          status: 404,
        }
      );
    }

    const existingBookmark =
      await Bookmark.findOne({
        userId: user.userId,
        restaurantId,
      });

    if (existingBookmark) {
      return NextResponse.json(
        {
          message:
            "이미 찜한 맛집입니다.",
        },
        {
          status: 409,
        }
      );
    }

    const bookmark =
      await Bookmark.create({
        userId: user.userId,
        restaurantId,
      });

    return NextResponse.json(
      {
        message:
          "맛집이 찜 목록에 추가되었습니다.",
        bookmark,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "북마크 추가 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "북마크 추가에 실패했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   DELETE
   북마크 삭제
========================= */

export async function DELETE(
  request: NextRequest
) {
  try {
    await connectDB();

    const user =
      await getLoginUser(request);

    if (!user) {
      return NextResponse.json(
        {
          message:
            "로그인이 필요합니다.",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const restaurantId =
      searchParams.get(
        "restaurantId"
      );

    if (
      !restaurantId ||
      !mongoose.Types.ObjectId.isValid(
        restaurantId
      )
    ) {
      return NextResponse.json(
        {
          message:
            "올바른 맛집 ID가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    const bookmark =
      await Bookmark.findOneAndDelete({
        userId: user.userId,
        restaurantId,
      });

    if (!bookmark) {
      return NextResponse.json(
        {
          message:
            "찜한 맛집을 찾을 수 없습니다.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      message:
        "찜 목록에서 삭제되었습니다.",
    });
  } catch (error) {
    console.error(
      "북마크 삭제 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "북마크 삭제에 실패했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}