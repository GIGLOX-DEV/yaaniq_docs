# Libraries Overview

YaniQ provides 14 common libraries that encapsulate shared functionality across all microservices. These libraries promote code reuse, consistency, and best practices.

## Why Common Libraries?

- **Code Reuse**: Write once, use everywhere
- **Consistency**: Standardized patterns across services
- **Maintainability**: Update once, all services benefit
- **Best Practices**: Encapsulate proven patterns
- **Type Safety**: Shared DTOs prevent integration errors

## Library Categories

### 🔌 API & Communication (2)

| Library | Purpose | Key Features |
|---------|---------|--------------|
| [common-api](/docs/libraries/common-api) | REST API utilities | Base controllers, response wrappers, pagination |
| [common-messaging](/docs/libraries/common-messaging) | Message queue abstractions | Event publishers, consumers, message templates |

### 🔒 Security & Validation (2)

| Library | Purpose | Key Features |
|---------|---------|--------------|
| [common-security](/docs/libraries/common-security) | Security utilities | JWT handling, RBAC, encryption |
| [common-validation](/docs/libraries/common-validation) | Input validation | Custom validators, validation rules |

### 📊 Data & Models (3)

| Library | Purpose | Key Features |
|---------|---------|--------------|
| [common-models](/docs/libraries/common-models) | Shared domain models | Base entities, value objects |
| [common-dto](/docs/libraries/common-dto) | Data transfer objects | Request/response DTOs |
| [common-events](/docs/libraries/common-events) | Event definitions | Event schemas, event types |

### ⚙️ Infrastructure (4)

| Library | Purpose | Key Features |
|---------|---------|--------------|
| [common-config](/docs/libraries/common-config) | Configuration management | Property sources, config beans |
| [common-cache](/docs/libraries/common-cache) | Caching abstractions | Redis integration, cache annotations |
| [common-logging](/docs/libraries/common-logging) | Logging utilities | Structured logging, MDC setup |
| [common-audit](/docs/libraries/common-audit) | Audit functionality | Change tracking, audit logs |

### 🛠️ Utilities (3)

| Library | Purpose | Key Features |
|---------|---------|--------------|
| [common-utils](/docs/libraries/common-utils) | General utilities | Date utils, string utils, collection utils |
| [common-exceptions](/docs/libraries/common-exceptions) | Exception handling | Custom exceptions, global handlers |
| [common-test](/docs/libraries/common-test) | Testing utilities | Test fixtures, mock data, test containers |

## Using Libraries

### Maven Dependency

Add to your service's `pom.xml`:

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-api</artifactId>
    <version>${yaniq.version}</version>
</dependency>
```

### Auto-Configuration

Most libraries provide Spring Boot auto-configuration:

```java
// Just add the dependency, configuration is automatic!
@SpringBootApplication
public class MyServiceApplication {
    // Libraries are auto-configured
}
```

### Custom Configuration

Override defaults in `application.yml`:

```yaml
yaniq:
  common:
    cache:
      enabled: true
      ttl: 3600
    security:
      jwt:
        secret: ${JWT_SECRET}
        expiration: 86400000
```

## Common Library Features

All libraries follow these standards:

### ✅ Spring Boot Auto-Configuration
- Automatic bean registration
- Sensible defaults
- Easy customization

### ✅ Documentation
- Comprehensive JavaDoc
- Usage examples
- Configuration reference

### ✅ Testing
- Unit tests (>80% coverage)
- Integration tests
- Test utilities provided

### ✅ Versioning
- Semantic versioning (SemVer)
- Backward compatibility
- Migration guides

## Library Development

### Creating a New Library

1. **Create Module Structure**
```bash
mkdir -p libs/common-feature/src/main/java/com/yaniq/common/feature
```

2. **Add to Parent POM**
```xml
<modules>
    <module>libs/common-feature</module>
</modules>
```

3. **Create Library POM**
```xml
<artifactId>common-feature</artifactId>
<name>YaniQ Common Feature</name>
<description>Feature description</description>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

4. **Implement Auto-Configuration**
```java
@Configuration
@ConditionalOnProperty(name = "yaniq.common.feature.enabled", 
                       havingValue = "true", 
                       matchIfMissing = true)
public class FeatureAutoConfiguration {
    // Configuration beans
}
```

5. **Register Auto-Configuration**

Create `src/main/resources/META-INF/spring.factories`:
```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.yaniq.common.feature.config.FeatureAutoConfiguration
```

### Library Standards

#### Package Structure
```
com.yaniq.common.feature/
├── config/           # Configuration classes
├── annotation/       # Custom annotations
├── exception/        # Custom exceptions
├── model/            # Domain models
├── service/          # Service interfaces
├── util/             # Utility classes
└── constant/         # Constants
```

#### Naming Conventions
- **Classes**: PascalCase (e.g., `JwtTokenProvider`)
- **Methods**: camelCase (e.g., `generateToken()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `TOKEN_PREFIX`)
- **Packages**: lowercase (e.g., `com.yaniq.common.security`)

## Key Libraries

### common-api

Base classes for REST controllers:

```java
@RestController
public class ProductController extends BaseController {
    
    @GetMapping("/products")
    public ApiResponse<Page<ProductDTO>> getProducts(Pageable pageable) {
        return success(productService.findAll(pageable));
    }
}
```

### common-security

JWT and security utilities:

```java
@Service
public class AuthService {
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    public String authenticate(String username, String password) {
        // Authenticate user
        return tokenProvider.generateToken(username);
    }
}
```

### common-cache

Caching abstractions:

```java
@Service
public class ProductService {
    
    @Cacheable(value = "products", key = "#id")
    public Product findById(Long id) {
        return productRepository.findById(id);
    }
}
```

### common-messaging

Event publishing:

```java
@Service
public class OrderService {
    
    @Autowired
    private EventPublisher eventPublisher;
    
    public Order createOrder(OrderRequest request) {
        Order order = // create order
        eventPublisher.publish(new OrderCreatedEvent(order));
        return order;
    }
}
```

### common-exceptions

Global exception handling:

```java
@ControllerAdvice
public class GlobalExceptionHandler extends BaseExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex) {
        return notFound(ex.getMessage());
    }
}
```

## Library Dependencies

```
common-test
    ↓
common-api ← common-security
    ↓            ↓
common-dto   common-models
    ↓            ↓
common-utils ← common-exceptions
```

**Rules**:
- Libraries can depend on other libraries
- Avoid circular dependencies
- Keep dependency tree shallow

## Testing Libraries

### Unit Testing

```java
@Test
public void testJwtGeneration() {
    JwtTokenProvider provider = new JwtTokenProvider("secret");
    String token = provider.generateToken("user123");
    
    assertNotNull(token);
    assertTrue(provider.validateToken(token));
}
```

### Integration Testing

Use `common-test` utilities:

```java
@SpringBootTest
@AutoConfigureTestDatabase
public class ServiceIntegrationTest {
    
    @Autowired
    private TestDataFactory testData;
    
    @Test
    public void testServiceWithCache() {
        // Test implementation
    }
}
```

## Documentation

Each library has comprehensive documentation:

- **README.md**: Overview and quick start
- **JavaDoc**: API documentation
- **Examples**: Usage examples in `/examples`
- **Docusaurus**: This documentation site

## Versioning Strategy

### Semantic Versioning

```
MAJOR.MINOR.PATCH
  |     |      |
  |     |      └─ Bug fixes
  |     └──────── New features (backward compatible)
  └────────────── Breaking changes
```

Example: `1.2.3`

### Compatibility

- **Patch updates**: Always safe
- **Minor updates**: Safe, new features added
- **Major updates**: Review migration guide

## Configuration Properties

### common-cache
```yaml
yaniq:
  common:
    cache:
      enabled: true
      type: redis  # or caffeine
      ttl: 3600
      max-size: 1000
```

### common-security
```yaml
yaniq:
  common:
    security:
      jwt:
        secret: ${JWT_SECRET}
        expiration: 86400000
        header: Authorization
        prefix: Bearer
```

### common-messaging
```yaml
yaniq:
  common:
    messaging:
      exchange: yaniq-exchange
      queue-prefix: yaniq
      retry:
        max-attempts: 3
        backoff: 1000
```

## Best Practices

### ✅ DO
- Use libraries for cross-cutting concerns
- Follow established patterns
- Write comprehensive tests
- Document public APIs
- Version carefully

### ❌ DON'T
- Add business logic to common libraries
- Create circular dependencies
- Break backward compatibility without major version bump
- Copy code instead of using libraries
- Forget to update documentation

## Migration Guide

### Updating Libraries

1. **Check Release Notes**: Review changes and breaking changes
2. **Update Version**: In parent POM
3. **Run Tests**: Ensure compatibility
4. **Update Code**: Fix any breaking changes
5. **Deploy**: Roll out to services

### Breaking Changes

When a library introduces breaking changes:

1. Increment major version
2. Provide migration guide
3. Support previous version for transition period
4. Announce deprecation clearly

## Next Steps

Explore individual library documentation:

- [common-api](/docs/libraries/common-api)
- [common-security](/docs/libraries/common-security)
- [common-cache](/docs/libraries/common-cache)
- [common-messaging](/docs/libraries/common-messaging)

Or learn about:
- [Services Overview](/docs/services/overview)
- [Architecture](/docs/architecture/overview)
- [Development Guide](/docs/development/setup)

