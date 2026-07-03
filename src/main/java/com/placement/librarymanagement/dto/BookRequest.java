package com.placement.librarymanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookRequest {

    @NotBlank(message = "Book title is required")
    private String title;

    @NotBlank(message = "Book author is required")
    private String author;

    @NotBlank(message = "ISBN is required")
    private String isbn;

    @NotNull(message = "Book quantity is required")
    @Positive(message = "Book quantity must be greater than zero")
    private Integer quantity;
}
