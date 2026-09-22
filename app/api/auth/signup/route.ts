import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

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

    const nickname =
      typeof body.nickname === "string"
        ? body.nickname.trim()
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

    // 이메일 형식 확인
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message:
            "올바른 이메일 형식을 입력해주세요.",
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
          message:
            "비밀번호를 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message:
            "비밀번호는 6자 이상 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    // 닉네임 확인
    if (!nickname) {
      return NextResponse.json(
        {
          message:
            "닉네임을 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    if (nickname.length < 2) {
      return NextResponse.json(
        {
          message:
            "닉네임은 2자 이상 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    // 이미 가입된 이메일인지 확인
    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "이미 가입된 이메일입니다.",
        },
        {
          status: 409,
        }
      );
    }

    // 비밀번호 암호화
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // 회원 생성
    const user = await User.create({
      email,
      password: hashedPassword,
      nickname,
      tastePreference: [],
    });

    return NextResponse.json(
      {
        message:
          "회원가입이 완료되었습니다.",
        user: {
          id: user._id.toString(),
          email: user.email,
          nickname: user.nickname,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "회원가입 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "회원가입에 실패했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}