import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { createToken } from "@/lib/auth";

export async function POST(
  request: NextRequest
) {
  try {
    await connectDB();

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // 이메일 확인
    if (!email) {
      return NextResponse.json(
        {
          message: "이메일을 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    // 비밀번호 확인
    if (!password) {
      return NextResponse.json(
        {
          message: "비밀번호를 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    // 사용자 찾기
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "이메일 또는 비밀번호가 올바르지 않습니다.",
        },
        {
          status: 401,
        }
      );
    }

    // 비밀번호 확인
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message:
            "이메일 또는 비밀번호가 올바르지 않습니다.",
        },
        {
          status: 401,
        }
      );
    }

    // JWT 생성
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      nickname: user.nickname,
    });

    // 응답 생성
    const response = NextResponse.json(
      {
        message: "로그인되었습니다.",
        user: {
          id: user._id.toString(),
          email: user.email,
          nickname: user.nickname,
        },
      },
      {
        status: 200,
      }
    );

    // JWT를 쿠키에 저장
    response.cookies.set(
      "token",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error(
      "로그인 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "로그인에 실패했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}