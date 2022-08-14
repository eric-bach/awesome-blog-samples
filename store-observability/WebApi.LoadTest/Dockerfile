#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0-buster-slim AS base
WORKDIR /app
EXPOSE 44001

FROM mcr.microsoft.com/dotnet/sdk:5.0-buster-slim AS build
WORKDIR /src
COPY ["WebApi.LoadTest/WebApi.LoadTest.csproj", "WebApi.LoadTest/"]
RUN dotnet restore "WebApi.LoadTest/WebApi.LoadTest.csproj"
COPY . .
WORKDIR "/src/WebApi.LoadTest"
RUN dotnet build "WebApi.LoadTest.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WebApi.LoadTest.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WebApi.LoadTest.dll"]