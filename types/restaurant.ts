export interface Location {
    lat: number;
    lng: number;
  }
  
  export interface Restaurant {
    _id: string;
    name: string;
    address: string;
    category: string;
    tags: string[];
    imageUrl: string;
    location: Location;
    averageRating: number;
    createdAt: string;
    updatedAt: string;
  }