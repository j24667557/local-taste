export interface Review {
    _id: string;
    userId: string;
    restaurantId: string;
    rating: number;
    content: string;
    receiptAuth: boolean;
    receiptImageUrl: string;
    createdAt: string;
    updatedAt: string;
  }