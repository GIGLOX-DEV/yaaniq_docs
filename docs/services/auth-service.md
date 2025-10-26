# AUTH SERVICE 

The `auth service` is a Spring Boot application that provides authentication and authorization functionalities for the Yaaniq platform. It leverages various Spring technologies to ensure secure and efficient user management.

## Version && Dependencies

- **Version**: 1.0.0
- **Java**: 17
- **Group ID**: com.yaaniq
- **Artifact ID**: auth-service
- **Packaging**: Jar
- **Spring Boot Version**: 3.5.5
- **Spring Cloud Version**: 2025.0.1

---

### Key Dependencies
- Spring Web
- Spring Boot DevTools
- Spring Boot Actuator
- Spring Data JPA
- Spring Security
- Eureka Server
- OpenFeign
- Config Client
- OAuth2 Authorization Server

---

## Features
- RESTful Web Services
- User Authentication and Authorization
- Data Validation
- Integration with JPA for Database Operations
- Service Discovery with Eureka
- Declarative REST calls with OpenFeign
- OAuth2 Authorization Server capabilities

---

## Tech Diagrams

### 1. User Registration & Token Generation

```mermaid
    sequenceDiagram
    participant Client
    participant Gateway as "Gateway (Port 8080)"
    participant DiscoveryService as "Discovery Service"
    participant AuthService as "Auth-Service"

    Note over Client,AuthService: Registration & Token Generation

    Client->>Gateway: POST /api/auth/register {user, pass}
    
    Gateway->>DiscoveryService: Find 'auth-service'
    DiscoveryService-->>Gateway: 'auth-service' location
    
    Gateway->>AuthService: Forward POST /api/auth/register
    
    loop Auth-Service Processing
        AuthService->>AuthService: 1. Create user
        AuthService->>AuthService: 2. Authenticate (auto-login)
        AuthService->>AuthService: 3. Generate JWT
        AuthService->>AuthService: 4. Generate Refresh Token
    end
    
    AuthService-->>Gateway: { jwt, refresh_token }
    Gateway-->>Client: { jwt, refresh_token }

```

---

### 2. Token Validation 

```mermaid
sequenceDiagram
    participant Client
    participant Gateway as "Gateway (Port 8080)"
    participant DiscoveryService as "Discovery Service"
    participant OtherServices as "Other-Services"

    Note over Client,OtherServices: Accessing Protected Route (Gateway Validates JWT)

    Client->>Gateway: GET /api/v?/protected-route (Header: Bearer jwt)
    
    loop Gateway Validates JWT
        Gateway->>Gateway: 1. Check token signature
        Gateway->>Gateway: 2. Check token expiration
        Gateway->>Gateway: 3. Extract user info
    end
    
    Note left of Gateway: JWT is valid. Forward request.

    Gateway->>DiscoveryService: Find 'other-services'
    DiscoveryService-->>Gateway: 'other-services' location
    
    Gateway->>OtherServices: Forward GET /api/v?/protected-route
    
    OtherServices-->>Gateway: { "protected_data": "..." }
    Gateway-->>Client: { "protected_data": "..." }
```

---