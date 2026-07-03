package com.harshdpu.taskmanagement.repository;

import com.harshdpu.taskmanagement.entity.Task;
import com.harshdpu.taskmanagement.entity.TaskPriority;
import com.harshdpu.taskmanagement.entity.TaskStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByStatus(TaskStatus status, Pageable pageable);

    Page<Task> findByPriority(TaskPriority priority, Pageable pageable);

    Page<Task> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    List<Task> findByUserId(Long userId);
}
