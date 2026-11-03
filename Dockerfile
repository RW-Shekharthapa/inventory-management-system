FROM node:24-alpine AS web
WORKDIR /app
COPY frontend/package*.json .
RUN npm ci --no-audit --no-fund
COPY frontend .
RUN npx ng build

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn -q dependency:go-offline
COPY backend/src src
# Spring Boot serves anything in static/ at /
COPY --from=web /app/dist/frontend/browser src/main/resources/static
RUN mvn -q package -DskipTests

FROM eclipse-temurin:21-jre
RUN useradd -r -u 10001 app
USER 10001
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
