package com.harshdpu.taskmanagement.controller;

import com.harshdpu.taskmanagement.dto.CreateTaskRequest;
import com.harshdpu.taskmanagement.dto.TaskRequest;
import com.harshdpu.taskmanagement.dto.TaskResponse;
import com.harshdpu.taskmanagement.entity.TaskPriority;
import com.harshdpu.taskmanagement.entity.TaskStatus;
import com.harshdpu.taskmanagement.service.TaskService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return ResponseEntity
                .created(URI.create("/api/tasks/" + response.id()))
                .body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @GetMapping
    public ResponseEntity<Page<TaskResponse>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(taskService.getAllTasks(page, size, sortDir));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskResponse>> getTasksByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getTasksByUser(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<TaskResponse>> getTasksByStatus(
            @PathVariable TaskStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status, page, size, sortDir));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<Page<TaskResponse>> getTasksByPriority(
            @PathVariable TaskPriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(taskService.getTasksByPriority(priority, page, size, sortDir));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<TaskResponse>> searchTasksByTitle(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(taskService.searchTasksByTitle(title, page, size, sortDir));
    }
}
