package com.harshdpu.taskmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.harshdpu.taskmanagement.repository")
public class JpaConfig {
}
