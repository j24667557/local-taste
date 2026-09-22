import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "../models/Restaurant";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI가 설정되지 않았습니다.");
}

const restaurants = [
  {
    name: "동네김치찌개",
    address: "경기도 안산시 상록구",
    category: "한식",
    tags: ["혼밥", "부모님 식사"],
    imageUrl: "",
    location: {
      lat: 37.3015,
      lng: 126.8468,
    },
    averageRating: 4.7,
  },
  {
    name: "오늘초밥",
    address: "경기도 안산시 단원구",
    category: "일식",
    tags: ["소개팅", "혼밥"],
    imageUrl: "",
    location: {
      lat: 37.3219,
      lng: 126.8309,
    },
    averageRating: 4.8,
  },
  {
    name: "만리장성",
    address: "경기도 안산시 상록구",
    category: "중식",
    tags: ["회식", "부모님 식사"],
    imageUrl: "",
    location: {
      lat: 37.3028,
      lng: 126.8667,
    },
    averageRating: 4.5,
  },
  {
    name: "라비올라",
    address: "경기도 안산시 단원구",
    category: "양식",
    tags: ["소개팅", "데이트"],
    imageUrl: "",
    location: {
      lat: 37.3172,
      lng: 126.8335,
    },
    averageRating: 4.6,
  },
  {
    name: "카페 온도",
    address: "경기도 안산시 단원구",
    category: "카페",
    tags: ["소개팅", "혼밥"],
    imageUrl: "",
    location: {
      lat: 37.3201,
      lng: 126.8274,
    },
    averageRating: 4.4,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI!);

    console.log("MongoDB 연결 성공");

    await Restaurant.deleteMany({});

    await Restaurant.insertMany(restaurants);

    console.log("맛집 데이터 등록 완료");
    console.log(`총 ${restaurants.length}개의 맛집을 등록했습니다.`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("데이터 등록 실패:", error);
    process.exit(1);
  }
}

seed();