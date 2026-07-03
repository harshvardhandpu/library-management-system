package com.harshdpu.taskmanagement.dto;

import com.harshdpu.taskmanagement.entity.TaskPriority;
import com.harshdpu.taskmanagement.entity.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long userId,
        String userName
) {
}
