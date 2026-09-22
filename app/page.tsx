"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  category: string;
  tags: string[];
  imageUrl: string;
  averageRating: number;
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedSituation, setSelectedSituation] = useState("전체");

  const [showRecommendation, setShowRecommendation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommendLoading, setRecommendLoading] = useState(false);

  // 각 맛집의 실제 리뷰 개수
  const [reviewCounts, setReviewCounts] = useState<
    Record<string, number | null>
  >({});

  const categories = [
    "전체",
    "한식",
    "중식",
    "일식",
    "양식",
    "카페",
  ];

  const situations = [
    "전체",
    "혼밥",
    "소개팅",
    "부모님 식사",
    "회식",
    "데이트",
  ];

  // 실제 리뷰 개수 불러오기
  const loadReviewCounts = async (
    items: Restaurant[]
  ) => {
    const results = await Promise.all(
      items.map(async (restaurant) => {
        try {
          const response = await fetch(
            `/api/restaurants/${restaurant._id}/reviews`,
            {
              cache: "no-store",
            }
          );

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          return {
            id: restaurant._id,
            count: Array.isArray(data)
              ? data.length
              : 0,
          };
        } catch (error) {
          console.error(
            `${restaurant.name} 리뷰 개수 조회 실패:`,
            error
          );

          return null;
        }
      })
    );

    const nextCounts: Record<
      string,
      number
    > = {};

    results.forEach((result) => {
      if (result) {
        nextCounts[result.id] =
          result.count;
      }
    });

    setReviewCounts((prev) => ({
      ...prev,
      ...nextCounts,
    }));
  };

  // 전체 맛집 불러오기
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await fetch(
          "/api/restaurants"
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        const restaurantList =
          Array.isArray(data)
            ? data
            : [];

        setRestaurants(
          restaurantList
        );

        loadReviewCounts(
          restaurantList
        );
      } catch (error) {
        console.error(
          "맛집 조회 실패:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  // 추천 맛집
  const handleRecommend = async () => {
    try {
      setRecommendLoading(true);
      setShowRecommendation(true);

      const params =
        new URLSearchParams();

      if (
        selectedCategory !== "전체"
      ) {
        params.set(
          "category",
          selectedCategory
        );
      }

      if (
        selectedSituation !== "전체"
      ) {
        params.set(
          "situation",
          selectedSituation
        );
      }

      const query =
        params.toString();

      const response = await fetch(
        query
          ? `/api/restaurants?${query}`
          : "/api/restaurants"
      );

      if (!response.ok) {
        throw new Error();
      }

      const data =
        await response.json();

      const restaurantList =
        Array.isArray(data)
          ? data
          : [];

      setRecommendations(
        restaurantList
      );

      loadReviewCounts(
        restaurantList
      );
    } catch (error) {
      console.error(
        "추천 맛집 조회 실패:",
        error
      );

      setRecommendations([]);
    } finally {
      setRecommendLoading(false);
    }
  };

  return (
    <main className="home-page">

      {/* =========================
          메인 히어로
      ========================== */}
      <section className="hero-section">

        {/* 왼쪽 작은 추천 박스 */}
        <div className="today-card">
          <p className="today-label">
            오늘의 추천
          </p>

          <h1>
            우리 동네
            <br />
            찐맛집을 찾아보세요.
          </h1>

          <p className="today-description">
            내 취향과 상황에 맞는 맛집 추천
          </p>

          <div className="today-decoration">
            <span>🍴</span>
            <span>⭐</span>
            <span>📍</span>
          </div>
        </div>

        {/* 오른쪽 소개 */}
        <div className="hero-content">
          <p className="hero-eyebrow">
            REAL LOCAL RESTAURANT
          </p>

          <h2>
            광고보다
            <br />
            <strong>
              진짜 경험
            </strong>
            을 믿으세요.
          </h2>

          <p className="hero-description">
            LocalTaste는 우리 동네 사람들이 직접
            <br />
            방문하고 경험한 맛집을 쉽게 찾아볼 수 있는
            <br />
            로컬 맛집 추천 서비스입니다.
          </p>

          <div className="hero-stats">
            <div>
              <strong>100%</strong>
              <span>로컬 중심</span>
            </div>

            <div>
              <strong>5.0</strong>
              <span>최고 평점</span>
            </div>

            <div>
              <strong>REAL</strong>
              <span>방문자 리뷰</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          맛집 찾기
      ========================== */}
      <section className="finder-section">

        <div className="section-heading">
          <div>
            <p>FIND YOUR RESTAURANT</p>

            <h2>
              오늘은 어떤 맛집이 필요하세요?
            </h2>

            <span>
              음식과 방문 상황을 선택해보세요.
            </span>
          </div>
        </div>

        <div className="finder-box">

          {/* 음식 종류 */}
          <div className="finder-group">
            <div className="finder-title">
              <span className="finder-icon">
                🍚
              </span>

              <div>
                <strong>음식 종류</strong>
                <small>
                  어떤 음식을 먹고 싶나요?
                </small>
              </div>
            </div>

            <div className="category-list">
              {categories.map(
                (category) => (
                  <button
                    key={category}
                    className={
                      selectedCategory ===
                      category
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setSelectedCategory(
                        category
                      )
                    }
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 방문 상황 */}
          <div className="finder-group">
            <div className="finder-title">
              <span className="finder-icon">
                💬
              </span>

              <div>
                <strong>방문 상황</strong>
                <small>
                  누구와 함께 가나요?
                </small>
              </div>
            </div>

            <div className="situation-list">
              {situations.map(
                (situation) => (
                  <button
                    key={situation}
                    className={
                      selectedSituation ===
                      situation
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setSelectedSituation(
                        situation
                      )
                    }
                  >
                    {situation}
                  </button>
                )
              )}
            </div>
          </div>

          <button
            className="recommend-button"
            onClick={handleRecommend}
          >
            <span>
              내 취향 맛집 추천받기
            </span>

            <b>→</b>
          </button>
        </div>
      </section>

      {/* =========================
          추천 결과
      ========================== */}
      {showRecommendation && (
        <section className="recommended-result">

          <div className="section-heading result-heading">
            <div>
              <p>YOUR RECOMMENDATION</p>

              <h2>
                당신을 위한 추천 맛집
              </h2>

              <span>
                선택한 조건에 맞는 맛집이에요.
              </span>
            </div>
          </div>

          {recommendLoading ? (
            <div className="loading-box">
              <div className="loading-icon">
                🍽️
              </div>

              <p>
                딱 맞는 맛집을 찾고 있어요...
              </p>
            </div>
          ) : recommendations.length ===
            0 ? (
            <div className="empty-result">
              <div>🔎</div>

              <h3>
                선택하신 조건에 맞는 맛집이 없습니다.
              </h3>

              <p>
                다른 음식이나 상황을 선택해보세요.
              </p>
            </div>
          ) : (
            <div className="restaurant-grid">

              {recommendations.map(
                (restaurant) => (
                  <Link
                    key={restaurant._id}
                    href={`/restaurants/${restaurant._id}`}
                    className="restaurant-card"
                  >
                    <div className="restaurant-image">

                      {restaurant.imageUrl ? (
                        <img
                          src={
                            restaurant.imageUrl
                          }
                          alt={
                            restaurant.name
                          }
                        />
                      ) : (
                        <span>
                          🍽️
                        </span>
                      )}

                      {/* 평점 */}
                      <div className="image-rating">
                        {reviewCounts[
                          restaurant._id
                        ] === null ||
                        reviewCounts[
                          restaurant._id
                        ] === undefined
                          ? "평점 확인 중..."
                          : reviewCounts[
                              restaurant._id
                            ] === 0
                            ? "⭐ 평점 없음"
                            : `⭐ ${restaurant.averageRating.toFixed(
                                1
                              )}`}
                      </div>
                    </div>

                    <div className="restaurant-info">

                      <span className="category-badge">
                        {restaurant.category}
                      </span>

                      <h3>
                        {restaurant.name}
                      </h3>

                      <p className="restaurant-address">
                        📍{" "}
                        {
                          restaurant.address
                        }
                      </p>

                      <div className="restaurant-tags">
                        {restaurant.tags.map(
                          (tag) => (
                            <span
                              key={tag}
                            >
                              #{tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </Link>
                )
              )}

            </div>
          )}
        </section>
      )}

      {/* =========================
          전체 추천 맛집
      ========================== */}
      <section className="restaurants-section">

        <div className="section-heading restaurant-heading">
          <div>
            <p>
              RECOMMENDED RESTAURANTS
            </p>

            <h2>
              동네에서 많이 찾는 맛집
            </h2>

            <span>
              LocalTaste가 엄선한 맛집을 만나보세요.
            </span>
          </div>

          <Link
            href="/restaurants"
            className="view-all"
          >
            전체 맛집 보기
            <b>→</b>
          </Link>
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="loading-icon">
              🍴
            </div>

            <p>
              맛집을 불러오는 중...
            </p>
          </div>
        ) : restaurants.length ===
          0 ? (
          <div className="empty-result">
            <div>🍽️</div>

            <h3>
              등록된 맛집이 없습니다.
            </h3>

            <p>
              MongoDB에 맛집 데이터를 추가해주세요.
            </p>
          </div>
        ) : (
          <div className="restaurant-grid">

            {restaurants.map(
              (restaurant) => (
                <Link
                  key={restaurant._id}
                  href={`/restaurants/${restaurant._id}`}
                  className="restaurant-card"
                >
                  <div className="restaurant-image">

                    {restaurant.imageUrl ? (
                      <img
                        src={
                          restaurant.imageUrl
                        }
                        alt={
                          restaurant.name
                        }
                      />
                    ) : (
                      <span>
                        🍽️
                      </span>
                    )}

                    {/* 평점 */}
                    <div className="image-rating">
                      {reviewCounts[
                        restaurant._id
                      ] === null ||
                      reviewCounts[
                        restaurant._id
                      ] === undefined
                        ? "평점 확인 중..."
                        : reviewCounts[
                            restaurant._id
                          ] === 0
                          ? "⭐ 평점 없음"
                          : `⭐ ${restaurant.averageRating.toFixed(
                              1
                            )}`}
                    </div>
                  </div>

                  <div className="restaurant-info">

                    <span className="category-badge">
                      {restaurant.category}
                    </span>

                    <h3>
                      {restaurant.name}
                    </h3>

                    <p className="restaurant-address">
                      📍{" "}
                      {
                        restaurant.address
                      }
                    </p>

                    <div className="restaurant-tags">
                      {restaurant.tags.map(
                        (tag) => (
                          <span
                            key={tag}
                          >
                            #{tag}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </Link>
              )
            )}

          </div>
        )}
      </section>

      {/* =========================
          하단 브랜드 영역
      ========================== */}
      <footer className="home-footer">

        <div>
          <h2>
            Local<span>Taste</span>
          </h2>

          <p>
            광고보다 진짜 경험을 믿습니다.
          </p>
        </div>

        <div className="footer-message">
          <span>
            YOUR LOCAL
          </span>

          <strong>
            YOUR TASTE.
          </strong>
        </div>

      </footer>

    </main>
  );
}