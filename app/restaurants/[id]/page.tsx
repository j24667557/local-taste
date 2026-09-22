"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import NaverMap from "@/components/NaverMap";

interface Restaurant {
  _id: string;
  name?: string;
  address?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
  averageRating?: number;
}

interface Review {
  _id: string;
  rating: number;
  content: string;
  receiptAuth: boolean;
  createdAt: string;
  userId?: {
    nickname?: string;
    email?: string;
  };
}

interface Bookmark {
  _id: string;
  restaurantId:
    | string
    | {
        _id?: string;
      };
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [reviewLoading, setReviewLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showReviewForm, setShowReviewForm] =
    useState(false);

  const [rating, setRating] =
    useState(5);

  const [content, setContent] =
    useState("");

  const [receiptAuth, setReceiptAuth] =
    useState(false);

  const [submitLoading, setSubmitLoading] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  // 찜 상태
  const [isBookmarked, setIsBookmarked] =
    useState(false);

  const [bookmarkLoading, setBookmarkLoading] =
    useState(false);

  // 맛집 정보 불러오기
  const loadRestaurant = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/restaurants/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "맛집 정보를 불러오지 못했습니다."
        );
      }

      setRestaurant(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "맛집 정보를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 리뷰 불러오기
  const loadReviews = async () => {
    try {
      setReviewLoading(true);

      const response = await fetch(
        `/api/restaurants/${id}/reviews`
      );

      if (!response.ok) {
        throw new Error(
          "리뷰를 불러오지 못했습니다."
        );
      }

      const data = await response.json();

      setReviews(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
      setReviews([]);
    } finally {
      setReviewLoading(false);
    }
  };

  // 찜 상태 불러오기
  const loadBookmark = async () => {
    try {
      const response = await fetch(
        "/api/bookmarks",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      // 로그인하지 않은 경우
      if (response.status === 401) {
        setIsBookmarked(false);
        return;
      }

      if (!response.ok) {
        return;
      }

      const data =
        await response.json();

      if (!Array.isArray(data)) {
        setIsBookmarked(false);
        return;
      }

      const bookmarked =
        data.some(
          (bookmark: Bookmark) => {
            if (
              typeof bookmark.restaurantId ===
              "string"
            ) {
              return (
                bookmark.restaurantId === id
              );
            }

            return (
              bookmark.restaurantId?._id === id
            );
          }
        );

      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error(
        "찜 상태 확인 실패:",
        error
      );
    }
  };

  useEffect(() => {
    if (!id) return;

    loadRestaurant();
    loadReviews();
    loadBookmark();
  }, [id]);

  // 찜하기 / 찜 취소
  const handleBookmark = async () => {
    if (bookmarkLoading) {
      return;
    }

    try {
      setBookmarkLoading(true);

      if (isBookmarked) {
        const response = await fetch(
          `/api/bookmarks?restaurantId=${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data =
          await response.json();

        if (response.status === 401) {
          alert(
            "찜하기를 이용하려면 로그인해주세요."
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "찜 취소에 실패했습니다."
          );
        }

        setIsBookmarked(false);
      } else {
        const response = await fetch(
          "/api/bookmarks",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              restaurantId: id,
            }),
          }
        );

        const data =
          await response.json();

        if (response.status === 401) {
          alert(
            "찜하기를 이용하려면 로그인해주세요."
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "찜하기에 실패했습니다."
          );
        }

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error(
        "찜하기 처리 실패:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "찜하기 처리에 실패했습니다."
      );
    } finally {
      setBookmarkLoading(false);
    }
  };

  // 리뷰 등록
  const handleSubmitReview = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitError("");

    if (!content.trim()) {
      setSubmitError(
        "리뷰 내용을 입력해주세요."
      );
      return;
    }

    if (content.trim().length < 5) {
      setSubmitError(
        "리뷰는 5자 이상 작성해주세요."
      );
      return;
    }

    try {
      setSubmitLoading(true);

      const response = await fetch(
        `/api/restaurants/${id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            rating,
            content: content.trim(),
            receiptAuth,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "리뷰 등록에 실패했습니다."
        );
      }

      setRating(5);
      setContent("");
      setReceiptAuth(false);
      setSubmitError("");
      setShowReviewForm(false);

      await loadReviews();
      await loadRestaurant();

      alert("리뷰가 등록되었습니다!");
    } catch (error) {
      console.error(error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "리뷰 등록에 실패했습니다."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // 리뷰 삭제
  const handleDeleteReview = async (
    reviewId: string
  ) => {
    const confirmed =
      window.confirm(
        "이 리뷰를 삭제하시겠습니까?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/restaurants/${id}/reviews?reviewId=${reviewId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "리뷰 삭제에 실패했습니다."
        );
      }

      await loadReviews();
      await loadRestaurant();

      alert("리뷰가 삭제되었습니다!");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "리뷰 삭제에 실패했습니다."
      );
    }
  };

  // 로딩
  if (loading) {
    return (
      <main>
        <div className="detail-loading">
          맛집 정보를 불러오는 중...
        </div>
      </main>
    );
  }

  // 오류
  if (error || !restaurant) {
    return (
      <main>
        <div className="detail-error">
          <h1>
            맛집을 찾을 수 없습니다.
          </h1>

          <p>
            {error ||
              "존재하지 않는 맛집입니다."}
          </p>

          <Link href="/restaurants">
            ← 맛집 목록으로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="restaurant-detail-page">

      {/* 뒤로가기 */}
      <div className="detail-back">
        <Link href="/restaurants">
          ← 맛집 목록
        </Link>
      </div>

      {/* 맛집 기본 정보 */}
      <section className="restaurant-detail-hero">

        {/* 이미지 */}
        <div className="detail-image">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={
                restaurant.name ||
                "맛집 이미지"
              }
            />
          ) : (
            <span>🍽️</span>
          )}
        </div>

        {/* 정보 */}
        <div className="detail-info">

          <span className="detail-category">
            {restaurant.category ||
              "카테고리 없음"}
          </span>

          {/* 맛집 이름 + 찜 버튼 */}
          <div className="restaurant-title-row">

            <h1>
              {restaurant.name ||
                "맛집 정보 없음"}
            </h1>

            <button
              type="button"
              className={
                isBookmarked
                  ? "bookmark-button bookmarked"
                  : "bookmark-button"
              }
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              aria-label={
                isBookmarked
                  ? "찜 취소"
                  : "찜하기"
              }
            >
              <span className="bookmark-heart">
                {isBookmarked
                  ? "❤️"
                  : "🤍"}
              </span>
            </button>

          </div>

          {/* 평점 */}
          <div className="detail-rating">
            <strong>
              {reviews.length === 0
                ? "⭐ 평점 없음"
                : `⭐ ${(restaurant.averageRating ?? 0).toFixed(1)}`}
            </strong>

            <span>
              {reviews.length}개의 리뷰
            </span>
          </div>

          {/* 주소 */}
          <p className="detail-address">
            📍{" "}
            {restaurant.address ||
              "주소 정보 없음"}
          </p>

          {/* 태그 */}
          <div className="detail-tags">
            {(restaurant.tags ?? []).map(
              (tag) => (
                <span key={tag}>
                  #{tag}
                </span>
              )
            )}
          </div>

        </div>
      </section>

      {/* 지도 */}
      <section className="restaurant-map-section">

        <div className="detail-section-header">
          <div>
            <p>LOCATION</p>
            <h2>맛집 위치</h2>
          </div>
        </div>

        {restaurant.location &&
        typeof restaurant.location.lat ===
          "number" &&
        typeof restaurant.location.lng ===
          "number" ? (
          <NaverMap
            lat={restaurant.location.lat}
            lng={restaurant.location.lng}
            name={
              restaurant.name ||
              "맛집"
            }
          />
        ) : (
          <div className="map-empty">
            위치 정보가 없습니다.
          </div>
        )}

      </section>

      {/* 리뷰 */}
      <section className="review-section">

        <div className="detail-section-header">

          <div>
            <p>REAL REVIEWS</p>
            <h2>청정 리뷰</h2>
          </div>

          <button
            type="button"
            className="review-write-button"
            onClick={() => {
              setShowReviewForm(
                !showReviewForm
              );

              setSubmitError("");
            }}
          >
            ✏️{" "}
            {showReviewForm
              ? "작성 취소"
              : "리뷰 쓰기"}
          </button>

        </div>

        {/* 리뷰 작성 폼 */}
        {showReviewForm && (
          <div className="review-form-card">

            <div className="review-form-header">
              <p>WRITE A REVIEW</p>

              <h3>
                {restaurant.name ||
                  "이 맛집"}{" "}
                방문 후기를
                남겨주세요
              </h3>
            </div>

            <form
              className="review-form"
              onSubmit={
                handleSubmitReview
              }
            >

              {/* 별점 */}
              <div className="review-form-field">

                <label>
                  별점
                </label>

                <div className="star-selector">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        className={
                          star <= rating
                            ? "star active"
                            : "star"
                        }
                        onClick={() =>
                          setRating(star)
                        }
                      >
                        ★
                      </button>
                    )
                  )}

                  <span>
                    {rating}.0
                  </span>

                </div>

              </div>

              {/* 리뷰 내용 */}
              <div className="review-form-field">

                <label>
                  리뷰 내용
                </label>

                <textarea
                  value={content}
                  onChange={(event) =>
                    setContent(
                      event.target.value
                    )
                  }
                  placeholder="직접 방문해본 솔직한 후기를 남겨주세요."
                  maxLength={500}
                />

                <small>
                  {content.length}/500
                </small>

              </div>

              {/* 영수증 인증 */}
              <label className="receipt-check">

                <input
                  type="checkbox"
                  checked={receiptAuth}
                  onChange={(event) =>
                    setReceiptAuth(
                      event.target.checked
                    )
                  }
                />

                <span>
                  ✓ 영수증 인증 리뷰입니다
                </span>

              </label>

              {/* 에러 */}
              {submitError && (
                <p className="review-submit-error">
                  {submitError}
                </p>
              )}

              {/* 등록 버튼 */}
              <button
                type="submit"
                className="review-submit-button"
                disabled={submitLoading}
              >
                {submitLoading
                  ? "등록하는 중..."
                  : "리뷰 등록하기"}
              </button>

            </form>
          </div>
        )}

        {/* 리뷰 로딩 */}
        {reviewLoading ? (

          <div className="review-empty">
            리뷰를 불러오는 중...
          </div>

        ) : reviews.length === 0 ? (

          /* 리뷰 없음 */
          <div className="review-empty">

            <div>💬</div>

            <h3>
              아직 리뷰가 없습니다.
            </h3>

            <p>
              이 맛집을 방문했다면
              첫 번째 리뷰를 남겨보세요.
            </p>

          </div>

        ) : (

          /* 리뷰 목록 */
          <div className="review-list">

            {reviews.map((review) => (

              <article
                key={review._id}
                className="review-card"
              >

                {/* 리뷰 상단 */}
                <div className="review-top">

                  <div className="review-user">

                    <span className="review-avatar">
                      👤
                    </span>

                    <div>

                      <strong>
                        {review.userId
                          ?.nickname ||
                          "LocalTaste 사용자"}
                      </strong>

                      <small>
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString(
                          "ko-KR"
                        )}
                      </small>

                    </div>

                  </div>

                  <div className="review-actions">

                    <div className="review-rating">
                      {"⭐".repeat(
                        Math.max(
                          0,
                          Math.min(
                            5,
                            review.rating || 0
                          )
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      className="review-delete-button"
                      onClick={() =>
                        handleDeleteReview(
                          review._id
                        )
                      }
                    >
                      삭제
                    </button>

                  </div>

                </div>

                {/* 리뷰 내용 */}
                <p className="review-content">
                  {review.content}
                </p>

                {/* 영수증 인증 */}
                {review.receiptAuth && (
                  <span className="receipt-badge">
                    ✓ 영수증 인증
                  </span>
                )}

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}