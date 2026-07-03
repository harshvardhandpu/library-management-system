package com.placement.librarymanagement.repository;

import com.placement.librarymanagement.entity.BorrowRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUserIdOrderByBorrowDateDesc(Long userId);
}
