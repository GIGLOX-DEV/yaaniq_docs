# Common-Exceptions Library - Complete Usage Guide

## Overview

The `common-exceptions` library provides a standardized exception hierarchy, global exception handling, and error catalog for consistent error handling across all YaniQ microservices. It integrates with the common-api library to return uniform error responses.

---

## Version Information

- **Current Version:** `1.0.0`
- **Java Version:** `21`
- **Group ID:** `com.yaniq`
- **Artifact ID:** `common-exceptions`
- **Last Updated:** October 2025

---

## Why Use Common-Exceptions?

### 🎯 **Consistent Error Handling**
- **Uniform Responses**: All services return errors in the same format
- **Better Client Experience**: Clients know exactly how to parse errors
- **Reduced Boilerplate**: No need to write exception handlers in every service
- **Centralized Logic**: Update error handling in one place

### 📊 **Better Debugging**
- **Structured Errors**: Machine-readable error codes
- **Context Information**: Include relevant details in exceptions
- **Stack Trace Management**: Control when to expose technical details
- **Error Tracking**: Easy integration with monitoring tools

### 🔒 **Security**
- **Information Hiding**: Don't expose internal implementation details
- **Sanitized Responses**: Remove sensitive data from error messages
- **Attack Prevention**: Prevent information disclosure attacks

### 📖 **Error Catalog**
- **Standardized Codes**: Predefined error codes for common scenarios
- **Documentation**: Self-documenting error types
- **I18N Support**: Easy internationalization of error messages

---

## Installation

### Maven Dependency

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-exceptions</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `common-api` | 1.0.0 | API response structures |
| `spring-web` | Managed by parent | Spring web support |
| `spring-webmvc` | Managed by parent | Spring MVC support |
| `jetbrains-annotations` | 26.0.2 | Nullable annotations |

---

## Core Components

### 1. Exception Hierarchy

```
ServiceExceptions (Base)
├── BadRequestException (400)
├── UnauthorizedException (401)
├── ForbiddenException (403)
│   └── PermissionDeniedException
├── NotFoundException (404)
│   └── RoleNotFoundException
├── DatabaseException (500)
├── ConfigException (500)
├── CacheException (500)
├── MessagingException (500)
├── TokenExpiredException (401)
├── InvalidCredentialsException (401)
└── UserNotActiveException (403)
```

### 2. GlobalExceptionHandler

Catches all exceptions and returns standardized `ApiResponse` objects.

### 3. ErrorCatalog

Pre-defined error codes and messages.

### 4. ExceptionFactory

Factory methods for creating exceptions with proper context.

---

## Usage Examples

### 1. Throwing Standard Exceptions

#### Not Found Exception

```java
@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    
    public ProductDTO findById(Long id) {
        return productRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new NotFoundException(
                "Product not found with ID: " + id
            ));
    }
    
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException(
                ErrorCatalog.PRODUCT_NOT_FOUND.getCode(),
                "Product with ID " + id + " does not exist"
            );
        }
        productRepository.deleteById(id);
    }
}
```

#### Bad Request Exception

```java
@Service
public class OrderService {
    
    public Order createOrder(OrderRequest request) {
        if (request.getItems().isEmpty()) {
            throw new BadRequestException(
                "Order must contain at least one item"
            );
        }
        
        if (request.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException(
                ErrorCatalog.INVALID_ORDER_AMOUNT.getCode(),
                "Order total must be greater than zero"
            );
        }
        
        return processOrder(request);
    }
}
```

#### Unauthorized Exception

```java
@Service
public class AuthService {
    
    public AuthenticationResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new InvalidCredentialsException(
                "Invalid email or password"
            ));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException(
                "Invalid email or password"
            );
        }
        
        if (!user.isActive()) {
            throw new UserNotActiveException(
                "User account is not active. Please verify your email."
            );
        }
        
        return generateAuthResponse(user);
    }
    
    public User validateToken(String token) {
        try {
            String userId = jwtService.extractUserId(token);
            return userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException(
                    "Invalid authentication token"
                ));
        } catch (JwtException ex) {
            throw new TokenExpiredException(
                "Authentication token has expired"
            );
        }
    }
}
```

#### Forbidden Exception

```java
@Service
public class AdminService {
    
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long userId, String adminId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new NotFoundException("Admin not found"));
        
        if (!admin.hasRole("SUPER_ADMIN") && user.hasRole("ADMIN")) {
            throw new PermissionDeniedException(
                "Only super admins can delete admin users"
            );
        }
        
        userRepository.delete(user);
    }
}
```

### 2. Database Exceptions

```java
@Service
public class ProductService {
    
    public Product save(Product product) {
        try {
            return productRepository.save(product);
        } catch (DataIntegrityViolationException ex) {
            throw new DatabaseException(
                "Failed to save product: duplicate SKU",
                ex
            );
        } catch (Exception ex) {
            throw new DatabaseException(
                "Database operation failed",
                ex
            );
        }
    }
}
```

### 3. Configuration Exceptions

```java
@Configuration
public class PaymentGatewayConfig {
    
    @Value("${payment.api.key:}")
    private String apiKey;
    
    @PostConstruct
    public void validateConfiguration() {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new ConfigException(
                "Payment API key is not configured. " +
                "Set payment.api.key in application properties."
            );
        }
    }
}
```

### 4. Messaging Exceptions

```java
@Service
public class NotificationService {
    
    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;
    
    public void sendNotification(NotificationEvent event) {
        try {
            kafkaTemplate.send("notifications", event.getUserId(), event)
                .get(5, TimeUnit.SECONDS);
        } catch (InterruptedException | ExecutionException | TimeoutException ex) {
            throw new MessagingException(
                "Failed to send notification to message broker",
                ex
            );
        }
    }
}
```

### 5. Custom Business Exceptions

```java
// Custom exception for your domain
public class InsufficientStockException extends ServiceExceptions {
    
    public InsufficientStockException(String productId, int requested, int available) {
        super(
            "INSUFFICIENT_STOCK",
            String.format(
                "Insufficient stock for product %s. Requested: %d, Available: %d",
                productId, requested, available
            ),
            HttpStatus.BAD_REQUEST.value()
        );
    }
}

// Usage
@Service
public class InventoryService {
    
    public void reserveStock(String productId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
            .orElseThrow(() -> new NotFoundException("Product not found in inventory"));
        
        if (inventory.getAvailableQuantity() < quantity) {
            throw new InsufficientStockException(
                productId,
                quantity,
                inventory.getAvailableQuantity()
            );
        }
        
        inventory.reserve(quantity);
        inventoryRepository.save(inventory);
    }
}
```

---

## Global Exception Handler

The `GlobalExceptionHandler` automatically catches exceptions and returns standardized responses:

### Automatic Exception Handling

```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> getProduct(@PathVariable Long id) {
        // If product not found, NotFoundException is thrown
        // GlobalExceptionHandler catches it and returns:
        // {
        //   "status": "ERROR",
        //   "errors": [{
        //     "code": "PRODUCT_NOT_FOUND",
        //     "message": "Product not found with ID: 123"
        //   }],
        //   "statusCode": 404
        // }
        return ApiResponse.success(productService.findById(id));
    }
}
```

### Validation Error Handling

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    @PostMapping
    public ApiResponse<UserDTO> createUser(@RequestBody @Valid UserRequest request) {
        // If validation fails, GlobalExceptionHandler returns:
        // {
        //   "status": "ERROR",
        //   "errors": [
        //     {"code": "VALIDATION_FAILED", "message": "email: must be a valid email"},
        //     {"code": "VALIDATION_FAILED", "message": "password: size must be between 8 and 50"}
        //   ],
        //   "statusCode": 400
        // }
        return ApiResponse.success(userService.create(request));
    }
}
```

---

## Error Catalog Usage

### Pre-defined Error Codes

```java
public class ErrorCatalog {
    
    // Resource Not Found
    public static final ErrorCode PRODUCT_NOT_FOUND = 
        new ErrorCode("PRODUCT_NOT_FOUND", "Product not found");
    
    public static final ErrorCode USER_NOT_FOUND = 
        new ErrorCode("USER_NOT_FOUND", "User not found");
    
    // Validation Errors
    public static final ErrorCode VALIDATION_FAILED = 
        new ErrorCode("VALIDATION_FAILED", "Validation failed");
    
    public static final ErrorCode INVALID_ORDER_AMOUNT = 
        new ErrorCode("INVALID_ORDER_AMOUNT", "Invalid order amount");
    
    // Authentication Errors
    public static final ErrorCode INVALID_CREDENTIALS = 
        new ErrorCode("INVALID_CREDENTIALS", "Invalid credentials");
    
    public static final ErrorCode TOKEN_EXPIRED = 
        new ErrorCode("TOKEN_EXPIRED", "Authentication token expired");
    
    // System Errors
    public static final ErrorCode INTERNAL_SERVER = 
        new ErrorCode("INTERNAL_SERVER_ERROR", "Internal server error");
    
    public static final ErrorCode DATABASE_ERROR = 
        new ErrorCode("DATABASE_ERROR", "Database operation failed");
}
```

### Using Error Catalog

```java
@Service
public class ProductService {
    
    public ProductDTO findById(Long id) {
        return productRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new NotFoundException(
                ErrorCatalog.PRODUCT_NOT_FOUND.getCode(),
                ErrorCatalog.PRODUCT_NOT_FOUND.getDefaultMessage() + ": " + id
            ));
    }
}
```

---

## Exception Factory Pattern

Create exceptions with consistent structure:

```java
public class ExceptionFactory {
    
    public static NotFoundException productNotFound(Long id) {
        return new NotFoundException(
            ErrorCatalog.PRODUCT_NOT_FOUND.getCode(),
            "Product with ID " + id + " not found"
        );
    }
    
    public static BadRequestException invalidOrderAmount(BigDecimal amount) {
        return new BadRequestException(
            ErrorCatalog.INVALID_ORDER_AMOUNT.getCode(),
            "Order amount " + amount + " is invalid. Must be greater than zero."
        );
    }
    
    public static UnauthorizedException invalidToken() {
        return new UnauthorizedException(
            ErrorCatalog.TOKEN_EXPIRED.getCode(),
            "Your session has expired. Please login again."
        );
    }
}

// Usage
@Service
public class ProductService {
    
    public ProductDTO findById(Long id) {
        return productRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> ExceptionFactory.productNotFound(id));
    }
}
```

---

## Advanced Usage

### 1. Custom Exception Handler

Extend the global handler for service-specific needs:

```java
@ControllerAdvice
public class CustomExceptionHandler extends GlobalExceptionHandler {
    
    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ApiResponse<Object>> handlePaymentException(
        PaymentException ex) {
        
        ApiError error = ApiError.of(
            "PAYMENT_FAILED",
            ex.getMessage(),
            List.of(
                "Transaction ID: " + ex.getTransactionId(),
                "Reason: " + ex.getReason()
            )
        );
        
        return ResponseEntity
            .status(HttpStatus.PAYMENT_REQUIRED)
            .body(ApiResponse.error(error));
    }
}
```

### 2. Exception with Additional Context

```java
public class OrderProcessingException extends ServiceExceptions {
    
    private final String orderId;
    private final String stage;
    private final Map<String, Object> context;
    
    public OrderProcessingException(
        String orderId, 
        String stage, 
        String message,
        Map<String, Object> context
    ) {
        super(
            "ORDER_PROCESSING_FAILED",
            String.format("Order %s failed at stage %s: %s", orderId, stage, message),
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        this.orderId = orderId;
        this.stage = stage;
        this.context = context;
    }
    
    // Getters for additional context
}
```

### 3. Exception Logging Aspect

```java
@Aspect
@Component
@Slf4j
public class ExceptionLoggingAspect {
    
    @AfterThrowing(
        pointcut = "execution(* com.yaniq..service..*(..))",
        throwing = "ex"
    )
    public void logServiceExceptions(JoinPoint joinPoint, Exception ex) {
        String methodName = joinPoint.getSignature().toShortString();
        
        if (ex instanceof ServiceExceptions) {
            ServiceExceptions serviceEx = (ServiceExceptions) ex;
            log.warn("Service exception in {}: [{}] {}", 
                methodName, 
                serviceEx.getErrorCode(), 
                serviceEx.getMessage()
            );
        } else {
            log.error("Unexpected exception in {}: {}", 
                methodName, 
                ex.getMessage(), 
                ex
            );
        }
    }
}
```

---

## Configuration

### Application Properties

```yaml
# Exception handling configuration
exception:
  include-stack-trace: false  # Set to true in dev, false in prod
  include-cause: false         # Include exception cause in response
  sanitize-messages: true      # Remove sensitive information
  
# Logging
logging:
  level:
    com.yaniq.common_exceptions: DEBUG
```

### Enable Global Exception Handler

```java
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.yaniq.your_service",
    "com.yaniq.commen_exceptions"  // Include exception handler package
})
public class YourServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(YourServiceApplication.class, args);
    }
}
```

---

## Best Practices

### 1. Exception Message Guidelines

**DO:**
- ✅ Include relevant context (IDs, names)
- ✅ Be specific about what went wrong
- ✅ Suggest how to fix the issue
- ✅ Use user-friendly language

```java
// Good
throw new NotFoundException(
    "Product with SKU 'ABC-123' not found. " +
    "Please check the SKU and try again."
);

// Bad
throw new NotFoundException("Not found");
```

**DON'T:**
- ❌ Expose internal implementation details
- ❌ Include sensitive information (passwords, tokens)
- ❌ Use technical jargon for user-facing messages
- ❌ Include SQL queries or stack traces in messages

### 2. HTTP Status Code Mapping

```java
// 400 Bad Request - Client error
throw new BadRequestException("Invalid input");

// 401 Unauthorized - Authentication required
throw new UnauthorizedException("Please login");

// 403 Forbidden - Authenticated but no permission
throw new ForbiddenException("Access denied");

// 404 Not Found - Resource doesn't exist
throw new NotFoundException("Resource not found");

// 500 Internal Server Error - Server error
throw new DatabaseException("Database error");
```

### 3. Exception Hierarchy

Create domain-specific exceptions extending `ServiceExceptions`:

```java
// Base exception for payment domain
public class PaymentException extends ServiceExceptions {
    protected PaymentException(String code, String message, int httpStatus) {
        super(code, message, httpStatus);
    }
}

// Specific payment exceptions
public class InsufficientFundsException extends PaymentException {
    public InsufficientFundsException(BigDecimal required, BigDecimal available) {
        super(
            "INSUFFICIENT_FUNDS",
            String.format("Required: $%.2f, Available: $%.2f", required, available),
            HttpStatus.PAYMENT_REQUIRED.value()
        );
    }
}

public class PaymentGatewayException extends PaymentException {
    public PaymentGatewayException(String gateway, String reason) {
        super(
            "PAYMENT_GATEWAY_ERROR",
            String.format("Payment gateway %s error: %s", gateway, reason),
            HttpStatus.BAD_GATEWAY.value()
        );
    }
}
```

---

## Testing

### Unit Testing Exceptions

```java
@Test
void testNotFoundExceptionThrown() {
    // Given
    Long nonExistentId = 999L;
    when(productRepository.findById(nonExistentId))
        .thenReturn(Optional.empty());
    
    // When & Then
    assertThrows(
        NotFoundException.class,
        () -> productService.findById(nonExistentId)
    );
}

@Test
void testExceptionMessageContent() {
    // When
    NotFoundException exception = assertThrows(
        NotFoundException.class,
        () -> productService.findById(999L)
    );
    
    // Then
    assertTrue(exception.getMessage().contains("999"));
    assertEquals("PRODUCT_NOT_FOUND", exception.getErrorCode());
    assertEquals(404, exception.getHttpStatus());
}
```

### Integration Testing Exception Handler

```java
@SpringBootTest
@AutoConfigureMockMvc
class ExceptionHandlerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testNotFoundExceptionReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/products/999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value("ERROR"))
            .andExpect(jsonPath("$.statusCode").value(404))
            .andExpect(jsonPath("$.errors[0].code").value("PRODUCT_NOT_FOUND"));
    }
    
    @Test
    void testValidationExceptionReturns400() throws Exception {
        String invalidRequest = """
            {
                "name": "",
                "price": -10
            }
            """;
        
        mockMvc.perform(post("/api/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors").isArray())
            .andExpect(jsonPath("$.errors", hasSize(greaterThan(0))));
    }
}
```

---

## Troubleshooting

### GlobalExceptionHandler Not Working

**Solution:** Ensure component scanning includes the exception handler package:

```java
@ComponentScan(basePackages = {
    "com.yaniq.your_service",
    "com.yaniq.commen_exceptions"
})
```

### Stack Traces in Production

**Solution:** Configure to hide stack traces:

```yaml
server:
  error:
    include-stacktrace: never
    include-message: always
```

---

## Version History

### Version 1.0.0 (Current)
- ✅ Standard exception hierarchy
- ✅ GlobalExceptionHandler with ApiResponse integration
- ✅ ErrorCatalog with predefined codes
- ✅ ExceptionFactory pattern
- ✅ 15+ built-in exception types

### Planned Features (v1.1.0)
- ⏳ I18N support for error messages
- ⏳ Error tracking integration (Sentry, Rollbar)
- ⏳ Custom error page rendering
- ⏳ Exception metrics and monitoring

---

## Related Libraries

- [common-api](./common-api.md) - API response structures
- [common-logging](./common-logging.md) - Exception logging
- [common-audit](./common-audit.md) - Audit exception events

---

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0

---

**Last Updated:** October 19, 2025  
**Maintainer:** Danukaji Hansanath

