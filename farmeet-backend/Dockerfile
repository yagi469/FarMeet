# Build stage
# JDK単体ではなく、Mavenが含まれている公式イメージを使います
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# mvnw関連のコピーは削除し、pom.xmlだけ先にコピーします
COPY pom.xml ./

# Maven公式イメージなので './mvnw' ではなく 'mvn' コマンドが使えます
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Run stage (ここは変更なしでOK)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]