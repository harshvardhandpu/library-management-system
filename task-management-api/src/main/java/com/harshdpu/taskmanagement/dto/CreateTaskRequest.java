package com.harshdpu.taskmanagement.dto;

import com.harshdpu.taskmanagement.entity.TaskPriority;
import com.harshdpu.taskmanagement.entity.TaskStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title cannot exceed 150 characters")
        String title,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        @NotNull(message = "Status is required")
        TaskStatus status,

        @NotNull(message = "Priority is required")
        TaskPriority priority,

        @NotNull(message = "Due date is required")
        @FutureOrPresent(message = "Due date cannot be in the past")
        LocalDate dueDate,

        @NotNull(message = "User id is required")
        Long userId
) {
}
