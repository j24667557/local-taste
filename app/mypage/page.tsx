"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  nickname: string;
  tastePreference: string[];
}

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  imageUrl: string;
  category: string;
}

interface MyReview {
  _id: string;
  rating: number;
  content: string;
  receiptAuth: boolean;
  createdAt: string;
  restaurantId?: Restaurant;
}

interface Bookmark {
  _id: string;
  restaurantId?: Restaurant;
  createdAt?: string;
}

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);

  const [reviews, setReviews] =
    useState<MyReview[]>([]);

  const [bookmarks, setBookmarks] =
    useState<Bookmark[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [reviewLoading, setReviewLoading] =
    useState(true);

  const [bookmarkLoading, setBookmarkLoading] =
    useState(true);

  const [showTasteSetting, setShowTasteSetting] =
    useState(false);

  const [selectedTaste, setSelectedTaste] =
    useState<string[]>([]);

  const [saveLoading, setSaveLoading] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");

  // 리뷰 수정
  const [editingReview, setEditingReview] =
    useState<MyReview | null>(null);

  const [editRating, setEditRating] =
    useState(5);

  const [editContent, setEditContent] =
    useState("");

  const [editReceiptAuth, setEditReceiptAuth] =
    useState(false);

  const [editLoading, setEditLoading] =
    useState(false);

  const tasteOptions = [
    "한식",
    "중식",
    "일식",
    "양식",
    "카페",
    "혼밥",
    "소개팅",
    "부모님 식사",
    "회식",
    "데이트",
  ];

  // =========================
  // 사용자 정보
  // =========================

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

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data =
          await response.json();

        setUser(data.user || null);

        setSelectedTaste(
          data.user?.tastePreference || []
        );
      } catch (error) {
        console.error(
          "사용자 정보 조회 실패:",
          error
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // =========================
  // 내 리뷰 조회
  // =========================

  const loadMyReviews = async () => {
    try {
      setReviewLoading(true);

      const response = await fetch(
        "/api/reviews/my",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setReviews([]);
        return;
      }

      const data =
        await response.json();

      setReviews(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "내 리뷰 조회 실패:",
        error
      );

      setReviews([]);
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    loadMyReviews();
  }, []);

  // =========================
  // 북마크 조회
  // =========================

  const loadBookmarks = async () => {
    try {
      setBookmarkLoading(true);

      const response = await fetch(
        "/api/bookmarks",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setBookmarks([]);
        return;
      }

      const data =
        await response.json();

      // API 응답이 배열인 경우
      if (Array.isArray(data)) {
        setBookmarks(data);
        return;
      }

      // { bookmarks: [...] } 형태인 경우
      if (Array.isArray(data.bookmarks)) {
        setBookmarks(data.bookmarks);
        return;
      }

      setBookmarks([]);
    } catch (error) {
      console.error(
        "북마크 조회 실패:",
        error
      );

      setBookmarks([]);
    } finally {
      setBookmarkLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  // =========================
  // 취향 선택
  // =========================

  const handleTasteToggle = (
    taste: string
  ) => {
    setSelectedTaste((current) => {
      if (current.includes(taste)) {
        return current.filter(
          (item) => item !== taste
        );
      }

      return [...current, taste];
    });
  };

  // =========================
  // 취향 저장
  // =========================

  const handleSaveTaste = async () => {
    try {
      setSaveLoading(true);
      setSaveMessage("");

      const response = await fetch(
        "/api/auth/me",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            tastePreference:
              selectedTaste,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "취향 저장에 실패했습니다."
        );
      }

      setUser(data.user);

      setSaveMessage(
        "취향이 저장되었습니다!"
      );

      setShowTasteSetting(false);
    } catch (error) {
      console.error(
        "취향 저장 실패:",
        error
      );

      setSaveMessage(
        error instanceof Error
          ? error.message
          : "취향 저장에 실패했습니다."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // =========================
  // 리뷰 수정창 열기
  // =========================

  const handleEditOpen = (
    review: MyReview
  ) => {
    setEditingReview(review);

    setEditRating(
      review.rating
    );

    setEditContent(
      review.content
    );

    setEditReceiptAuth(
      review.receiptAuth
    );
  };

  // =========================
  // 리뷰 수정
  // =========================

  const handleEditReview = async () => {
    if (!editingReview) {
      return;
    }

    if (!editContent.trim()) {
      alert(
        "리뷰 내용을 입력해주세요."
      );

      return;
    }

    if (
      editContent.trim().length < 5
    ) {
      alert(
        "리뷰는 5자 이상 작성해주세요."
      );

      return;
    }

    try {
      setEditLoading(true);

      const restaurantId =
        editingReview.restaurantId?._id;

      if (!restaurantId) {
        throw new Error(
          "맛집 정보를 찾을 수 없습니다."
        );
      }

      const response = await fetch(
        `/api/restaurants/${restaurantId}/reviews?reviewId=${editingReview._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            rating: editRating,
            content:
              editContent.trim(),
            receiptAuth:
              editReceiptAuth,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "리뷰 수정에 실패했습니다."
        );
      }

      setEditingReview(null);

      await loadMyReviews();

      alert(
        "리뷰가 수정되었습니다."
      );
    } catch (error) {
      console.error(
        "리뷰 수정 실패:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "리뷰 수정에 실패했습니다."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // =========================
  // 리뷰 삭제
  // =========================

  const handleDeleteReview = async (
    review: MyReview
  ) => {
    const restaurantId =
      review.restaurantId?._id;

    if (!restaurantId) {
      alert(
        "맛집 정보를 찾을 수 없습니다."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "이 리뷰를 삭제하시겠습니까?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/reviews?reviewId=${review._id}`,
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

      await loadMyReviews();

      alert(
        "리뷰가 삭제되었습니다."
      );
    } catch (error) {
      console.error(
        "리뷰 삭제 실패:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "리뷰 삭제에 실패했습니다."
      );
    }
  };

  // =========================
  // 로딩
  // =========================

  if (loading) {
    return (
      <main className="mypage">
        <div className="mypage-container">
          <div className="mypage-loading">
            내 정보를 불러오는 중...
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // 로그인 필요
  // =========================

  if (!user) {
    return (
      <main className="mypage">
        <div className="mypage-container">
          <div className="mypage-login-required">
            <div className="mypage-icon">
              🔐
            </div>

            <h1>
              로그인이 필요합니다.
            </h1>

            <p>
              마이페이지를 이용하려면
              로그인해주세요.
            </p>

            <Link
              href="/login"
              className="mypage-login-button"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mypage">
      <div className="mypage-container">

        {/* =====================
            Header
        ====================== */}

        <div className="mypage-header">
          <div>
            <p>MY PAGE</p>

            <h1>
              {user.nickname}님의
              <br />
              LocalTaste
            </h1>
          </div>

          <div className="mypage-profile-icon">
            👤
          </div>
        </div>

        {/* =====================
            내 취향
        ====================== */}

        <section className="mypage-section">
          <div className="mypage-section-title">
            <p>MY TASTE</p>

            <h2>내 취향</h2>
          </div>

          <div className="mypage-taste-card">

            {showTasteSetting ? (
              <>
                <div className="taste-setting-header">
                  <h3>
                    어떤 맛집을 좋아하시나요?
                  </h3>

                  <p>
                    좋아하는 음식과 방문 상황을
                    선택해주세요.
                  </p>
                </div>

                <div className="taste-options">
                  {tasteOptions.map(
                    (taste) => (
                      <button
                        key={taste}
                        type="button"
                        className={
                          selectedTaste.includes(
                            taste
                          )
                            ? "taste-option selected"
                            : "taste-option"
                        }
                        onClick={() =>
                          handleTasteToggle(
                            taste
                          )
                        }
                      >
                        {selectedTaste.includes(
                          taste
                        )
                          ? "✓ "
                          : ""}

                        {taste}
                      </button>
                    )
                  )}
                </div>

                <div className="taste-setting-actions">
                  <button
                    type="button"
                    className="taste-cancel-button"
                    onClick={() =>
                      setShowTasteSetting(
                        false
                      )
                    }
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    className="taste-save-button"
                    onClick={
                      handleSaveTaste
                    }
                    disabled={saveLoading}
                  >
                    {saveLoading
                      ? "저장하는 중..."
                      : "취향 저장하기"}
                  </button>
                </div>
              </>
            ) : user.tastePreference &&
              user.tastePreference.length >
                0 ? (
              <>
                <div className="mypage-taste-icon">
                  🍴
                </div>

                <div className="mypage-tags">
                  {user.tastePreference.map(
                    (taste) => (
                      <span key={taste}>
                        #{taste}
                      </span>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="mypage-taste-button"
                  onClick={() => {
                    setSelectedTaste(
                      user.tastePreference
                    );

                    setShowTasteSetting(
                      true
                    );

                    setSaveMessage("");
                  }}
                >
                  취향 수정하기
                </button>
              </>
            ) : (
              <>
                <div className="mypage-taste-icon">
                  🍴
                </div>

                <h3>
                  아직 취향을 설정하지 않았어요.
                </h3>

                <p>
                  좋아하는 음식과 상황을 설정하면
                  <br />
                  나에게 맞는 맛집을 추천받을 수
                  있어요.
                </p>

                <button
                  type="button"
                  className="mypage-taste-button"
                  onClick={() => {
                    setShowTasteSetting(
                      true
                    );

                    setSaveMessage("");
                  }}
                >
                  취향 설정하기
                </button>
              </>
            )}

            {saveMessage && (
              <p className="taste-save-message">
                {saveMessage}
              </p>
            )}
          </div>
        </section>

        {/* =====================
            내가 찜한 맛집
        ====================== */}

        <section className="mypage-section">
          <div className="mypage-section-title">
            <p>MY BOOKMARKS</p>

            <h2>내가 찜한 맛집</h2>
          </div>

          {bookmarkLoading ? (
            <div className="mypage-empty-bookmarks">
              <div>🔖</div>

              <h3>
                찜한 맛집을 불러오는 중...
              </h3>

              <p>
                잠시만 기다려주세요.
              </p>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="mypage-empty-bookmarks">
              <div>🤍</div>

              <h3>
                아직 찜한 맛집이 없어요.
              </h3>

              <p>
                마음에 드는 맛집을 발견하면
                <br />
                하트 버튼을 눌러 저장해보세요.
              </p>

              <Link
                href="/restaurants"
                className="mypage-review-button"
              >
                맛집 찾아보기 →
              </Link>
            </div>
          ) : (
            <div className="mypage-bookmark-grid">
              {bookmarks.map(
                (bookmark) => {
                  const restaurant =
                    bookmark.restaurantId;

                  if (!restaurant) {
                    return null;
                  }

                  return (
                    <Link
                      key={
                        bookmark._id
                      }
                      href={`/restaurants/${restaurant._id}`}
                      className="mypage-bookmark-card"
                    >
                      <div className="mypage-bookmark-image">
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

                        <div className="mypage-bookmark-heart">
                          ❤️
                        </div>
                      </div>

                      <div className="mypage-bookmark-content">
                        <span className="mypage-bookmark-category">
                          {
                            restaurant.category
                          }
                        </span>

                        <h3>
                          {
                            restaurant.name
                          }
                        </h3>

                        <p>
                          {
                            restaurant.address
                          }
                        </p>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* =====================
            내가 작성한 리뷰
        ====================== */}

        <section className="mypage-section">
          <div className="mypage-section-title">
            <p>MY REVIEWS</p>

            <h2>내가 작성한 리뷰</h2>
          </div>

          {reviewLoading ? (
            <div className="mypage-empty-reviews">
              <div>🍽️</div>

              <h3>
                리뷰를 불러오는 중...
              </h3>

              <p>
                잠시만 기다려주세요.
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="mypage-empty-reviews">
              <div>💬</div>

              <h3>
                아직 작성한 리뷰가 없어요.
              </h3>

              <p>
                맛집을 방문하고
                <br />
                첫 번째 리뷰를 남겨보세요.
              </p>

              <Link
                href="/restaurants"
                className="mypage-review-button"
              >
                맛집 찾아보기 →
              </Link>
            </div>
          ) : (
            <div className="mypage-review-list">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="mypage-review-card"
                >
                  <Link
                    href={
                      review.restaurantId
                        ? `/restaurants/${review.restaurantId._id}`
                        : "/restaurants"
                    }
                    className="mypage-review-main"
                  >
                    <div className="mypage-review-image">
                      {review.restaurantId
                        ?.imageUrl ? (
                        <img
                          src={
                            review.restaurantId
                              .imageUrl
                          }
                          alt={
                            review.restaurantId
                              .name ||
                            "맛집 이미지"
                          }
                        />
                      ) : (
                        <span>
                          🍽️
                        </span>
                      )}
                    </div>

                    <div className="mypage-review-content">
                      <div className="mypage-review-top">
                        <div>
                          <span className="mypage-review-category">
                            {
                              review
                                .restaurantId
                                ?.category
                            }
                          </span>

                          <h3>
                            {
                              review
                                .restaurantId
                                ?.name
                            }
                          </h3>
                        </div>

                        <span className="mypage-review-date">
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </div>

                      <div className="mypage-review-rating">
                        <span>
                          {"★".repeat(
                            Math.max(
                              0,
                              Math.min(
                                5,
                                review.rating
                              )
                            )
                          )}
                        </span>

                        <strong>
                          {review.rating}.0
                        </strong>
                      </div>

                      <p className="mypage-review-text">
                        {review.content}
                      </p>

                      {review.receiptAuth && (
                        <span className="mypage-receipt-badge">
                          ✓ 영수증 인증
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* 리뷰 관리 버튼 */}
                  <div className="mypage-review-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditOpen(
                          review
                        )
                      }
                    >
                      ✏️ 수정
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteReview(
                          review
                        )
                      }
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* =====================
          리뷰 수정 모달
      ====================== */}

      {editingReview && (
        <div
          className="review-edit-overlay"
          onClick={() =>
            setEditingReview(null)
          }
        >
          <div
            className="review-edit-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="review-edit-header">
              <div>
                <p>
                  EDIT REVIEW
                </p>

                <h2>
                  {
                    editingReview
                      .restaurantId
                      ?.name
                  }
                </h2>
              </div>

              <button
                type="button"
                className="review-edit-close"
                onClick={() =>
                  setEditingReview(null)
                }
              >
                ×
              </button>
            </div>

            <div className="review-edit-field">
              <label>
                별점
              </label>

              <div className="review-edit-stars">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      key={star}
                      type="button"
                      className={
                        star <=
                        editRating
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setEditRating(
                          star
                        )
                      }
                    >
                      ★
                    </button>
                  )
                )}

                <span>
                  {editRating}.0
                </span>
              </div>
            </div>

            <div className="review-edit-field">
              <label>
                리뷰 내용
              </label>

              <textarea
                value={editContent}
                onChange={(event) =>
                  setEditContent(
                    event.target.value
                  )
                }
                maxLength={500}
              />

              <small>
                {editContent.length}/500
              </small>
            </div>

            <label className="review-edit-receipt">
              <input
                type="checkbox"
                checked={
                  editReceiptAuth
                }
                onChange={(event) =>
                  setEditReceiptAuth(
                    event.target
                      .checked
                  )
                }
              />

              <span>
                ✓ 영수증 인증 리뷰
              </span>
            </label>

            <button
              type="button"
              className="review-edit-save"
              onClick={
                handleEditReview
              }
              disabled={
                editLoading
              }
            >
              {editLoading
                ? "수정하는 중..."
                : "수정 완료"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}