package com.harshdpu.taskmanagement.service;

import com.harshdpu.taskmanagement.dto.UserRequest;
import com.harshdpu.taskmanagement.dto.UserResponse;
import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    UserResponse getUser(Long id);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);
}
