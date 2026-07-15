# ============================================================
# Stage 1: Build with Maven + JDK
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build application
COPY src ./src
RUN mvn package -DskipTests -q

# ============================================================
# Stage 2: Runtime with JRE
# ============================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build --chown=appuser:appgroup /app/target/*.jar app.jar

EXPOSE 8080

USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"]
