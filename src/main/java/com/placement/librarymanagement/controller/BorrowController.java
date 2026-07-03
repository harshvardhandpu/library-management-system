package com.placement.librarymanagement.controller;

import com.placement.librarymanagement.dto.BorrowBookRequest;
import com.placement.librarymanagement.dto.BorrowRecordResponse;
import com.placement.librarymanagement.service.BorrowService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/borrow-records")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @PostMapping("/borrow")
    public ResponseEntity<BorrowRecordResponse> borrowBook(@Valid @RequestBody BorrowBookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(borrowService.borrowBook(request));
    }

    @PutMapping("/{borrowRecordId}/return")
    public ResponseEntity<BorrowRecordResponse> returnBook(@PathVariable Long borrowRecordId) {
        return ResponseEntity.ok(borrowService.returnBook(borrowRecordId));
    }

    @GetMapping
    public ResponseEntity<List<BorrowRecordResponse>> getBorrowHistory() {
        return ResponseEntity.ok(borrowService.getBorrowHistory());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<BorrowRecordResponse>> getBorrowHistoryByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowService.getBorrowHistoryByUser(userId));
    }
}
