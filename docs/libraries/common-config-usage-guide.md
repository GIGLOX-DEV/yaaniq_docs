# Common-Config Library - Complete Usage Guide

## Overview

The `common-config` library provides centralized configuration classes, properties, constants, and beans that are shared across all YaniQ microservices. It ensures consistent configuration, reduces duplication, and simplifies service setup by providing pre-configured Spring beans and application properties.

---

## Version Information

- **Current Version:** `1.0.0`
- **Java Version:** `21`
- **Group ID:** `com.yaniq`
- **Artifact ID:** `common-config`
- **Last Updated:** October 2025

---

## Why Use Common-Config?

### 🎯 **Centralized Configuration**
- **Single Source of Truth**: All common configurations in one place
- **Consistency**: Same settings across all microservices
- **Easy Updates**: Change configuration once, apply everywhere
- **Reduced Duplication**: Don't repeat configuration code

### 🔧 **Pre-configured Beans**
- **RestTemplate**: HTTP client with timeouts
- **RetryTemplate**: Retry logic for transient failures
- **OpenAPI/Swagger**: API documentation setup
- **Validation**: Request validation configuration
- **Metrics**: Actuator and monitoring setup

### 📋 **Shared Constants**
- **API Endpoints**: Standardized URL patterns
- **Cache Names**: Consistent cache key naming
- **Security Constants**: Token settings, headers
- **Message Queues**: Queue and topic names

### ⚙️ **Configuration Properties**
- **Application Settings**: Service metadata
- **Security Settings**: Token expiration, login attempts
- **Pagination**: Default page sizes
- **File Upload**: Size limits, allowed types

### 🔄 **Cross-Service Integration**
- **Service Discovery**: Consistent service naming
- **API Versioning**: Standardized versioning strategy
- **Error Handling**: Unified exception handling
- **Logging**: Common logging configuration

---

## Installation

### Maven Dependency

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-config</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `spring-boot-starter` | Managed | Spring Boot core |
| `spring-boot-starter-web` | Managed | Web MVC support |
| `spring-boot-starter-actuator` | Managed | Monitoring and metrics |
| `spring-boot-starter-validation` | Managed | Bean validation |
| `spring-retry` | Managed | Retry mechanisms |
| `spring-boot-starter-aop` | Managed | AOP support for retry |

---

## Core Components

### 1. Configuration Classes

```
Common-Config
├── RestTemplateConfig - HTTP client configuration
├── RetryConfig - Retry logic configuration
├── OpenApiConfig - Swagger/OpenAPI setup
├── ValidationConfig - Request validation
├── DateTimeConfig - Date/time formatting
├── SchedulingConfig - Task scheduling
├── MetricsConfig - Application metrics
├── ActuatorConfig - Health checks and monitoring
└── LoggingIntegrationConfig - Logging setup
```

### 2. Properties Classes

```
Properties
├── ApplicationProperties - App metadata and settings
├── CacheProperties - Cache configuration
└── MessagingProperties - Message broker settings
```

### 3. Constants

```
Constants
├── ApiEndpoints - API URL patterns
├── CacheNames - Cache key names
├── SecurityConstants - Security settings
└── MessageQueueNames - Queue/topic names
```

### 4. Helpers

```
Helpers
├── ApiResponseHelper - Response building utilities
└── MessageHelper - Message formatting utilities
```

---

## Impact on Other Services

### 🔗 **Services Using Common-Config**

The common-config library is used by ALL YaniQ microservices:

1. **auth-service** - Uses SecurityConstants, RetryConfig
2. **user-service** - Uses ApplicationProperties, ApiEndpoints
3. **product-service** - Uses RestTemplateConfig, CacheNames
4. **order-service** - Uses RetryConfig, MessageQueueNames
5. **payment-service** - Uses SecurityConstants, RetryConfig
6. **cart-service** - Uses CacheNames, ApiEndpoints
7. **inventory-service** - Uses RestTemplateConfig, RetryConfig
8. **notification-service** - Uses MessagingProperties, MessageQueueNames
9. **gateway-service** - Uses ApiEndpoints, SecurityConstants
10. **discovery-service** - Uses ApplicationProperties, ActuatorConfig

### 📊 **Configuration Propagation**

When you change common-config:
- **All services** inherit the new configuration
- **Rebuild required** for services using the library
- **Versioning important** to manage breaking changes
- **Testing needed** across all affected services

---

## Usage Examples

### 1. Using RestTemplate

```java
@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final RestTemplate restTemplate; // Auto-configured from common-config
    
    public InventoryResponse checkInventory(String productId) {
        String url = "http://inventory-service/api/v1/inventory/product/" + productId;
        
        try {
            return restTemplate.getForObject(url, InventoryResponse.class);
        } catch (RestClientException ex) {
            log.error("Failed to check inventory for product: {}", productId, ex);
            throw new ServiceException("Inventory service unavailable");
        }
    }
    
    public PaymentResponse processPayment(PaymentRequest request) {
        String url = "http://payment-service/api/v1/payments/process";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(SecurityConstants.AUTH_HEADER, "Bearer " + getToken());
        
        HttpEntity<PaymentRequest> entity = new HttpEntity<>(request, headers);
        
        return restTemplate.postForObject(url, entity, PaymentResponse.class);
    }
}
```

### 2. Using Retry Configuration

```java
@Service
@RequiredArgsConstructor
public class ExternalApiService {
    
    private final RetryTemplate retryTemplate; // Auto-configured from common-config
    private final RestTemplate restTemplate;
    
    @Retryable(
        value = {RestClientException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public ApiResponse callExternalApi() {
        return restTemplate.getForObject(
            "https://external-api.com/data",
            ApiResponse.class
        );
    }
    
    // Or use RetryTemplate directly
    public OrderResponse createOrder(OrderRequest request) {
        return retryTemplate.execute(context -> {
            log.info("Attempt {} to create order", context.getRetryCount() + 1);
            return orderServiceClient.createOrder(request);
        });
    }
}
```

### 3. Using Application Properties

```java
@RestController
@RequestMapping(ApiEndpoints.PRODUCTS_BASE)
@RequiredArgsConstructor
public class ProductController {
    
    private final ApplicationProperties appProperties;
    private final ProductService productService;
    
    @GetMapping
    public ApiResponse<List<ProductDTO>> getProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(required = false) Integer size
    ) {
        // Use default page size from common-config
        int pageSize = size != null ? size : appProperties.getPagination().getDefaultPageSize();
        
        // Enforce max page size
        if (pageSize > appProperties.getPagination().getMaxPageSize()) {
            pageSize = appProperties.getPagination().getMaxPageSize();
        }
        
        Page<ProductDTO> products = productService.findAll(page, pageSize);
        return ApiResponse.success(products.getContent());
    }
    
    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file) {
        // Use upload settings from common-config
        long maxSize = appProperties.getUpload().getMaxFileSize();
        String[] allowedTypes = appProperties.getUpload().getAllowedFileTypes();
        
        if (file.getSize() > maxSize) {
            throw new BadRequestException(
                "File size exceeds maximum allowed: " + maxSize + " bytes"
            );
        }
        
        String extension = getFileExtension(file.getOriginalFilename());
        if (!Arrays.asList(allowedTypes).contains(extension)) {
            throw new BadRequestException(
                "File type not allowed. Allowed types: " + String.join(", ", allowedTypes)
            );
        }
        
        String url = fileService.upload(file);
        return ApiResponse.success(url, "File uploaded successfully");
    }
}
```

### 4. Using API Endpoint Constants

```java
@RestController
@RequestMapping(ApiEndpoints.ORDERS_BASE) // "/api/v1/orders"
public class OrderController {
    
    @GetMapping // GET /api/v1/orders
    public ApiResponse<List<OrderDTO>> getAllOrders() {
        return ApiResponse.success(orderService.findAll());
    }
    
    @GetMapping(ApiEndpoints.ORDERS_BY_ID) // GET /api/v1/orders/{id}
    public ApiResponse<OrderDTO> getOrder(@PathVariable Long id) {
        return ApiResponse.success(orderService.findById(id));
    }
    
    @PostMapping // POST /api/v1/orders
    public ApiResponse<OrderDTO> createOrder(@RequestBody @Valid OrderRequest request) {
        return ApiResponse.success(orderService.create(request));
    }
    
    @PutMapping("/{id}/status") // PUT /api/v1/orders/{id}/status
    public ApiResponse<OrderDTO> updateStatus(
        @PathVariable Long id,
        @RequestBody OrderStatusUpdate update
    ) {
        return ApiResponse.success(orderService.updateStatus(id, update.getStatus()));
    }
}

// Consistent across all services
@RestController
@RequestMapping(ApiEndpoints.AUTH_BASE) // "/api/v1/auth"
public class AuthController {
    
    @PostMapping("/login") // POST /api/v1/auth/login
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }
    
    @PostMapping("/register") // POST /api/v1/auth/register
    public ApiResponse<UserDTO> register(@RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request));
    }
}
```

### 5. Using Cache Names

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    
    private final ProductRepository productRepository;
    
    @Cacheable(
        value = CacheNames.PRODUCTS,
        key = "#id",
        unless = "#result == null"
    )
    public Product findById(Long id) {
        log.info("Fetching product from database: {}", id);
        return productRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Product not found"));
    }
    
    @CachePut(
        value = CacheNames.PRODUCTS,
        key = "#result.id"
    )
    public Product update(Long id, ProductRequest request) {
        Product product = findById(id);
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        return productRepository.save(product);
    }
    
    @CacheEvict(
        value = CacheNames.PRODUCTS,
        key = "#id"
    )
    public void delete(Long id) {
        productRepository.deleteById(id);
    }
    
    @CacheEvict(
        value = CacheNames.PRODUCTS,
        allEntries = true
    )
    public void clearCache() {
        log.info("Clearing all product cache");
    }
}
```

### 6. Using Security Constants

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String token = extractTokenFromRequest(request);
        
        if (token != null && jwtService.validateToken(token)) {
            String userId = jwtService.getUserIdFromToken(token);
            // Set authentication
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader(SecurityConstants.AUTH_HEADER);
        
        if (header != null && header.startsWith(SecurityConstants.TOKEN_PREFIX)) {
            return header.substring(SecurityConstants.TOKEN_PREFIX.length());
        }
        
        return null;
    }
}

// JWT Service using Security Constants
@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(
            now.getTime() + SecurityConstants.TOKEN_EXPIRATION_MS
        );
        
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
}
```

### 7. Using Message Queue Names

```java
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {
    
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;
    
    public void publishOrderCreated(Order order) {
        OrderEvent event = OrderEvent.builder()
            .orderId(order.getId())
            .userId(order.getUserId())
            .status(OrderStatus.CREATED)
            .build();
        
        kafkaTemplate.send(MessageQueueNames.ORDER_EVENTS, event);
    }
    
    public void publishOrderConfirmed(String orderId) {
        OrderEvent event = OrderEvent.builder()
            .orderId(orderId)
            .status(OrderStatus.CONFIRMED)
            .build();
        
        kafkaTemplate.send(MessageQueueNames.ORDER_EVENTS, event);
    }
}

@Component
@Slf4j
public class OrderEventConsumer {
    
    @KafkaListener(topics = MessageQueueNames.ORDER_EVENTS, groupId = "inventory-service")
    public void handleOrderEvent(OrderEvent event) {
        log.info("Received order event: {}", event.getOrderId());
        // Process event
    }
}

@Component
@Slf4j
public class NotificationConsumer {
    
    @RabbitListener(queues = MessageQueueNames.NOTIFICATIONS)
    public void handleNotification(NotificationPayload notification) {
        log.info("Sending notification to user: {}", notification.getUserId());
        // Send email, push, SMS
    }
}
```

### 8. Using Validation Configuration

```java
@RestController
@RequestMapping(ApiEndpoints.PRODUCTS_BASE)
public class ProductController {
    
    // Validation automatically configured from common-config
    
    @PostMapping
    public ApiResponse<ProductDTO> createProduct(
        @RequestBody @Valid ProductRequest request // Validation triggered
    ) {
        return ApiResponse.success(productService.create(request));
    }
}

@Data
public class ProductRequest {
    
    @NotBlank(message = "Product name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "SKU must contain only uppercase letters, numbers, and hyphens")
    private String sku;
}
```

---

## Configuration

### Application Properties (application.yml)

```yaml
# YaniQ Common Configuration
yaniq:
  application:
    name: ${spring.application.name}
    version: 1.0.0
    description: YaniQ Microservice
    environment: ${ENVIRONMENT:development}
    debug-mode: false
    
    security:
      token-expiration-minutes: 60
      refresh-token-expiration-days: 30
      max-login-attempts: 5
      lockout-duration-minutes: 30
    
    pagination:
      default-page-size: 20
      max-page-size: 100
      default-sort-field: id
      default-sort-direction: ASC
    
    upload:
      max-file-size: 10485760  # 10MB
      max-request-size: 52428800  # 50MB
      allowed-file-types:
        - jpg
        - jpeg
        - png
        - pdf
        - doc
        - docx

# Spring Boot Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    tags:
      application: ${spring.application.name}
      environment: ${yaniq.application.environment}

# Retry Configuration
spring:
  retry:
    max-attempts: 3
    initial-interval: 1000
    multiplier: 2
    max-interval: 10000
```

### Using Configuration in Services

Each service can override or extend common-config:

```yaml
# product-service/src/main/resources/application.yml

spring:
  application:
    name: product-service

yaniq:
  application:
    description: Product Catalog Service
    
    # Override pagination for product service
    pagination:
      default-page-size: 50  # More products per page
      max-page-size: 200
    
    # Service-specific settings
    product:
      image-upload-path: /uploads/products
      thumbnail-size: 300x300
```

---

## Creating Custom Configuration

### Extend Common Config in Your Service

```java
@Configuration
@Import(RestTemplateConfig.class) // Import from common-config
public class ProductServiceConfig {
    
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
            .baseUrl("http://external-api.com")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }
    
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
            CacheNames.PRODUCTS,
            CacheNames.CATEGORIES,
            "product-search-results"
        );
    }
}
```

---

## Best Practices

### 1. Version Management

**DO:**
- ✅ Use semantic versioning for common-config
- ✅ Document breaking changes
- ✅ Test changes across all services
- ✅ Use dependency management in parent POM

**DON'T:**
- ❌ Make breaking changes without version bump
- ❌ Add service-specific config to common-config
- ❌ Remove constants without deprecation period

### 2. Configuration Organization

```java
// Good - Generic, reusable
public class ApiEndpoints {
    public static final String API_V1 = "/api/v1";
    public static final String USERS_BASE = API_V1 + "/users";
}

// Bad - Service-specific
public class ApiEndpoints {
    public static final String PRODUCT_IMAGES_PATH = "/var/uploads/products";
    public static final String PAYMENT_GATEWAY_URL = "https://stripe.com/api";
}
```

### 3. Property Hierarchy

```yaml
# common-config provides defaults
yaniq:
  application:
    pagination:
      default-page-size: 20

# Each service can override
# product-service/application.yml
yaniq:
  application:
    pagination:
      default-page-size: 50  # Override for this service
```

---

## Testing

### Testing with Common Config

```java
@SpringBootTest
@TestPropertySource(properties = {
    "yaniq.application.debug-mode=true",
    "yaniq.application.pagination.default-page-size=10"
})
class ProductServiceTest {
    
    @Autowired
    private ApplicationProperties appProperties;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Test
    void testConfigurationLoaded() {
        assertNotNull(appProperties);
        assertEquals(10, appProperties.getPagination().getDefaultPageSize());
    }
    
    @Test
    void testRestTemplateConfigured() {
        assertNotNull(restTemplate);
        // RestTemplate is auto-configured from common-config
    }
}
```

---

## Migration Guide

### Adding Common-Config to Existing Service

1. **Add Dependency**:
```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-config</artifactId>
    <version>1.0.0</version>
</dependency>
```

2. **Remove Duplicate Configurations**:
```java
// Remove your custom RestTemplateConfig
// Remove your custom RetryConfig
// Use common-config versions instead
```

3. **Update Constants**:
```java
// Before
private static final String ORDERS_API = "/api/v1/orders";

// After
import com.yaniq.common.config.constants.ApiEndpoints;
// Use ApiEndpoints.ORDERS_BASE
```

4. **Update Properties**:
```yaml
# Before
app:
  page-size: 20
  max-page-size: 100

# After - Use common properties
yaniq:
  application:
    pagination:
      default-page-size: 20
      max-page-size: 100
```

---

## Troubleshooting

### Configuration Not Loading

**Check:**
1. Dependency is added to pom.xml
2. Component scan includes common-config package
3. @EnableConfigurationProperties is present

```java
@SpringBootApplication
@ComponentScan(basePackages = {"com.yaniq"})
@EnableConfigurationProperties(ApplicationProperties.class)
public class YourServiceApplication {
    // ...
}
```

### Conflicts with Existing Config

**Solution**: Exclude conflicting beans
```java
@SpringBootApplication
@ComponentScan(
    basePackages = {"com.yaniq"},
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {ConflictingConfig.class}
    )
)
public class YourServiceApplication {
    // ...
}
```

---

## Version History

### Version 1.0.0 (Current)
- ✅ RestTemplate configuration
- ✅ Retry configuration
- ✅ Application properties
- ✅ API endpoint constants
- ✅ Cache name constants
- ✅ Security constants
- ✅ Message queue names
- ✅ Validation configuration
- ✅ Actuator configuration

### Planned Features (v1.1.0)
- ⏳ Circuit breaker configuration
- ⏳ Distributed tracing setup
- ⏳ Rate limiting configuration
- ⏳ API gateway integration

---

## Related Libraries

- [common-api](./common-api.md) - API response structures
- [common-exceptions](./common-exceptions.md) - Exception handling
- [common-security](./common-security.md) - Security configuration
- [common-messaging](./common-messaging.md) - Message broker setup

---

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0

---

**Last Updated:** October 19, 2025  
**Maintainer:** Danukaji Hansanath

