import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

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

  const user = await User.findById(
    payload.userId
  );

  if (!user) {
    return null;
  }

  return user;
}

async function updateAverageRating(
  restaurantId: string
) {
  const reviews = await Review.find({
    restaurantId,
  });

  const totalRating = reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  const averageRating =
    reviews.length > 0
      ? totalRating / reviews.length
      : 0;

  await Restaurant.findByIdAndUpdate(
    restaurantId,
    {
      averageRating:
        Math.round(averageRating * 10) / 10,
    }
  );
}

// =========================
// 리뷰 조회
// =========================

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json([]);
    }

    const restaurant =
      await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json([]);
    }

    const reviews =
      await Review.find({
        restaurantId: id,
      })
        .populate(
          "userId",
          "nickname email"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error(
      "리뷰 조회 실패:",
      error
    );

    return NextResponse.json([]);
  }
}

// =========================
// 리뷰 등록
// =========================

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          message:
            "잘못된 맛집 ID입니다.",
        },
        {
          status: 400,
        }
      );
    }

    const restaurant =
      await Restaurant.findById(id);

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

    // 로그인 사용자 확인
    const user =
      await getLoginUser(request);

    if (!user) {
      return NextResponse.json(
        {
          message:
            "리뷰를 작성하려면 로그인이 필요합니다.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const rating =
      Number(body.rating);

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          message:
            "별점은 1점부터 5점까지 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          message:
            "리뷰 내용을 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    const review =
      await Review.create({
        userId: user._id,
        restaurantId: id,
        rating,
        content,
        receiptAuth:
          body.receiptAuth ?? false,
      });

    await updateAverageRating(id);

    return NextResponse.json(
      {
        message:
          "리뷰가 등록되었습니다.",
        review,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "리뷰 등록 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "리뷰를 등록하지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// 리뷰 수정
// =========================

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          message:
            "잘못된 맛집 ID입니다.",
        },
        {
          status: 400,
        }
      );
    }

    const restaurant =
      await Restaurant.findById(id);

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

    // 로그인 사용자 확인
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

    const reviewId =
      searchParams.get("reviewId");

    if (
      !reviewId ||
      !mongoose.Types.ObjectId.isValid(
        reviewId
      )
    ) {
      return NextResponse.json(
        {
          message:
            "올바른 리뷰 ID가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const rating =
      Number(body.rating);

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          message:
            "별점은 1점부터 5점까지 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          message:
            "리뷰 내용을 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    // 본인이 작성한 리뷰만 수정
    const review =
      await Review.findOneAndUpdate(
        {
          _id: reviewId,
          restaurantId: id,
          userId: user._id,
        },
        {
          rating,
          content,
          receiptAuth:
            body.receiptAuth ?? false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!review) {
      return NextResponse.json(
        {
          message:
            "수정할 리뷰를 찾을 수 없거나 본인의 리뷰가 아닙니다.",
        },
        {
          status: 404,
        }
      );
    }

    await updateAverageRating(id);

    return NextResponse.json({
      message:
        "리뷰가 수정되었습니다.",
      review,
    });
  } catch (error) {
    console.error(
      "리뷰 수정 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "리뷰를 수정하지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// 리뷰 삭제
// =========================

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          message:
            "잘못된 맛집 ID입니다.",
        },
        {
          status: 400,
        }
      );
    }

    const restaurant =
      await Restaurant.findById(id);

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

    // 로그인 사용자 확인
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

    const reviewId =
      searchParams.get("reviewId");

    if (
      !reviewId ||
      !mongoose.Types.ObjectId.isValid(
        reviewId
      )
    ) {
      return NextResponse.json(
        {
          message:
            "올바른 리뷰 ID가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    // 본인이 작성한 리뷰만 삭제
    const review =
      await Review.findOne({
        _id: reviewId,
        restaurantId: id,
        userId: user._id,
      });

    if (!review) {
      return NextResponse.json(
        {
          message:
            "삭제할 리뷰를 찾을 수 없거나 본인의 리뷰가 아닙니다.",
        },
        {
          status: 404,
        }
      );
    }

    await Review.deleteOne({
      _id: reviewId,
      restaurantId: id,
      userId: user._id,
    });

    await updateAverageRating(id);

    return NextResponse.json({
      message:
        "리뷰가 삭제되었습니다.",
    });
  } catch (error) {
    console.error(
      "리뷰 삭제 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "리뷰를 삭제하지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}