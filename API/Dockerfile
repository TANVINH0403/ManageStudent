# 1. Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the csproj file and restore dependencies
COPY ["API.csproj", "./"]
RUN dotnet restore "API.csproj"

# Copy the remaining source code
COPY . .
WORKDIR "/app"

# Build and publish the application
RUN dotnet build "API.csproj" -c Release -o /app/build
RUN dotnet publish "API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. Run stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Setup timezone if needed (Asia/Ho_Chi_Minh)
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy the published output from the build stage
COPY --from=build /app/publish .

# Expose ports (5050 will be mapped via docker-compose)
EXPOSE 8080

# Environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development

# Ensure wwwroot and avatars directories exist
RUN mkdir -p /app/wwwroot/avatars
RUN mkdir -p /app/uploads

ENTRYPOINT ["dotnet", "API.dll"]
