```

### Restart a Service
```bash
# Docker
docker restart gateway-service

# Kubernetes
kubectl rollout restart deployment gateway-service
```

### Clear Cache
```bash
# Redis
docker exec -it yaniq-redis redis-cli FLUSHALL
```

## Troubleshooting

### "Service Unavailable" Error
- Check if the target service is registered in Eureka
- Verify service is healthy: `curl http://localhost:<service-port>/actuator/health`

### "Unauthorized" Error
- Ensure your token is valid and not expired
- Check token is properly included in Authorization header

### "Timeout" Error
- Service might be starting up - wait 30 seconds and retry
- Check service logs for errors

## Getting Help

- 📖 [Full Documentation](/docs/intro)
- 🐛 [GitHub Issues](https://github.com/yaniq/yaniq-monorepo/issues)
- 💬 Community Discord (coming soon)

Happy coding! 🚀
# Quick Start

Get up and running with YaniQ in under 10 minutes! This guide will help you make your first API request and understand the basic workflow.

## Prerequisites

Before starting, ensure you have:
- ✅ Completed the [Installation Guide](/docs/getting-started/installation)
- ✅ All infrastructure services running
- ✅ At least Discovery Service and Gateway Service started

## Step 1: Verify Services are Running

Check that Eureka shows registered services:

```bash
curl http://localhost:8761/eureka/apps | grep -o '<app>[^<]*</app>'
```

You should see services like `GATEWAY-SERVICE`, `AUTH-SERVICE`, `USER-SERVICE`, etc.

## Step 2: Understanding the API Gateway

All client requests go through the API Gateway at `http://localhost:8080`. The gateway:
- Routes requests to appropriate microservices
- Handles authentication and authorization
- Provides rate limiting and circuit breaking

## Step 3: Create a User Account

### Register a New User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john.doe",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-10-19T10:30:00Z"
}
```

## Step 4: Authenticate and Get JWT Token

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

**Save the token** - you'll need it for authenticated requests:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Step 5: Browse Products

### Get All Products

```bash
curl http://localhost:8080/api/products \
  -H "Authorization: Bearer $TOKEN"
```

### Search Products

```bash
curl "http://localhost:8080/api/products/search?q=laptop&category=electronics" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Product Details

```bash
curl http://localhost:8080/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Step 6: Add Products to Cart

### Add Item to Cart

```bash
curl -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

### View Cart

```bash
curl http://localhost:8080/api/cart \
  -H "Authorization: Bearer $TOKEN"
```

## Step 7: Create an Order

### Place Order

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "country": "USA"
    },
    "paymentMethod": "CREDIT_CARD"
  }'
```

**Response:**
```json
{
  "orderId": "ORD-20251019-001",
  "status": "PENDING",
  "totalAmount": 2499.98,
  "items": [...],
  "createdAt": "2025-10-19T10:45:00Z"
}
```

## Step 8: Check Order Status

```bash
curl http://localhost:8080/api/orders/ORD-20251019-001 \
  -H "Authorization: Bearer $TOKEN"
```

## Step 9: Add a Product Review

```bash
curl -X POST http://localhost:8080/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "rating": 5,
    "title": "Excellent Product!",
    "comment": "This laptop exceeded my expectations. Great performance and build quality."
  }'
```

## Step 10: View User Profile

```bash
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## Common API Patterns

### Pagination

Most list endpoints support pagination:
```bash
curl "http://localhost:8080/api/products?page=0&size=20&sort=price,desc" \
  -H "Authorization: Bearer $TOKEN"
```

### Filtering

Apply filters to narrow results:
```bash
curl "http://localhost:8080/api/orders?status=COMPLETED&startDate=2025-01-01" \
  -H "Authorization: Bearer $TOKEN"
```

### Error Handling

All errors return a consistent format:
```json
{
  "timestamp": "2025-10-19T10:50:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid product quantity",
  "path": "/api/cart/items"
}
```

## Using Postman

We provide a Postman collection for easier API testing.

**To create your own collection:**
1. Create a new collection in Postman
2. Set environment variable `baseUrl` to `http://localhost:8080`
3. Set `token` variable after login
4. Import the example requests from this documentation

## Using Swagger UI

Access interactive API documentation:

```bash
# Start Swagger UI
docker-compose -f docker-compose.swagger.yml up -d

# Open browser
http://localhost:8081/swagger-ui.html
```

## Event-Driven Features

YaniQ uses events for asynchronous operations:

### Order Events
When you place an order, the system automatically:
1. **Reserves inventory** (Inventory Service)
2. **Processes payment** (Payment Service)
3. **Creates shipment** (Shipping Service)
4. **Sends notifications** (Notification Service)

### Track Events with RabbitMQ

Access RabbitMQ Management UI:
```
http://localhost:15672
Username: admin
Password: admin
```

## Monitoring

### Health Checks

Check service health:
```bash
curl http://localhost:8080/actuator/health
```

### Metrics

View metrics:
```bash
curl http://localhost:8080/actuator/metrics
```

## Next Steps

Now that you've completed the quick start:

- 📖 [Explore Architecture](/docs/architecture/overview) - Understand how services interact
- 🔧 [Development Guide](/docs/development/setup) - Set up your development environment
- 📚 [API Reference](/docs/api/overview) - Complete API documentation
- 🚀 [Service Documentation](/docs/services/overview) - Deep dive into each service

## Useful Commands

### Check Service Logs
```bash
# Docker
docker logs -f gateway-service

# Kubernetes
kubectl logs -f gateway-service-7d9f8b4c5d-abc12

# Maven (if running locally)
tail -f apps/gateway-service/logs/application.log
# Prerequisites

Before you begin working with YaniQ E-Commerce Platform, ensure you have the following prerequisites installed and configured on your development machine.

## Required Software

### Java Development Kit (JDK)
- **Version**: JDK 17 or higher
- **Download**: [AdoptOpenJDK](https://adoptium.net/) or [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)
- **Verify Installation**:
  ```bash
  java -version
  javac -version
  ```

### Apache Maven
- **Version**: 3.8.x or higher
- **Download**: [Maven Official Site](https://maven.apache.org/download.cgi)
- **Verify Installation**:
  ```bash
  mvn -version
  ```

### Docker & Docker Compose
- **Docker**: 20.10.x or higher
- **Docker Compose**: 2.x or higher
- **Download**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Verify Installation**:
  ```bash
  docker --version
  docker-compose --version
  ```

### Git
- **Version**: 2.x or higher
- **Download**: [Git Official Site](https://git-scm.com/downloads)
- **Verify Installation**:
  ```bash
  git --version
  ```

## Optional but Recommended

### Kubernetes (kubectl)
- **Version**: 1.25.x or higher
- **Download**: [Kubernetes Tools](https://kubernetes.io/docs/tasks/tools/)
- For local development: [Minikube](https://minikube.sigs.k8s.io/docs/start/) or [Kind](https://kind.sigs.k8s.io/)

### Helm
- **Version**: 3.x
- **Download**: [Helm Official Site](https://helm.sh/docs/intro/install/)

### Node.js & npm
- **Version**: Node.js 18.x or higher
- Required for documentation and some build tools
- **Download**: [Node.js Official Site](https://nodejs.org/)

## Development Tools (IDE)

Choose one of the following IDEs:

### IntelliJ IDEA
- **Recommended**: Ultimate Edition (Spring Boot support)
- **Community Edition** also works with plugins
- **Download**: [JetBrains](https://www.jetbrains.com/idea/)

### Eclipse
- **Version**: Eclipse IDE for Enterprise Java Developers
- **Download**: [Eclipse Official Site](https://www.eclipse.org/downloads/)

### Visual Studio Code
- **Extensions Required**:
  - Java Extension Pack
  - Spring Boot Extension Pack
  - Docker Extension
- **Download**: [VS Code](https://code.visualstudio.com/)

## Database Clients

### PostgreSQL Client
- **pgAdmin** or **DBeaver**
- Useful for database inspection and queries

### Redis Client
- **RedisInsight** or **redis-cli**
- For cache inspection

## System Requirements

### Minimum Hardware
- **CPU**: 4 cores
- **RAM**: 16 GB
- **Disk**: 50 GB free space

### Recommended Hardware
- **CPU**: 8 cores or more
- **RAM**: 32 GB or more
- **Disk**: 100 GB free space (SSD preferred)

## Network Requirements

- Stable internet connection for downloading dependencies
- Access to Maven Central Repository
- Access to Docker Hub (for pulling images)

## Operating System

YaniQ supports development on:
- **Linux**: Ubuntu 20.04+, Fedora, Arch Linux
- **macOS**: 11.x (Big Sur) or higher
- **Windows**: 10/11 with WSL2 recommended

## Port Requirements

Ensure the following ports are available:
- `8761`: Eureka Discovery Service
- `8080`: API Gateway
- `5432`: PostgreSQL
- `6379`: Redis
- `5672`: RabbitMQ
- `9092`: Kafka (optional)
- `3000`: Documentation server (this site)

## Next Steps

Once you have all prerequisites installed, proceed to:
- [Installation Guide](/docs/getting-started/installation) - Clone and set up the project
- [Quick Start](/docs/getting-started/quick-start) - Run your first service

## Troubleshooting

### Java Version Issues
If you have multiple Java versions installed, set `JAVA_HOME`:
```bash
export JAVA_HOME=/path/to/jdk-17
export PATH=$JAVA_HOME/bin:$PATH
```

### Docker Permission Issues (Linux)
Add your user to the docker group:
```bash
sudo usermod -aG docker $USER
```
Log out and back in for changes to take effect.

### Maven Memory Issues
Increase Maven memory allocation:
```bash
export MAVEN_OPTS="-Xmx2048m -XX:MaxPermSize=512m"
```
