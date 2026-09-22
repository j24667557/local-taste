"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  nickname: string;
  tastePreference: string[];
}

export default function ProfilePage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "내 정보를 불러오지 못했습니다."
          );
        }

        setUser(data.user);
      } catch (error) {
        console.error(
          "내 정보 조회 실패:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "내 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          내 정보를 불러오는 중...
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="profile-page">
        <div className="profile-error">
          <h1>
            내 정보를 불러올 수 없습니다.
          </h1>

          <p>
            {error ||
              "로그인이 필요합니다."}
          </p>

          <Link href="/login">
            로그인하러 가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">

      <div className="profile-container">

        {/* 상단 */}
        <div className="profile-back">
          <Link href="/mypage">
            ← 마이페이지
          </Link>
        </div>

        <div className="profile-header">
          <p>MY PROFILE</p>

          <h1>
            내 정보
          </h1>

          <span>
            LocalTaste에 등록된 내 정보를 확인할 수 있습니다.
          </span>
        </div>

        {/* 프로필 카드 */}
        <section className="profile-card">

          <div className="profile-avatar">
            👤
          </div>

          <div className="profile-basic">

            <span className="profile-label">
              닉네임
            </span>

            <h2>
              {user.nickname}
            </h2>

            <p>
              LocalTaste 사용자
            </p>

          </div>

        </section>

        {/* 기본 정보 */}
        <section className="profile-info-card">

          <div className="profile-card-title">
            <p>ACCOUNT</p>

            <h2>
              계정 정보
            </h2>
          </div>

          <div className="profile-info-list">

            <div className="profile-info-row">
              <span>
                닉네임
              </span>

              <strong>
                {user.nickname}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>
                이메일
              </span>

              <strong>
                {user.email}
              </strong>
            </div>

          </div>

        </section>

        {/* 내 취향 */}
        <section className="profile-info-card">

          <div className="profile-card-title">
            <p>MY TASTE</p>

            <h2>
              내 취향
            </h2>
          </div>

          {user.tastePreference &&
          user.tastePreference.length > 0 ? (
            <div className="profile-taste-list">

              {user.tastePreference.map(
                (taste) => (
                  <span key={taste}>
                    {taste}
                  </span>
                )
              )}

            </div>
          ) : (
            <div className="profile-empty-taste">
              아직 설정한 취향이 없습니다.
            </div>
          )}

        </section>

        {/* 마이페이지로 */}
        <div className="profile-actions">

          <Link
            href="/mypage"
            className="profile-main-button"
          >
            마이페이지로 돌아가기
          </Link>

        </div>

      </div>

    </main>
  );
}