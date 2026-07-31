# ---------- 1단계: 빌드 ----------
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# gradle wrapper 및 설정 파일 먼저 복사 (의존성 캐시 활용)
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN chmod +x ./gradlew

# 소스 코드 복사
COPY src src

# 테스트는 제외하고 빌드
RUN ./gradlew bootJar -x test --no-daemon

# ---------- 2단계: 실행 ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

ENV TZ=Asia/Seoul

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
