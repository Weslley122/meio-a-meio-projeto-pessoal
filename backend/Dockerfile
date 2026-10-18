# Build em dois estágios: compila o jar e roda só com o JRE (imagem final menor).

# --- Estágio 1: compila ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Baixa as dependências primeiro (camada em cache enquanto o pom não muda).
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# --- Estágio 2: roda ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# O Render (e a maioria das plataformas) injeta a porta em $PORT; a aplicação lê isso.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
