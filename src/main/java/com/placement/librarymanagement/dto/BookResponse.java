package com.placement.librarymanagement.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookResponse {

    private Long id;
    private String title;
    private String author;
    private String isbn;
    private Integer quantity;
    private Integer availableQuantity;
}
