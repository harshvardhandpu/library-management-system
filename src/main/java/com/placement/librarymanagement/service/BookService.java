package com.placement.librarymanagement.service;

import com.placement.librarymanagement.dto.BookRequest;
import com.placement.librarymanagement.dto.BookResponse;
import com.placement.librarymanagement.entity.Book;
import com.placement.librarymanagement.exception.BookNotFoundException;
import com.placement.librarymanagement.repository.BookRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    @Transactional
    public BookResponse addBook(BookRequest request) {
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .quantity(request.getQuantity())
                .availableQuantity(request.getQuantity())
                .build();

        return mapToResponse(bookRepository.save(book));
    }

    @Transactional(readOnly = true)
    public BookResponse getBook(Long bookId) {
        return mapToResponse(findBookById(bookId));
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks() {
        return bookRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public BookResponse updateBook(Long bookId, BookRequest request) {
        Book book = findBookById(bookId);
        int borrowedCopies = book.getQuantity() - book.getAvailableQuantity();

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setQuantity(request.getQuantity());
        book.setAvailableQuantity(Math.max(request.getQuantity() - borrowedCopies, 0));

        return mapToResponse(bookRepository.save(book));
    }

    @Transactional
    public void deleteBook(Long bookId) {
        Book book = findBookById(bookId);
        bookRepository.delete(book);
    }

    @Transactional(readOnly = true)
    public Book findBookById(Long bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException(bookId));
    }

    private BookResponse mapToResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .quantity(book.getQuantity())
                .availableQuantity(book.getAvailableQuantity())
                .build();
    }
}
