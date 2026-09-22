"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./globals.css";

interface User {
  id: string;
  email: string;
  nickname: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const checkLogin = async () => {
    try {
      const response = await fetch(
        "/api/auth/me",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data =
        await response.json();

      setUser(data.user || null);
    } catch (error) {
      console.error(
        "로그인 상태 확인 실패:",
        error
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();

    const handleAuthChange = () => {
      checkLogin();
    };

    window.addEventListener(
      "auth-change",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "auth-change",
        handleAuthChange
      );
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "로그아웃에 실패했습니다."
        );
      }

      setUser(null);

      window.dispatchEvent(
        new Event("auth-change")
      );

      window.location.href = "/";
    } catch (error) {
      console.error(
        "로그아웃 실패:",
        error
      );
    }
  };

  return (
    <html lang="ko">
      <body>
        <header className="global-header">
          <div className="global-header-inner">

            <Link
              href="/"
              className="global-logo"
            >
              <span className="global-logo-icon">
                🍴
              </span>

              <span>
                LocalTaste
              </span>
            </Link>

            <nav className="global-nav">

              <Link href="/">
                홈
              </Link>

              <Link href="/restaurants">
                맛집 찾기
              </Link>

              <Link href="/mypage">
                마이페이지
              </Link>

              {!loading && user ? (
                <>
                  {/* 내 정보 페이지로 이동 */}
                  <Link
                    href="/mypage/profile"
                    className="global-user"
                  >
                    {user.nickname}님
                  </Link>

                  <button
                    type="button"
                    className="global-login"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="global-login"
                >
                  로그인
                </Link>
              )}

            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}