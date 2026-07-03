package com.placement.librarymanagement.dto;

import com.placement.librarymanagement.util.BorrowStatus;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BorrowRecordResponse {

    private Long id;
    private LocalDate borrowDate;
    private LocalDate returnDate;
    private BorrowStatus status;
    private Long userId;
    private String userName;
    private Long bookId;
    private String bookTitle;
}
