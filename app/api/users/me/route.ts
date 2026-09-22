import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET이 설정되지 않았습니다.");
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authorization = request.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const token = authorization.split(" ")[1];

    let decoded: { userId: string };

    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
      };
    } catch {
      return NextResponse.json(
        {
          message: "유효하지 않거나 만료된 토큰입니다.",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId)
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          message: "사용자를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        tastePreference: user.tastePreference,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);

    return NextResponse.json(
      {
        message: "사용자 정보를 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}