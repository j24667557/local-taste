export interface TastePreference {
    food: string[];
    atmosphere: string[];
    avoidIngredients: string[];
  }
  
  export interface User {
    _id: string;
    email: string;
    nickname: string;
    tastePreference: TastePreference;
    createdAt: string;
    updatedAt: string;
  }