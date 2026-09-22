"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      setError(
        "비밀번호는 6자 이상 입력해주세요."
      );
      return;
    }

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    if (nickname.trim().length < 2) {
      setError(
        "닉네임은 2자 이상 입력해주세요."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            nickname: nickname.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "회원가입에 실패했습니다."
        );
      }

      setSuccess(
        "회원가입이 완료되었습니다!"
      );

      setEmail("");
      setPassword("");
      setNickname("");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "회원가입에 실패했습니다."
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

          <h1>회원가입</h1>

          <span>
            진짜 맛집을 찾는 첫걸음
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
                setPassword(event.target.value)
              }
              placeholder="6자 이상 입력해주세요"
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="nickname">
              닉네임
            </label>

            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(event) =>
                setNickname(event.target.value)
              }
              placeholder="사용할 닉네임을 입력해주세요"
              maxLength={20}
              autoComplete="nickname"
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {success && (
            <p className="auth-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "가입하는 중..."
              : "회원가입"}
          </button>

        </form>

        <div className="auth-footer">
          <span>
            이미 계정이 있으신가요?
          </span>

          <Link href="/login">
            로그인
          </Link>
        </div>
      </div>
    </main>
  );
}