package com.placement.librarymanagement.service;

import com.placement.librarymanagement.dto.BorrowBookRequest;
import com.placement.librarymanagement.dto.BorrowRecordResponse;
import com.placement.librarymanagement.entity.Book;
import com.placement.librarymanagement.entity.BorrowRecord;
import com.placement.librarymanagement.entity.User;
import com.placement.librarymanagement.exception.BorrowException;
import com.placement.librarymanagement.repository.BorrowRecordRepository;
import com.placement.librarymanagement.util.BorrowStatus;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookService bookService;
    private final UserService userService;

    @Transactional
    public BorrowRecordResponse borrowBook(BorrowBookRequest request) {
        User user = userService.findUserById(request.getUserId());
        Book book = bookService.findBookById(request.getBookId());

        if (book.getAvailableQuantity() == 0) {
            throw new BorrowException("Book is currently not available for borrowing");
        }

        book.setAvailableQuantity(book.getAvailableQuantity() - 1);

        BorrowRecord borrowRecord = BorrowRecord.builder()
                .user(user)
                .book(book)
                .borrowDate(LocalDate.now())
                .status(BorrowStatus.BORROWED)
                .build();

        return mapToResponse(borrowRecordRepository.save(borrowRecord));
    }

    @Transactional
    public BorrowRecordResponse returnBook(Long borrowRecordId) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new BorrowException("Borrow record not found with id: " + borrowRecordId));

        if (borrowRecord.getStatus() == BorrowStatus.RETURNED) {
            throw new BorrowException("This book has already been returned");
        }

        Book book = borrowRecord.getBook();
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);

        borrowRecord.setReturnDate(LocalDate.now());
        borrowRecord.setStatus(BorrowStatus.RETURNED);

        return mapToResponse(borrowRecordRepository.save(borrowRecord));
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getBorrowHistory() {
        return borrowRecordRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getBorrowHistoryByUser(Long userId) {
        userService.findUserById(userId);

        return borrowRecordRepository.findByUserIdOrderByBorrowDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private BorrowRecordResponse mapToResponse(BorrowRecord borrowRecord) {
        return BorrowRecordResponse.builder()
                .id(borrowRecord.getId())
                .borrowDate(borrowRecord.getBorrowDate())
                .returnDate(borrowRecord.getReturnDate())
                .status(borrowRecord.getStatus())
                .userId(borrowRecord.getUser().getId())
                .userName(borrowRecord.getUser().getName())
                .bookId(borrowRecord.getBook().getId())
                .bookTitle(borrowRecord.getBook().getTitle())
                .build();
    }
}
