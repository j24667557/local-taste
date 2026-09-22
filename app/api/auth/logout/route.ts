import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "로그아웃되었습니다.",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(
      "로그아웃 실패:",
      error
    );

    return NextResponse.json(
      {
        message: "로그아웃에 실패했습니다.",
      },
      {
        status: 500,
      }
    );
  }
} 