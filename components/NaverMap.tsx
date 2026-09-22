"use client";

import { useEffect, useRef, useState } from "react";

interface NaverMapProps {
  lat: number;
  lng: number;
  name?: string;
}

export default function NaverMap({
  lat,
  lng,
  name = "맛집 위치",
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

    if (!clientId) {
      setError(
        "네이버 지도 API 키가 설정되지 않았습니다."
      );
      return;
    }

    const loadMap = () => {
      if (!mapRef.current) return;

      const naver = (window as any).naver;

      if (!naver || !naver.maps) {
        setError(
          "네이버 지도 API를 불러오지 못했습니다."
        );
        return;
      }

      const position =
        new naver.maps.LatLng(lat, lng);

      const map = new naver.maps.Map(
        mapRef.current,
        {
          center: position,
          zoom: 16,
          zoomControl: true,
        }
      );

      const marker =
        new naver.maps.Marker({
          position,
          map,
          title: name,
        });

      const infoWindow =
        new naver.maps.InfoWindow({
          content: `
            <div style="
              padding: 10px 14px;
              font-size: 14px;
              font-weight: 700;
              color: #29231f;
              background: white;
              border-radius: 8px;
            ">
              ${name}
            </div>
          `,
        });

      naver.maps.Event.addListener(
        marker,
        "click",
        () => {
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(map, marker);
          }
        }
      );
    };

    if ((window as any).naver?.maps) {
      loadMap();
      return;
    }

    const existingScript =
      document.querySelector(
        'script[data-naver-map="true"]'
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        loadMap
      );

      return () => {
        existingScript.removeEventListener(
          "load",
          loadMap
        );
      };
    }

    const script =
      document.createElement("script");

    script.src =
      `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;

    script.async = true;
    script.dataset.naverMap = "true";

    script.onload = loadMap;

    script.onerror = () => {
      setError(
        "네이버 지도 API를 불러오지 못했습니다."
      );
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [lat, lng, name]);

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff5ef",
          borderRadius: "18px",
          color: "#d95b3f",
          fontSize: "14px",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "360px",
        borderRadius: "18px",
        overflow: "hidden",
      }}
    />
  );
}