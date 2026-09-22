import jwt from "jsonwebtoken";

const JWT_SECRET: string =
  process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET이 설정되지 않았습니다."
  );
}

export interface JwtPayload {
  userId: string;
  email: string;
  nickname: string;
}

// JWT 생성
export function createToken(
  user: JwtPayload
): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      nickname: user.nickname,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

// JWT 검증
export function verifyToken(
  token: string
): JwtPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as jwt.JwtPayload;

    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.email !== "string" ||
      typeof decoded.nickname !== "string"
    ) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      nickname: decoded.nickname,
    };
  } catch (error) {
    console.error(
      "JWT 검증 실패:",
      error
    );

    return null;
  }
} 