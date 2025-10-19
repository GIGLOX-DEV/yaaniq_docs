# API Reference Overview

YaniQ provides comprehensive REST APIs for all services. This section documents the API endpoints, request/response formats, authentication, and error handling.

## Base URL

All API requests go through the API Gateway:

```
Development: http://localhost:8080
Production:  https://api.yaniq.com
```

## API Structure

APIs follow RESTful conventions:

```
/api/{service}/{resource}/{id}
```

Examples:
- `/api/products` - Product catalog
- `/api/orders/123` - Specific order
- `/api/users/me` - Current user

## Authentication

### JWT Bearer Token

Most endpoints require authentication via JWT token:

```http
GET /api/products HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining a Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "refreshToken": "refresh_token_here"
}
```

### Token Refresh

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "refresh_token_here"
  }'
```

## API Domains

### Authentication & Users
- [Authentication API](/docs/api/authentication) - Login, registration, password reset
- [User API](/docs/api/users) - User management and profiles

### Products & Catalog
- [Product API](/docs/api/products) - Product catalog operations
- Catalog API - Category and collection management
- Inventory API - Stock availability
- Search API - Product search

### Orders & Payments
- [Order API](/docs/api/orders) - Order management
- [Payment API](/docs/api/payments) - Payment processing
- Cart API - Shopping cart operations
- Billing API - Invoices and billing

### Customer Engagement
- [Review API](/docs/api/reviews) - Product reviews
- Promotion API - Discounts and coupons
- Loyalty API - Reward points
- Recommendation API - Product suggestions

### Support & Admin
- Support API - Customer support tickets
- Admin API - Administrative operations
- File API - File uploads/downloads
- Analytics API - Reports and metrics

## Request Format

### Headers

**Required:**
```http
Content-Type: application/json
Authorization: Bearer {token}
```

**Optional:**
```http
Accept-Language: en-US
X-Request-ID: unique-request-id
```

### Query Parameters

#### Pagination
```
?page=0&size=20&sort=createdAt,desc
```

#### Filtering
```
?status=ACTIVE&category=electronics&minPrice=100
```

#### Search
```
?q=laptop&fields=name,description
```

### Request Body

JSON format with camelCase properties:

```json
{
  "productName": "Gaming Laptop",
  "price": 1299.99,
  "category": "electronics",
  "specifications": {
    "cpu": "Intel i7",
    "ram": "16GB"
  }
}
```

## Response Format

### Success Response

```json
{
  "data": {
    "id": 123,
    "name": "Product Name",
    "price": 99.99
  },
  "meta": {
    "timestamp": "2025-10-19T10:00:00Z",
    "requestId": "abc123"
  }
}
```

### List Response with Pagination

```json
{
  "data": [
    {"id": 1, "name": "Product 1"},
    {"id": 2, "name": "Product 2"}
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  },
  "meta": {
    "timestamp": "2025-10-19T10:00:00Z"
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "timestamp": "2025-10-19T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'email'",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "rejectedValue": "invalid-email"
    }
  ],
  "path": "/api/users",
  "requestId": "abc123"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service is down |

### Common Error Scenarios

#### Validation Error (400)
```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid input data",
  "errors": [
    {
      "field": "price",
      "message": "Price must be greater than 0"
    }
  ]
}
```

#### Authentication Error (401)
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

#### Not Found (404)
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Product with ID 123 not found"
}
```

#### Rate Limit (429)
```json
{
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds",
  "retryAfter": 60
}
```

## Rate Limiting

### Default Limits

| User Type | Requests per Minute | Burst |
|-----------|-------------------|-------|
| Anonymous | 20 | 5 |
| Authenticated | 100 | 20 |
| Premium | 1000 | 100 |

### Rate Limit Headers

Response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1634567890
```

## Versioning

### URL Versioning

```
/api/v1/products
/api/v2/products
```

Current version: **v1**

### Version Deprecation

- Versions are supported for 12 months after new version release
- Deprecated versions return warning header:
  ```http
  X-API-Deprecated: true
  X-API-Sunset: 2026-01-01
  ```

## CORS

### Allowed Origins

Development:
- `http://localhost:3000`
- `http://localhost:4200`

Production:
- `https://www.yaniq.com`
- `https://admin.yaniq.com`

### Allowed Methods

```
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### Allowed Headers

```
Content-Type, Authorization, X-Request-ID
```

## Webhooks

YaniQ can send webhooks for important events:

### Configuration

Register webhook URL in admin panel:
```json
{
  "url": "https://your-server.com/webhook",
  "events": ["order.created", "payment.completed"],
  "secret": "webhook_secret"
}
```

### Webhook Payload

```json
{
  "event": "order.created",
  "timestamp": "2025-10-19T10:00:00Z",
  "data": {
    "orderId": "ORD-123",
    "status": "PENDING"
  },
  "signature": "sha256=..."
}
```

### Signature Verification

```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

## SDK & Client Libraries

### Official SDKs

- **JavaScript/TypeScript**: `@yaniq/sdk-js`
- **Python**: `yaniq-sdk`
- **Java**: `com.yaniq:yaniq-sdk`
- **Go**: `github.com/yaniq/sdk-go`

### Example Usage (JavaScript)

```javascript
import { YaniQClient } from '@yaniq/sdk-js';

const client = new YaniQClient({
  baseURL: 'http://localhost:8080',
  apiKey: 'your-api-key'
});

// Get products
const products = await client.products.list({
  page: 0,
  size: 20
});

// Create order
const order = await client.orders.create({
  items: [{ productId: 1, quantity: 2 }],
  shippingAddress: { /* ... */ }
});
```

## Testing APIs

### Postman Collection

**To create your own Postman collection:**
1. Create a new collection in Postman
2. Import the example requests from this documentation
3. Configure environment variables:
   - `baseUrl`: `http://localhost:8080`
   - `token`: (set after login)

### Swagger UI

Interactive API documentation:
```
http://localhost:8081/swagger-ui.html
```

### cURL Examples

See individual API documentation for cURL examples.

## API Best Practices

### ✅ DO
- Always include authentication token
- Use appropriate HTTP methods
- Handle pagination for lists
- Implement retry logic with exponential backoff
- Validate input before sending
- Check rate limit headers

### ❌ DON'T
- Hardcode tokens in code
- Ignore error responses
- Make unnecessary requests
- Send sensitive data in URLs
- Retry immediately on error
- Exceed rate limits

## Next Steps

Explore specific API documentation:

- [Authentication API](/docs/api/authentication)
- [User API](/docs/api/users)
- [Product API](/docs/api/products)
- [Order API](/docs/api/orders)
- [Payment API](/docs/api/payments)
- [Review API](/docs/api/reviews)

Or learn about:
- [Event-Driven APIs](/docs/api/event-overview)
- [Service Documentation](/docs/services/overview)
- [Architecture](/docs/architecture/overview)
# Services Overview

YaniQ consists of 22 microservices, each responsible for a specific business domain. This page provides an overview of all services and their responsibilities.

## Service Categories

### 🔐 Core Services (4)

Essential services that provide foundational functionality.

| Service | Port | Responsibility | Dependencies |
|---------|------|---------------|--------------|
| [Auth Service](/docs/services/auth-service) | 8081 | Authentication & Authorization | User Service, Redis |
| [User Service](/docs/services/user-service) | 8082 | User management & profiles | PostgreSQL, Redis |
| [Gateway Service](/docs/services/gateway-service) | 8080 | API Gateway & routing | All services |
| [Discovery Service](/docs/services/discovery-service) | 8761 | Service registry (Eureka) | None |

### 🛍️ Product & Catalog Services (4)

Manage product information and inventory.

| Service | Port | Responsibility | Dependencies |
|---------|------|---------------|--------------|
| [Product Service](/docs/services/product-service) | 8083 | Product management | PostgreSQL, Redis |
| [Catalog Service](/docs/services/catalog-service) | 8084 | Catalog organization | Product Service |
| [Inventory Service](/docs/services/inventory-service) | 8085 | Stock management | PostgreSQL, RabbitMQ |
| [Search Service](/docs/services/search-service) | 8086 | Product search | Elasticsearch |

### 💳 Order & Payment Services (4)

Handle shopping cart, orders, and payments.

| Service | Port | Responsibility | Dependencies |
|---------|------|---------------|--------------|
| [Cart Service](/docs/services/cart-service) | 8087 | Shopping cart | Redis, Product Service |
| [Order Service](/docs/services/order-service) | 8088 | Order processing | PostgreSQL, RabbitMQ |
| [Payment Service](/docs/services/payment-service) | 8089 | Payment processing | PostgreSQL, Payment Gateway |
| [Billing Service](/docs/services/billing-service) | 8090 | Invoicing & billing | Order Service, PostgreSQL |

### 📦 Fulfillment & Logistics (1)

Manage shipping and delivery.

| Service | Port | Responsibility | Dependencies |
|---------|------|---------------|--------------|
| [Shipping Service](/docs/services/shipping-service) | 8091 | Shipping & tracking | Order Service, 3rd party APIs |

### 🎯 Customer Engagement Services (5)

Enhance customer experience and engagement.

| Service | Port | Responsibility | Dependencies |
|---------|------|---------------|--------------|
| [Review Service](/docs/services/review-service) | 8092 | Product reviews & ratings | PostgreSQL, Product Service |
| [Promotion Service](/docs/services/promotion-service) | 8093 | Discounts & promotions | PostgreSQL, Redis |
| [Loyalty Service](/docs/services/loyalty-service) | 8094 | Loyalty points & rewards | PostgreSQL, User Service |
| [Recommendation Service](/docs/services/recommendation-service) | 8095 | Product recommendations | ML models, Product Service |
| [Notification Service](/docs/services/notification-service) | 8096 | Email/SMS notifications | RabbitMQ, Email/SMS providers |

### 🛠️ Support & Management Services (4)

Administrative and support functions.

| Service | Port | Responsibility | Dependencies |
|---------|------|---------------|--------------|
| [Support Service](/docs/services/support-service) | 8097 | Customer support tickets | PostgreSQL, User Service |
| [Admin Service](/docs/services/admin-service) | 8098 | Admin operations | All services |
| [File Service](/docs/services/file-service) | 8099 | File upload/download | MinIO/S3 |
| [Analytic Service](/docs/services/analytic-service) | 8100 | Analytics & reporting | All services, TimescaleDB |

## Service Interaction Patterns

### Synchronous (REST API)

Services communicate via REST when immediate response is needed:

```
Gateway → Auth Service → User Service
   ↓
Product Service → Inventory Service
```

### Asynchronous (Events)

Services publish events for background processing:

```
Order Created Event
   ↓
   ├→ Payment Service (process payment)
   ├→ Inventory Service (reserve stock)
   ├→ Notification Service (send confirmation)
   └→ Shipping Service (create shipment)
```

## Common Service Features

All services implement:

- ✅ **Health Checks**: `/actuator/health`
- ✅ **Metrics**: Prometheus endpoints
- ✅ **Logging**: Structured JSON logs
- ✅ **Distributed Tracing**: Jaeger integration
- ✅ **Circuit Breakers**: Resilience4j
- ✅ **API Documentation**: OpenAPI/Swagger
- ✅ **Security**: JWT authentication
- ✅ **Caching**: Redis integration
- ✅ **Database**: PostgreSQL with Flyway migrations

## Service Dependencies

```mermaid
graph TD
    GW[Gateway Service] --> AUTH[Auth Service]
    GW --> USER[User Service]
    GW --> PROD[Product Service]
    GW --> CART[Cart Service]
    GW --> ORDER[Order Service]
    
    AUTH --> USER
    CART --> PROD
    ORDER --> CART
    ORDER --> INV[Inventory Service]
    ORDER --> PAY[Payment Service]
    ORDER --> SHIP[Shipping Service]
    
    PROD --> SEARCH[Search Service]
    PROD --> REC[Recommendation Service]
```

## Service Communication

### REST API Calls
- **Synchronous**: Use RestTemplate or WebClient
- **Timeout**: 5 seconds default
- **Retry**: 3 attempts with exponential backoff
- **Circuit Breaker**: Opens after 50% failure rate

### Event Publishing
- **Broker**: RabbitMQ
- **Format**: JSON
- **Reliability**: Persistent messages
- **Dead Letter Queue**: For failed processing

## Service Health

### Health Check Endpoints

Each service exposes:
```
GET /actuator/health
```

Response:
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "redis": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

### Service States

- 🟢 **UP**: Service is healthy and accepting requests
- 🟡 **DEGRADED**: Service is running but with issues
- 🔴 **DOWN**: Service is not responding

## Deployment

### Development
```bash
# Start individual service
cd apps/product-service
mvn spring-boot:run
```

### Docker
```bash
docker-compose up -d product-service
```

### Kubernetes
```bash
kubectl apply -f k8s/services/product-service.yaml
```

## Monitoring

### Key Metrics

Each service tracks:
- **Request Rate**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Latency**: P50, P95, P99 response times
- **Saturation**: CPU, memory, disk usage

### Alerts

Common alerts configured:
- High error rate (>5%)
- High latency (P95 > 1s)
- High CPU usage (>80%)
- Service down

## Configuration

Services are configured through:

1. **application.yml**: Default configuration
2. **Spring Cloud Config**: Centralized config
3. **Environment Variables**: Runtime overrides
4. **Command Line Args**: Deployment specific

Example configuration:
```yaml
server:
  port: 8083
spring:
  application:
    name: product-service
  datasource:
    url: jdbc:postgresql://localhost:5432/products
  redis:
    host: localhost
    port: 6379
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

## Service Development

### Adding a New Service

1. **Create Service Structure**
```bash
mkdir -p apps/new-service/src/main/java/com/yaniq/newservice
```

2. **Add Dependencies** (pom.xml)
```xml
<dependencies>
    <dependency>
        <groupId>com.yaniq</groupId>
        <artifactId>common-api</artifactId>
    </dependency>
    <!-- Other dependencies -->
</dependencies>
```

3. **Create Main Application**
```java
@SpringBootApplication
@EnableDiscoveryClient
public class NewServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NewServiceApplication.class, args);
    }
}
```

4. **Configure Service**
5. **Add to Docker Compose**
6. **Create K8s Manifests**
7. **Document in Docusaurus**

## Service Standards

### API Endpoints
- **Base Path**: `/api/[service-domain]`
- **Versioning**: `/api/v1/products`
- **HTTP Methods**: RESTful conventions
- **Response Format**: JSON

### Error Handling
All services return consistent error format:
```json
{
  "timestamp": "2025-10-19T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid input",
  "path": "/api/products"
}
```

### Logging
Structured logs with correlation IDs:
```json
{
  "timestamp": "2025-10-19T10:00:00Z",
  "level": "INFO",
  "service": "product-service",
  "traceId": "abc123",
  "message": "Product created"
}
```

## Next Steps

Explore individual service documentation:

- [Auth Service](/docs/services/auth-service)
- [User Service](/docs/services/user-service)
- [Product Service](/docs/services/product-service)
- [Order Service](/docs/services/order-service)

Or learn about:
- [Architecture](/docs/architecture/overview)
- [Common Libraries](/docs/libraries/overview)
- [API Reference](/docs/api/overview)
