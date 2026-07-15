export type BorrowStatus = 'BORROWED' | 'RETURNED';

export interface BorrowBookRequest {
  userId: number;
  bookId: number;
}

export interface BorrowRecordResponse {
  id: number;
  borrowDate: string;
  returnDate: string | null;
  status: BorrowStatus;
  userId: number;
  userName: string;
  bookId: number;
  bookTitle: string;
}
