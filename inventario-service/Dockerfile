FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-jammy
RUN apt-get update && apt-get install -y bash mysql-client && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/target/inventario-service-0.0.1-SNAPSHOT.jar app.jar
COPY wait-for-mysql.sh /wait-for-mysql.sh
RUN chmod +x /wait-for-mysql.sh
EXPOSE 8082
CMD ["/wait-for-mysql.sh", "mysql", "java", "-jar", "app.jar"]
