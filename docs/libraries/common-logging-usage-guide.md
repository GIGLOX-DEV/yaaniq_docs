# Common-Logging Library - Complete Usage Guide

## Overview

The `common-logging` library provides a flexible, strategy-based logging framework with support for multiple output destinations (Console, File, ELK), structured logging, AOP-based method logging, and asynchronous processing for high-performance applications.

---

## Version Information

- **Current Version:** `1.0.0`
- **Java Version:** `21`
- **Group ID:** `com.yaniq`
- **Artifact ID:** `common-logging`
- **Last Updated:** October 2025

---

## Why Use Common-Logging?

### 📊 **Flexible Logging Strategies**
- **Multiple Outputs**: Console, File, ELK Stack, Structured JSON
- **Runtime Switching**: Change logging strategy without code changes
- **Custom Strategies**: Implement your own logging destinations
- **Factory Pattern**: Easy strategy selection

### ⚡ **High Performance**
- **Asynchronous Processing**: Non-blocking log operations
- **Thread Pool Management**: Efficient resource utilization
- **Batch Processing**: Group logs for better throughput
- **Minimal Overhead**: Designed for production workloads

### 🎯 **AOP Integration**
- **Method-Level Logging**: Automatic entry/exit logging
- **@Loggable Annotation**: Declarative logging
- **@NoLogging Annotation**: Exclude specific methods
- **Aspect-Oriented**: No code pollution

### 🔍 **Structured Logging**
- **JSON Format**: Machine-readable logs
- **Contextual Information**: Include metadata automatically
- **ELK Stack Ready**: Perfect for Elasticsearch/Logstash/Kibana
- **Correlation IDs**: Track requests across services

---

## Installation

### Maven Dependency

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-logging</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `spring-boot-starter-aop` | 3.3.0 | AOP support |
| `logback-classic` | 1.5.19 | Logging implementation |
| `spring-context` | 6.2.7 | Spring framework |
| `spring-aspects` | Managed | Aspect support |

---

## Core Components

### 1. Logging Strategies

```
LogStrategy (Interface)
├── ConsoleLogStrategy - Log to console
├── FileLogStrategy - Log to files
├── ELKLogStrategy - Log to ELK Stack
├── StructuredLogStrategy - JSON structured logs
└── Custom strategies...
```

### 2. CommonLogger

Main logging interface with async processing.

### 3. LogStrategy Factory

Creates appropriate strategy based on configuration.

### 4. AOP Annotations
- `@Loggable` - Enable logging for methods
- `@NoLogging` - Disable logging for methods

---

## Usage Examples

### 1. Basic Logging

```java
@Service
@RequiredArgsConstructor
public class ProductService {
    
    private static final CommonLogger logger = CommonLogger.getLogger();
    
    public Product createProduct(ProductRequest request) {
        logger.info("Creating product: " + request.getName());
        
        try {
            Product product = productRepository.save(request.toEntity());
            logger.info("Product created successfully: " + product.getId());
            return product;
            
        } catch (Exception ex) {
            logger.error("Failed to create product", ex);
            throw ex;
        }
    }
    
    public void updateProductPrice(Long id, BigDecimal newPrice) {
        logger.debug("Updating product " + id + " price to " + newPrice);
        
        Product product = findById(id);
        product.setPrice(newPrice);
        productRepository.save(product);
        
        logger.info("Product price updated: " + id);
    }
}
```

### 2. Method-Level Logging with AOP

```java
@Service
public class OrderService {
    
    @Loggable  // Automatically logs method entry and exit
    public Order createOrder(OrderRequest request, String userId) {
        Order order = new Order();
        order.setUserId(userId);
        order.setItems(request.getItems());
        return orderRepository.save(order);
    }
    
    @Loggable
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = findById(orderId);
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
    
    @NoLogging  // Skip logging for this method
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
```

**Log Output:**
```
[INFO] Entering method: createOrder with params: [OrderRequest(...), user-123]
[INFO] Exiting method: createOrder with result: Order(id=456, status=PENDING)
[INFO] Entering method: updateOrderStatus with params: [456, CONFIRMED]
[INFO] Exiting method: updateOrderStatus with result: Order(id=456, status=CONFIRMED)
```

### 3. Structured Logging

```java
@Service
public class PaymentService {
    
    private static final CommonLogger logger = CommonLogger.getLogger();
    
    public PaymentResult processPayment(PaymentRequest request) {
        // Structured log with context
        Map<String, Object> context = Map.of(
            "orderId", request.getOrderId(),
            "amount", request.getAmount(),
            "currency", request.getCurrency(),
            "paymentMethod", request.getMethod()
        );
        
        logger.info("Processing payment: " + toJson(context));
        
        try {
            PaymentResult result = paymentGateway.charge(request);
            
            logger.info("Payment successful: " + toJson(Map.of(
                "transactionId", result.getTransactionId(),
                "status", result.getStatus()
            )));
            
            return result;
            
        } catch (PaymentException ex) {
            logger.error("Payment failed: " + toJson(context), ex);
            throw ex;
        }
    }
}
```

**JSON Output:**
```json
{
  "timestamp": "2025-10-19T10:30:00.000Z",
  "level": "INFO",
  "message": "Processing payment",
  "context": {
    "orderId": "ORD-123",
    "amount": 99.99,
    "currency": "USD",
    "paymentMethod": "CREDIT_CARD"
  },
  "service": "payment-service",
  "traceId": "abc-123-def"
}
```

### 4. Controller Logging

```java
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    
    private static final CommonLogger logger = CommonLogger.getLogger();
    private final ProductService productService;
    
    @GetMapping("/{id}")
    @Loggable
    public ApiResponse<ProductDTO> getProduct(
        @PathVariable Long id,
        @RequestHeader("X-Request-ID") String requestId
    ) {
        logger.info("Fetching product " + id + " [requestId: " + requestId + "]");
        
        ProductDTO product = productService.findById(id);
        
        logger.debug("Product found: " + product.getName());
        
        return ApiResponse.success(product);
    }
    
    @PostMapping
    @Loggable
    public ApiResponse<ProductDTO> createProduct(
        @RequestBody @Valid ProductRequest request
    ) {
        logger.info("Creating new product: " + request.getName());
        
        ProductDTO product = productService.create(request);
        
        logger.info("Product created: " + product.getId());
        
        return ApiResponse.success(product, "Product created successfully");
    }
}
```

### 5. Service-Level Logging Aspect

```java
@Aspect
@Component
@Slf4j
public class ServiceLoggingAspect {
    
    private static final CommonLogger logger = CommonLogger.getLogger();
    
    @Around("@annotation(com.yaniq.common_logging.aspect.Loggable)")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();
        
        logger.info("==> Entering: " + methodName + " with args: " + Arrays.toString(args));
        
        long startTime = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            
            long duration = System.currentTimeMillis() - startTime;
            logger.info("<== Exiting: " + methodName + " | Duration: " + duration + "ms");
            
            return result;
            
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            logger.error("<!> Exception in: " + methodName + " | Duration: " + duration + "ms", ex);
            throw ex;
        }
    }
}
```

---

## Configuration

### Logging Strategy Configuration

#### Console Strategy (Development)

```java
@Configuration
public class LoggingConfig {
    
    @Bean
    @Profile("dev")
    public LogStrategy logStrategy() {
        return LogStrategyFactory.createStrategy("console");
    }
}
```

#### File Strategy (Production)

```java
@Configuration
public class LoggingConfig {
    
    @Bean
    @Profile("prod")
    public LogStrategy logStrategy() {
        return LogStrategyFactory.createStrategy("file");
    }
}
```

#### Structured/ELK Strategy

```java
@Configuration
public class LoggingConfig {
    
    @Bean
    @Profile("prod")
    public LogStrategy logStrategy() {
        return LogStrategyFactory.createStrategy("elk");
    }
}
```

### Application Properties

```yaml
# application.yml

logging:
  level:
    root: INFO
    com.yaniq: DEBUG
  
  # File logging configuration
  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30
    total-size-cap: 1GB
  
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# Custom logging configuration
app:
  logging:
    strategy: structured  # console, file, elk, structured
    async:
      enabled: true
      core-pool-size: 5
      max-pool-size: 10
      queue-capacity: 1000
```

### Logback Configuration (logback-spring.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    
    <!-- Console Appender -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- File Appender -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/application-%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- JSON Structured Appender -->
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeMdcKeyName>traceId</includeMdcKeyName>
            <includeMdcKeyName>requestId</includeMdcKeyName>
        </encoder>
    </appender>
    
    <!-- Async Appender -->
    <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
        <queueSize>1000</queueSize>
        <appender-ref ref="FILE" />
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="ASYNC" />
    </root>
    
    <logger name="com.yaniq" level="DEBUG" />
    
</configuration>
```

---

## Advanced Features

### 1. Correlation ID / Request Tracking

```java
@Component
public class RequestTrackingFilter implements Filter {
    
    private static final CommonLogger logger = CommonLogger.getLogger();
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        String requestId = httpRequest.getHeader("X-Request-ID");
        if (requestId == null) {
            requestId = UUID.randomUUID().toString();
        }
        
        // Add to MDC for logging
        MDC.put("requestId", requestId);
        
        logger.info("Incoming request: " + httpRequest.getMethod() + " " + 
                   httpRequest.getRequestURI());
        
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

### 2. Performance Monitoring

```java
@Aspect
@Component
public class PerformanceLoggingAspect {
    
    private static final CommonLogger logger = CommonLogger.getLogger();
    
    @Around("execution(* com.yaniq..service..*(..))")
    public Object logPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        
        try {
            Object result = joinPoint.proceed();
            return result;
        } finally {
            stopWatch.stop();
            long executionTime = stopWatch.getTotalTimeMillis();
            
            if (executionTime > 1000) {
                logger.warn("SLOW METHOD: " + methodName + " took " + executionTime + "ms");
            } else {
                logger.debug(methodName + " executed in " + executionTime + "ms");
            }
        }
    }
}
```

### 3. Custom Log Strategy

```java
public class DatabaseLogStrategy implements LogStrategy {
    
    private final LogRepository logRepository;
    
    public DatabaseLogStrategy(LogRepository logRepository) {
        this.logRepository = logRepository;
    }
    
    @Override
    public void info(String message) {
        LogEntry entry = new LogEntry();
        entry.setLevel("INFO");
        entry.setMessage(message);
        entry.setTimestamp(LocalDateTime.now());
        logRepository.save(entry);
    }
    
    @Override
    public void warn(String message) {
        LogEntry entry = new LogEntry();
        entry.setLevel("WARN");
        entry.setMessage(message);
        entry.setTimestamp(LocalDateTime.now());
        logRepository.save(entry);
    }
    
    @Override
    public void error(String message, Throwable throwable) {
        LogEntry entry = new LogEntry();
        entry.setLevel("ERROR");
        entry.setMessage(message);
        entry.setStackTrace(getStackTrace(throwable));
        entry.setTimestamp(LocalDateTime.now());
        logRepository.save(entry);
    }
    
    @Override
    public void debug(String message) {
        // Skip debug in database to save space
    }
}
```

---

## Best Practices

### 1. Log Levels

```java
// DEBUG - Detailed information for debugging
logger.debug("User authentication details: " + authDetails);

// INFO - General information about application flow
logger.info("Order processed successfully: " + orderId);

// WARN - Warning about potential issues
logger.warn("Payment retry attempt 3 for order: " + orderId);

// ERROR - Error events that need attention
logger.error("Failed to process payment", exception);
```

### 2. What to Log

**DO Log:**
- ✅ Application startup/shutdown
- ✅ Configuration changes
- ✅ User actions (login, logout, important operations)
- ✅ External API calls (request/response)
- ✅ Business transactions
- ✅ Errors and exceptions
- ✅ Performance metrics (slow operations)

**DON'T Log:**
- ❌ Passwords or tokens
- ❌ Credit card numbers
- ❌ Personal identifiable information (PII)
- ❌ Excessive debug information in production
- ❌ Large payloads (summarize instead)

### 3. Structured Logging

```java
// Good - Structured
logger.info("order_created", Map.of(
    "orderId", order.getId(),
    "userId", order.getUserId(),
    "amount", order.getTotal(),
    "items", order.getItems().size()
));

// Bad - Unstructured
logger.info("Order " + order.getId() + " created by user " + order.getUserId() + 
           " for amount " + order.getTotal());
```

### 4. Exception Logging

```java
// Good - Include context
try {
    processPayment(request);
} catch (PaymentException ex) {
    logger.error("Payment processing failed for order: " + request.getOrderId() + 
                ", amount: " + request.getAmount(), ex);
    throw ex;
}

// Bad - No context
try {
    processPayment(request);
} catch (PaymentException ex) {
    logger.error("Error", ex);
    throw ex;
}
```

---

## Testing

### Unit Testing with Logging

```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    
    @Mock
    private ProductRepository productRepository;
    
    @InjectMocks
    private ProductService productService;
    
    @Test
    void testLoggingOnProductCreation() {
        // Given
        ProductRequest request = new ProductRequest("Test Product", 29.99);
        Product product = new Product(1L, "Test Product", 29.99);
        
        when(productRepository.save(any())).thenReturn(product);
        
        // When
        Product result = productService.createProduct(request);
        
        // Then
        assertNotNull(result);
        // Verify logging occurred (if using spy or custom logger)
    }
}
```

---

## Troubleshooting

### Logs Not Appearing

**Check:**
1. Log level configuration
2. Appender configuration
3. Logger name matches package
4. File permissions for file logging

### Performance Issues

**Solution:** Enable async logging:

```xml
<appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
    <queueSize>1000</queueSize>
    <discardingThreshold>0</discardingThreshold>
    <appender-ref ref="FILE" />
</appender>
```

---

## Version History

### Version 1.0.0 (Current)
- ✅ Multiple logging strategies
- ✅ AOP-based method logging
- ✅ Async processing
- ✅ Structured logging support
- ✅ @Loggable and @NoLogging annotations

### Planned Features (v1.1.0)
- ⏳ Distributed tracing integration
- ⏳ Log aggregation utilities
- ⏳ Real-time log streaming
- ⏳ Advanced filtering

---

## Related Libraries

- [common-audit](./common-audit.md) - Audit logging
- [common-exceptions](./common-exceptions.md) - Exception logging
- [common-api](./common-api.md) - API response logging

---

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0

---

**Last Updated:** October 19, 2025  
**Maintainer:** Danukaji Hansanath

