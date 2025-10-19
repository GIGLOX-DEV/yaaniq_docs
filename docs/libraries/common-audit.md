# common-audit

The `common-audit` library provides a comprehensive auditing solution for tracking and logging user actions, system events, and business operations across all YaniQ microservices using **Aspect-Oriented Programming (AOP)**.

## Version & Dependencies

- **Version:** 1.0.0
- **Java:** 21
- **Group ID:** com.yaniq
- **Artifact ID:** common-audit

### Dependencies
- Spring Boot Starter
- Lombok (provided scope)
- AspectJ Weaver (for AOP)
- Spring Data JPA
- Jakarta Persistence API

## Why Use Common-Audit?

### 🔍 Compliance & Regulatory Requirements
- **GDPR Compliance**: Track all data access and modifications
- **SOX Compliance**: Maintain audit trails for financial transactions
- **HIPAA/PCI-DSS**: Log sensitive data access
- **Legal Requirements**: Provide evidence for disputes or investigations

### 🛡️ Security & Forensics
- **Security Incident Investigation**: Track unauthorized access attempts
- **Breach Detection**: Identify suspicious behavior patterns
- **User Activity Monitoring**: Monitor who did what, when, and where
- **Fraud Prevention**: Detect anomalous user behavior

### 📊 Business Intelligence
- **User Behavior Analytics**: Understand system interactions
- **Performance Monitoring**: Identify bottlenecks
- **Usage Patterns**: Track feature adoption
- **Process Optimization**: Analyze workflow efficiency

### 🐛 Debugging & Troubleshooting
- **Error Tracking**: Trace event sequences leading to errors
- **Issue Reproduction**: Recreate problematic user actions
- **Root Cause Analysis**: Identify problem sources
- **Change History**: Track system state changes

## Installation

Add to your service's `pom.xml`:

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-audit</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Database Setup

Create the audit_logs table:

```sql
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    details TEXT NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action)
);
```

### Enable AOP

Add to your main application class:

```java
@SpringBootApplication
@EnableAspectJAutoProxy
public class YourServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(YourServiceApplication.class, args);
    }
}
```

## Core Components

### 1. AuditLog (Entity)
JPA entity representing audit log entries:

```java
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    private Long id;              // Auto-generated ID
    private String action;        // Action performed
    private String userId;        // User who performed action
    private LocalDateTime timestamp; // When action occurred
    private String details;       // Additional details
}
```

### 2. AuditService
Service for manual audit logging:

```java
@Service
public class AuditService {
    public void logAction(String action, String userId, String details);
}
```

### 3. @Auditable Annotation
Mark methods for automatic auditing:

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
}
```

### 4. AuditAspect
AOP aspect that automatically logs `@Auditable` method executions.

### 5. AuditLogRepository
JPA repository for database operations:

```java
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(String userId);
    List<AuditLog> findByAction(String action);
    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
```

## Quick Start

### Manual Auditing

```java
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    private final AuditService auditService;
    
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
        @RequestBody ProductRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        
        ProductDTO product = productService.create(request);
        
        // Manual audit logging
        auditService.logAction(
            "CREATE_PRODUCT",
            userDetails.getUsername(),
            "Created product: " + product.getName() + " (ID: " + product.getId() + ")"
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }
}
```

### Automatic Auditing with @Auditable

```java
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    @Auditable
    public User createUser(UserRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        return userRepository.save(user);
    }
    
    @Auditable
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
    
    @Auditable
    public User updateUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }
}
```

## Common Use Cases

### 1. Security Events

```java
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final AuditService auditService;
    
    public AuthenticationResponse login(LoginRequest request, String ipAddress) {
        try {
            User user = authenticateUser(request);
            
            auditService.logAction(
                "LOGIN_SUCCESS",
                user.getEmail(),
                String.format("User logged in from IP: %s", ipAddress)
            );
            
            return new AuthenticationResponse(generateToken(user));
            
        } catch (BadCredentialsException e) {
            auditService.logAction(
                "LOGIN_FAILED",
                request.getEmail(),
                String.format("Failed login from IP: %s", ipAddress)
            );
            throw e;
        }
    }
}
```

### 2. Data Access (GDPR Compliance)

```java
@Service
@RequiredArgsConstructor
public class CustomerDataService {
    
    private final CustomerRepository customerRepository;
    private final AuditService auditService;
    
    public Customer getCustomerData(Long customerId, String requestingUserId) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        // Audit sensitive data access
        auditService.logAction(
            "ACCESS_CUSTOMER_DATA",
            requestingUserId,
            String.format("Accessed customer data for ID: %d", customerId)
        );
        
        return customer;
    }
}
```

### 3. Financial Transactions

```java
@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final AuditService auditService;
    
    @Transactional
    public Payment processPayment(PaymentRequest request, String userId) {
        Payment payment = new Payment();
        
        try {
            PaymentResult result = paymentGateway.charge(request);
            payment.setStatus(PaymentStatus.COMPLETED);
            
            auditService.logAction(
                "PAYMENT_SUCCESS",
                userId,
                String.format("Payment processed: $%.2f, Txn: %s", 
                    request.getAmount(), result.getTransactionId())
            );
            
        } catch (PaymentException e) {
            payment.setStatus(PaymentStatus.FAILED);
            
            auditService.logAction(
                "PAYMENT_FAILED",
                userId,
                String.format("Payment failed: $%.2f, Reason: %s", 
                    request.getAmount(), e.getMessage())
            );
            throw e;
        }
        
        return paymentRepository.save(payment);
    }
}
```

### 4. Admin Actions

```java
@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final AuditService auditService;
    
    @PreAuthorize("hasRole('ADMIN')")
    public void suspendUser(Long userId, String adminId, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setStatus(UserStatus.SUSPENDED);
        userRepository.save(user);
        
        auditService.logAction(
            "ADMIN_SUSPEND_USER",
            adminId,
            String.format("Admin suspended user %s (ID: %d). Reason: %s", 
                user.getEmail(), userId, reason)
        );
    }
}
```

## Extended Repository

Add custom query methods:

```java
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // Find by user
    List<AuditLog> findByUserId(String userId);
    
    // Find by action type
    List<AuditLog> findByAction(String action);
    
    // Find by date range
    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    
    // Find by user and action
    List<AuditLog> findByUserIdAndAction(String userId, String action);
    
    // Custom query: User actions in date range
    @Query("SELECT a FROM AuditLog a WHERE a.userId = :userId " +
           "AND a.timestamp BETWEEN :start AND :end")
    List<AuditLog> findUserActionsByDateRange(
        @Param("userId") String userId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end);
    
    // Count actions by user
    Long countByUserId(String userId);
    
    // Find failed login attempts
    @Query("SELECT a FROM AuditLog a WHERE a.action = 'LOGIN_FAILED' " +
           "AND a.userId = :userId AND a.timestamp > :since")
    List<AuditLog> findFailedLoginAttempts(
        @Param("userId") String userId,
        @Param("since") LocalDateTime since);
}
```

## Audit Reporting

Create an admin endpoint for audit reports:

```java
@RestController
@RequestMapping("/api/v1/admin/audit-reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AuditReportController {
    
    private final AuditLogRepository auditLogRepository;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getUserAuditTrail(
        @PathVariable String userId,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) 
            LocalDateTime start,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) 
            LocalDateTime end) {
        
        List<AuditLog> logs;
        if (start != null && end != null) {
            logs = auditLogRepository.findUserActionsByDateRange(userId, start, end);
        } else {
            logs = auditLogRepository.findByUserId(userId);
        }
        
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLog>> getActionReport(@PathVariable String action) {
        List<AuditLog> logs = auditLogRepository.findByAction(action);
        return ResponseEntity.ok(logs);
    }
}
```

## Best Practices

### What to Audit

**DO Audit:**
- ✅ User authentication (login, logout, failed attempts)
- ✅ Authorization changes (role changes, permissions)
- ✅ Data modifications (create, update, delete)
- ✅ Sensitive data access (PII, financial data)
- ✅ Administrative actions
- ✅ Security events (password changes, account locks)
- ✅ Financial transactions
- ✅ Configuration changes
- ✅ Data exports

**DON'T Audit:**
- ❌ Read-only GET requests for public data
- ❌ Health check endpoints
- ❌ Static resource requests
- ❌ High-frequency polling operations

### Audit Log Content

Include:
- **Who**: User ID or system component
- **What**: Action performed
- **When**: Precise timestamp
- **Where**: IP address, service name
- **Result**: Success/failure status

### Performance Tips

- Use **async logging** for high-throughput operations
- Index database columns (userId, timestamp, action)
- Archive old logs to separate storage
- Consider log aggregation services for scaling
- Batch insert audit logs when possible

### Security

- Restrict access to audit logs (admin only)
- Ensure audit logs are tamper-proof
- Encrypt sensitive details
- Never log passwords or tokens
- Implement log retention policies

## Advanced Features

### Async Audit Logging

```java
@Service
public class AsyncAuditService {
    
    private final AuditLogRepository repository;
    
    @Async
    public CompletableFuture<Void> logActionAsync(
        String action, String userId, String details) {
        
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setUserId(userId);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLog.setDetails(details);
        
        repository.save(auditLog);
        return CompletableFuture.completedFuture(null);
    }
}
```

Enable async in configuration:

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("audit-async-");
        executor.initialize();
        return executor;
    }
}
```

## Configuration

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/yaniq_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        jdbc:
          batch_size: 20

# Async executor
spring:
  task:
    execution:
      pool:
        core-size: 5
        max-size: 10
        queue-capacity: 100

# Audit configuration
audit:
  enabled: true
  async: true
  retention-days: 365
```

## Troubleshooting

### Audit Logs Not Being Created

**Solution**: Enable AOP in your application
```java
@SpringBootApplication
@EnableAspectJAutoProxy
public class Application {
    // ...
}
```

### Performance Issues

**Solution**: Enable async logging
```java
@Async
public void logAction(String action, String userId, String details) {
    // logging logic
}
```

### Large Audit Table

**Solution**: Implement scheduled archival
```java
@Scheduled(cron = "0 0 2 * * ?") // 2 AM daily
public void archiveOldLogs() {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(90);
    // Archive and cleanup
}
```

## Documentation

For complete usage guide with advanced examples, see:
- **[Common-Audit Usage Guide](./common-audit-usage-guide.md)** - Comprehensive documentation with all features

## Related Libraries

- [common-security](./common-security.md) - User context and authentication
- [common-logging](./common-logging.md) - Application logging
- [common-exceptions](./common-exceptions.md) - Error handling

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0

