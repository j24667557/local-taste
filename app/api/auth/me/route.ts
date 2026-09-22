import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

async function getUserFromRequest(
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

  return user;
}

export async function GET(
  request: NextRequest
) {
  try {
    await connectDB();

    const user =
      await getUserFromRequest(request);

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

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        nickname: user.nickname,
        tastePreference:
          user.tastePreference,
      },
    });
  } catch (error) {
    console.error(
      "사용자 정보 조회 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "사용자 정보를 불러오지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    await connectDB();

    const user =
      await getUserFromRequest(request);

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

    const body =
      await request.json();

    const tastePreference =
      Array.isArray(body.tastePreference)
        ? body.tastePreference
            .filter(
              (taste: unknown) =>
                typeof taste === "string"
            )
            .map((taste: string) =>
              taste.trim()
            )
            .filter(Boolean)
        : [];

    user.tastePreference =
      tastePreference;

    await user.save();

    return NextResponse.json({
      message: "취향이 저장되었습니다.",
      user: {
        id: user._id.toString(),
        email: user.email,
        nickname: user.nickname,
        tastePreference:
          user.tastePreference,
      },
    });
  } catch (error) {
    console.error(
      "취향 저장 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "취향을 저장하지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}