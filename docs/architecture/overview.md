# Architecture Overview

YaniQ is built on a modern microservices architecture, designed for scalability, resilience, and maintainability. This page provides a high-level overview of the system architecture.

## System Architecture Diagram

```
                                    ┌─────────────┐
                                    │   Clients   │
                                    │ (Web/Mobile)│
                                    └──────┬──────┘
                                           │
                                           ↓
                                  ┌────────────────┐
                                  │  API Gateway   │
                                  │   (Port 8080)  │
                                  └────────┬───────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ↓                      ↓                      ↓
          ┌──────────────────┐   ┌─────────────────┐   ┌──────────────────┐
          │  Auth Service    │   │  User Service   │   │ Product Service  │
          └──────────────────┘   └─────────────────┘   └──────────────────┘
                    │                      │                      │
                    └──────────────────────┼──────────────────────┘
                                           │
                              ┌────────────┴────────────┐
                              ↓                         ↓
                    ┌──────────────────┐      ┌──────────────────┐
                    │  Service Discovery│      │  Config Server   │
                    │     (Eureka)      │      │  (Spring Cloud)  │
                    └──────────────────┘      └──────────────────┘
```

## Core Principles

### 1. Microservices Architecture
Each service is:
- **Independent**: Can be developed, deployed, and scaled independently
- **Domain-Focused**: Owns a specific business domain
- **Loosely Coupled**: Minimal dependencies on other services
- **Highly Cohesive**: Related functionality grouped together

### 2. Cloud-Native Design
- **Containerized**: All services run in Docker containers
- **Orchestrated**: Kubernetes for container orchestration
- **Scalable**: Horizontal scaling based on demand
- **Resilient**: Self-healing and fault-tolerant

### 3. Event-Driven Architecture
- **Asynchronous Communication**: Services communicate via events
- **Event Sourcing**: Track all state changes as events
- **CQRS Pattern**: Separate read and write operations
- **Message Brokers**: RabbitMQ/Kafka for event distribution

## Service Layers

### 1. Edge Layer
**Purpose**: External-facing services that handle client requests

- **API Gateway**: Single entry point, routing, authentication
- **Load Balancer**: Distributes traffic across instances

### 2. Service Layer
**Purpose**: Core business services

#### Core Services
- **Auth Service**: Authentication and authorization
- **User Service**: User management and profiles
- **Gateway Service**: API routing and composition
- **Discovery Service**: Service registry and discovery

#### Domain Services
- **Product Service**: Product catalog
- **Order Service**: Order processing
- **Payment Service**: Payment processing
- **Inventory Service**: Stock management
- **Cart Service**: Shopping cart
- **Shipping Service**: Logistics
- **Review Service**: Reviews and ratings

#### Support Services
- **Notification Service**: Email/SMS notifications
- **Search Service**: Full-text search
- **Recommendation Service**: AI-powered recommendations
- **Analytics Service**: Data analytics
- **File Service**: File management

### 3. Infrastructure Layer
**Purpose**: Platform services that support other services

- **Service Discovery**: Eureka
- **Configuration Management**: Spring Cloud Config
- **API Documentation**: Swagger/OpenAPI
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack
- **Tracing**: Jaeger

### 4. Data Layer
**Purpose**: Data storage and management

- **Databases**: PostgreSQL (per service)
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Event Stream**: Kafka (optional)
- **Object Storage**: MinIO/S3

## Communication Patterns

### Synchronous Communication (REST)
Used for:
- Real-time queries
- Request-response patterns
- Client-facing APIs

**Protocols**: HTTP/REST with JSON  
**Libraries**: Spring Web, RestTemplate, WebClient

### Asynchronous Communication (Events)
Used for:
- Background processing
- Cross-service notifications
- Event sourcing

**Protocols**: AMQP (RabbitMQ), Apache Kafka  
**Libraries**: Spring Cloud Stream, Spring AMQP

## Key Components

### API Gateway
- **Technology**: Spring Cloud Gateway
- **Features**:
  - Request routing
  - Load balancing
  - Authentication/Authorization
  - Rate limiting
  - Circuit breaking
  - Request/Response transformation

### Service Discovery
- **Technology**: Netflix Eureka
- **Features**:
  - Dynamic service registration
  - Health checking
  - Load balancing
  - Service lookup

### Configuration Management
- **Technology**: Spring Cloud Config
- **Features**:
  - Centralized configuration
  - Environment-specific configs
  - Dynamic refresh
  - Encryption support

### Security
- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: Role-Based Access Control (RBAC)
- **API Security**: OAuth 2.0 + OpenID Connect
- **Secret Management**: HashiCorp Vault (optional)

## Data Management

### Database per Service
Each service has its own database:
- **Independence**: No shared databases
- **Isolation**: Data access only through service APIs
- **Flexibility**: Choose appropriate database type per service

### Data Consistency
- **Eventual Consistency**: Acceptable for most operations
- **Saga Pattern**: For distributed transactions
- **Event Sourcing**: For audit trails

### Caching Strategy
- **L1 Cache**: Application-level (Caffeine)
- **L2 Cache**: Distributed (Redis)
- **Cache-Aside Pattern**: For read-heavy operations
- **Write-Through**: For critical data

## Resilience Patterns

### Circuit Breaker
Prevents cascade failures by stopping calls to failing services.

### Retry Logic
Automatically retries failed operations with exponential backoff.

### Bulkhead
Isolates resources to prevent cascade failures.

### Timeout
Sets appropriate timeouts for all external calls.

### Rate Limiting
Protects services from overload.

## Observability

### Logging
- **Structure**: JSON formatted logs
- **Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Correlation**: Trace IDs across services

### Metrics
- **Collection**: Micrometer
- **Storage**: Prometheus
- **Visualization**: Grafana
- **Key Metrics**: Latency, throughput, error rates

### Distributed Tracing
- **Technology**: Jaeger/Zipkin
- **Purpose**: Track requests across services
- **Sampling**: Configurable sampling rates

### Health Checks
- **Liveness**: Is the service running?
- **Readiness**: Can it handle requests?
- **Actuator Endpoints**: `/actuator/health`

## Security Architecture

### Defense in Depth
1. **Network Security**: Firewall, VPC, Security Groups
2. **API Security**: JWT, OAuth 2.0, Rate Limiting
3. **Application Security**: Input validation, CSRF protection
4. **Data Security**: Encryption at rest and in transit
5. **Audit Logging**: Track all security events

### Zero Trust Model
- Never trust, always verify
- Authenticate every request
- Authorize based on least privilege
- Encrypt all communication

## Scalability

### Horizontal Scaling
- Add more instances of a service
- Load balanced automatically
- Stateless design enables easy scaling

### Vertical Scaling
- Increase resources (CPU, RAM) per instance
- Used when horizontal scaling isn't sufficient

### Auto-Scaling
- Based on CPU/Memory metrics
- Request rate thresholds
- Custom business metrics

## Deployment Architecture

### Development
- Docker Compose
- All services on single machine
- Shared infrastructure services

### Staging
- Kubernetes cluster
- Similar to production
- Smaller resource allocation

### Production
- Multi-zone Kubernetes cluster
- High availability
- Auto-scaling enabled
- Disaster recovery configured

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Build Tool**: Maven
- **API**: REST + GraphQL (optional)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Service Mesh**: Istio (optional)
- **Infrastructure as Code**: Terraform

### Data
- **Relational DB**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Search**: Elasticsearch

### Observability
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack
- **Tracing**: Jaeger
- **APM**: New Relic/DataDog (optional)

## Design Patterns

- **API Gateway Pattern**: Single entry point
- **Service Registry Pattern**: Dynamic discovery
- **Circuit Breaker Pattern**: Fault tolerance
- **Saga Pattern**: Distributed transactions
- **Event Sourcing**: Audit and replay
- **CQRS**: Separate reads and writes
- **Strangler Fig**: Legacy migration
- **Sidecar Pattern**: Cross-cutting concerns

## Next Steps

- [Microservices Details](/docs/architecture/microservices) - Deep dive into service design
- [Data Flow](/docs/architecture/data-flow) - Understand data movement
- [Security Architecture](/docs/architecture/security) - Security implementation
- [Services Overview](/docs/services/overview) - Explore individual services

## References

- [Microservices Patterns (Chris Richardson)](https://microservices.io/patterns/)
- [12-Factor App](https://12factor.net/)
- [Spring Cloud Documentation](https://spring.io/projects/spring-cloud)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/)

