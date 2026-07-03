package com.harshdpu.taskmanagement.service;

import com.harshdpu.taskmanagement.dto.CreateTaskRequest;
import com.harshdpu.taskmanagement.dto.TaskRequest;
import com.harshdpu.taskmanagement.dto.TaskResponse;
import com.harshdpu.taskmanagement.entity.Task;
import com.harshdpu.taskmanagement.entity.TaskPriority;
import com.harshdpu.taskmanagement.entity.TaskStatus;
import com.harshdpu.taskmanagement.entity.User;
import com.harshdpu.taskmanagement.exception.BadRequestException;
import com.harshdpu.taskmanagement.exception.TaskNotFoundException;
import com.harshdpu.taskmanagement.exception.UserNotFoundException;
import com.harshdpu.taskmanagement.repository.TaskRepository;
import com.harshdpu.taskmanagement.repository.UserRepository;
import com.harshdpu.taskmanagement.util.AppConstants;
import java.util.List;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Override
    public TaskResponse createTask(CreateTaskRequest request) {
        User user = findUserById(request.userId());

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setUser(user);

        return toResponse(taskRepository.save(task));
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTask(Long id) {
        return toResponse(findTaskById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getAllTasks(int page, int size, String sortDir) {
        return taskRepository.findAll(createPageable(page, size, sortDir))
                .map(this::toResponse);
    }

    @Override
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findTaskById(id);

        if (task.getStatus() == TaskStatus.COMPLETED) {
            updateCompletedTaskDescriptionOnly(task, request);
            return toResponse(taskRepository.save(task));
        }

        User user = findUserById(request.userId());
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setUser(user);

        return toResponse(taskRepository.save(task));
    }

    @Override
    public void deleteTask(Long id) {
        Task task = findTaskById(id);
        taskRepository.delete(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }

        return taskRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByStatus(TaskStatus status, int page, int size, String sortDir) {
        return taskRepository.findByStatus(status, createPageable(page, size, sortDir))
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByPriority(TaskPriority priority, int page, int size, String sortDir) {
        return taskRepository.findByPriority(priority, createPageable(page, size, sortDir))
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> searchTasksByTitle(String title, int page, int size, String sortDir) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Search title cannot be empty");
        }

        return taskRepository.findByTitleContainingIgnoreCase(title.trim(), createPageable(page, size, sortDir))
                .map(this::toResponse);
    }

    private void updateCompletedTaskDescriptionOnly(Task task, TaskRequest request) {
        boolean hasRestrictedChanges = !Objects.equals(task.getTitle(), request.title())
                || task.getStatus() != request.status()
                || task.getPriority() != request.priority()
                || !Objects.equals(task.getDueDate(), request.dueDate())
                || !Objects.equals(task.getUser().getId(), request.userId());

        if (hasRestrictedChanges) {
            throw new BadRequestException("Completed tasks can only update the description");
        }

        task.setDescription(request.description());
    }

    private Pageable createPageable(int page, int size, String sortDir) {
        if (page < 0) {
            throw new BadRequestException("Page number cannot be negative");
        }

        if (size <= 0 || size > AppConstants.MAX_PAGE_SIZE) {
            throw new BadRequestException("Page size must be between 1 and " + AppConstants.MAX_PAGE_SIZE);
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return PageRequest.of(page, size, Sort.by(direction, "dueDate"));
    }

    private Task findTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getUser().getId(),
                task.getUser().getName()
        );
    }
}
