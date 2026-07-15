export interface BookRequest {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
}

export interface BookResponse {
  id: number;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  availableQuantity: number;
}

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
}
