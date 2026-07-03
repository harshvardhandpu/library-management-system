package com.harshdpu.taskmanagement.service;

import com.harshdpu.taskmanagement.dto.UserRequest;
import com.harshdpu.taskmanagement.dto.UserResponse;
import com.harshdpu.taskmanagement.entity.User;
import com.harshdpu.taskmanagement.exception.BadRequestException;
import com.harshdpu.taskmanagement.exception.UserNotFoundException;
import com.harshdpu.taskmanagement.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUser(Long id) {
        return toResponse(findUserById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = findUserById(id);
        userRepository.findByEmail(request.email())
                .filter(existingUser -> !existingUser.getId().equals(id))
                .ifPresent(existingUser -> {
                    throw new BadRequestException("Email is already registered");
                });

        user.setName(request.name());
        user.setEmail(request.email());

        return toResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
