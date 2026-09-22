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

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await fetch("/api/restaurants");

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setRestaurants(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error("맛집 조회 실패:", error);

        setError(
          "맛집 데이터를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  if (loading) {
    return (
      <main>
        <div className="section-title">
          <div>
            <h1>추천 맛집</h1>
          </div>
        </div>

        <p>추천 맛집을 불러오는 중...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="section-title">
          <div>
            <h1>추천 맛집</h1>
          </div>
        </div>

        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <div className="section-title">
        <div>
          <h1>추천 맛집</h1>
        </div>
      </div>

      {restaurants.length === 0 ? (
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
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant._id}
              href={`/restaurants/${restaurant._id}`}
              className="restaurant-card"
            >
              <div className="restaurant-image">
                {restaurant.imageUrl ? (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                  />
                ) : (
                  <span>🍽️</span>
                )}

                <div className="image-rating">
                  ⭐{" "}
                  {restaurant.averageRating.toFixed(1)}
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
                  📍 {restaurant.address}
                </p>

                <div className="restaurant-tags">
                  {restaurant.tags.map((tag) => (
                    <span key={tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}