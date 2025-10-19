# Installation Guide

This guide will walk you through the process of setting up the YaniQ E-Commerce Platform on your local development machine.

## Clone the Repository

First, clone the YaniQ monorepo from GitHub:

```bash
git clone https://github.com/yaniq/yaniq-monorepo.git
cd yaniq-monorepo
```

## Project Structure

After cloning, you'll see the following structure:

```
yaniq-monorepo/
├── apps/                    # All microservices
│   ├── auth-service/
│   ├── user-service/
│   ├── product-service/
│   └── ... (22 services total)
├── libs/                    # Common libraries
│   ├── common-api/
│   ├── common-security/
│   └── ... (14 libraries)
├── config/                  # Configuration files
├── infrastructure/          # Infrastructure as code
├── k8s/                     # Kubernetes manifests
├── helm/                    # Helm charts
├── docker-compose.yml       # Docker compose for local dev
└── pom.xml                  # Root Maven POM
```

## Environment Configuration

### 1. Copy Environment File

```bash
cp example.env .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your local settings:

```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=yaniq
POSTGRES_USER=yaniq_user
POSTGRES_PASSWORD=your_secure_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRATION=86400000

# Service Ports
EUREKA_PORT=8761
GATEWAY_PORT=8080
AUTH_SERVICE_PORT=8081
USER_SERVICE_PORT=8082
# ... configure other service ports
```

## Build the Project

### 1. Build All Services and Libraries

From the root directory, build the entire project:

```bash
mvn clean install
```

This will:
- Compile all services
- Build all common libraries
- Run tests
- Create JAR files

**Note**: First build may take 10-15 minutes as Maven downloads all dependencies.

### 2. Skip Tests (Optional)

If you want to build faster and skip tests:

```bash
mvn clean install -DskipTests
```

## Start Infrastructure Services

### Using Docker Compose

Start the required infrastructure (PostgreSQL, Redis, RabbitMQ, etc.):

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- RabbitMQ (port 5672, Management UI: 15672)
- Kafka (optional, port 9092)

### Verify Infrastructure

Check that all containers are running:

```bash
docker-compose -f docker-compose.dev.yml ps
```

### Access Management Interfaces

- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **Redis**: Use redis-cli or RedisInsight on port 6379

## Database Setup

### 1. Create Databases

Connect to PostgreSQL and create databases for each service:

```bash
docker exec -it yaniq-postgres psql -U yaniq_user -d postgres
```

```sql
CREATE DATABASE auth_service;
CREATE DATABASE user_service;
CREATE DATABASE product_service;
CREATE DATABASE order_service;
CREATE DATABASE payment_service;
CREATE DATABASE inventory_service;
CREATE DATABASE cart_service;
CREATE DATABASE review_service;
CREATE DATABASE notification_service;
-- Create databases for other services
```

### 2. Run Migrations

Services will automatically run migrations on first startup using Flyway/Liquibase.

## Start Services

### Option 1: Using Maven (Development)

Start services individually in separate terminal windows:

#### 1. Start Discovery Service (Eureka)
```bash
cd apps/discovery-service
mvn spring-boot:run
```

#### 2. Start Gateway Service
```bash
cd apps/gateway-service
mvn spring-boot:run
```

#### 3. Start Auth Service
```bash
cd apps/auth-service
mvn spring-boot:run
```

#### 4. Start Other Services
```bash
# In separate terminals for each service
cd apps/user-service && mvn spring-boot:run
cd apps/product-service && mvn spring-boot:run
cd apps/order-service && mvn spring-boot:run
# ... and so on
```

### Option 2: Using Docker Compose (Full Stack)

Start all services with Docker Compose:

```bash
docker-compose up -d
```

### Option 3: Using Kubernetes (Advanced)

Deploy to local Kubernetes cluster:

```bash
# Using kubectl
kubectl apply -f k8s/

# Or using Helm
helm install yaniq ./helm/yaniq
```

## Verify Installation

### 1. Check Service Discovery

Open Eureka Dashboard:
```
http://localhost:8761
```

You should see all registered services.

### 2. Check API Gateway

Test the gateway health endpoint:
```bash
curl http://localhost:8080/actuator/health
```

### 3. Test Authentication

Get a JWT token:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

## Common Installation Issues

### Port Already in Use

If you see "Port already in use" errors:
```bash
# Find and kill the process using the port
lsof -ti:8080 | xargs kill -9
```

### Maven Build Failures

Clear Maven cache and rebuild:
```bash
rm -rf ~/.m2/repository/com/yaniq
mvn clean install -U
```

### Docker Issues

Reset Docker environment:
```bash
docker-compose down -v
docker-compose up -d
```

### Database Connection Issues

Ensure PostgreSQL is running and accessible:
```bash
docker logs yaniq-postgres
psql -h localhost -U yaniq_user -d yaniq
```

## Next Steps

Now that you have YaniQ installed:
- [Quick Start Tutorial](/docs/getting-started/quick-start) - Create your first API request
- [Project Structure](/docs/getting-started/project-structure) - Understand the codebase
- [Development Setup](/docs/development/setup) - Configure your IDE

## Getting Help

If you encounter issues:
1. Check the [Troubleshooting Guide](/docs/development/debugging)
2. Review service logs: `docker logs <container-name>`
3. Open an issue on [GitHub](https://github.com/yaniq/yaniq-monorepo/issues)

