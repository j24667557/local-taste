export function isValidObjectId(id: string) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
  
  export function isValidRating(rating: number) {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
  }
  
  export function isValidReviewContent(content: string) {
    return content.trim().length >= 10;
  }