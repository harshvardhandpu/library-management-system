package com.placement.librarymanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BorrowBookRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Book id is required")
    private Long bookId;
}
