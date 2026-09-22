"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "로그인에 실패했습니다."
        );
      }

      // 공통 헤더에 로그인 상태 변경 알림
      window.dispatchEvent(
        new Event("auth-change")
      );

      alert(
        `${data.user.nickname}님, 환영합니다!`
      );

      router.push("/");
    } catch (error) {
      console.error(
        "로그인 실패:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "로그인에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <p>LOCAL TASTE</p>

          <h1>로그인</h1>

          <span>
            진짜 맛집을 찾으러 가볼까요?
          </span>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-field">
            <label htmlFor="email">
              이메일
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="example@email.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">
              비밀번호
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "로그인하는 중..."
              : "로그인"}
          </button>

        </form>

        <div className="auth-footer">
          <span>
            아직 계정이 없으신가요?
          </span>

          <Link href="/signup">
            회원가입
          </Link>
        </div>

      </div>
    </main>
  );
}