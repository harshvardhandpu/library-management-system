package com.harshdpu.taskmanagement.service;

import com.harshdpu.taskmanagement.dto.CreateTaskRequest;
import com.harshdpu.taskmanagement.dto.TaskRequest;
import com.harshdpu.taskmanagement.dto.TaskResponse;
import com.harshdpu.taskmanagement.entity.TaskPriority;
import com.harshdpu.taskmanagement.entity.TaskStatus;
import java.util.List;
import org.springframework.data.domain.Page;

public interface TaskService {

    TaskResponse createTask(CreateTaskRequest request);

    TaskResponse getTask(Long id);

    Page<TaskResponse> getAllTasks(int page, int size, String sortDir);

    TaskResponse updateTask(Long id, TaskRequest request);

    void deleteTask(Long id);

    List<TaskResponse> getTasksByUser(Long userId);

    Page<TaskResponse> getTasksByStatus(TaskStatus status, int page, int size, String sortDir);

    Page<TaskResponse> getTasksByPriority(TaskPriority priority, int page, int size, String sortDir);

    Page<TaskResponse> searchTasksByTitle(String title, int page, int size, String sortDir);
}
