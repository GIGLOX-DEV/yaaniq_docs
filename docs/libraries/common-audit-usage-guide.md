# Common-Audit Library - Complete Usage Guide

## Overview

The `common-audit` library provides a comprehensive auditing solution for tracking and logging user actions, system events, and business operations across all YaniQ microservices. It uses **Aspect-Oriented Programming (AOP)** to automatically capture method executions and store audit trails in a centralized database.

---

## Version Information

- **Current Version:** `1.0.0`
- **Java Version:** `21`
- **Group ID:** `com.yaniq`
- **Artifact ID:** `common-audit`
- **Last Updated:** October 2025

---

## Why Use Common-Audit?

### 🔍 1. **Compliance & Regulatory Requirements**
- **GDPR Compliance**: Track all data access and modifications
- **SOX Compliance**: Maintain audit trails for financial transactions
- **HIPAA/PCI-DSS**: Log sensitive data access for healthcare/payment systems
- **Legal Requirements**: Provide evidence for legal disputes or investigations

### 🛡️ 2. **Security & Forensics**
- **Security Incident Investigation**: Track unauthorized access attempts
- **Breach Detection**: Identify suspicious patterns of behavior
- **User Activity Monitoring**: Monitor who did what, when, and where
- **Fraud Prevention**: Detect anomalous user behavior

### 📊 3. **Business Intelligence**
- **User Behavior Analytics**: Understand how users interact with the system
- **Performance Monitoring**: Identify bottlenecks and slow operations
- **Usage Patterns**: Track feature adoption and usage statistics
- **Business Process Optimization**: Analyze workflow efficiency

### 🐛 4. **Debugging & Troubleshooting**
- **Error Tracking**: Trace the sequence of events leading to errors
- **Reproduction**: Recreate user actions that caused issues
- **Root Cause Analysis**: Identify the source of problems
- **Change History**: Track system state changes over time

### 👥 5. **Accountability & Transparency**
- **User Accountability**: Know who performed each action
- **Change Attribution**: Track who made specific changes
- **Dispute Resolution**: Provide evidence for disputed transactions
- **Trust Building**: Demonstrate transparency to stakeholders

### 📈 6. **Operational Excellence**
- **SLA Monitoring**: Track service level agreement compliance
- **Audit Reports**: Generate compliance reports automatically
- **Change Management**: Monitor system modifications
- **Quality Assurance**: Verify correct system behavior

---

## Installation

### Maven Dependency

Add the following dependency to your service's `pom.xml`:

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-audit</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Database Configuration

Add the audit_logs table to your database schema:

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

### Enable AOP in Your Application

Add to your main application class or configuration:

```java
@SpringBootApplication
@EnableAspectJAutoProxy
public class YourServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(YourServiceApplication.class, args);
    }
}
```

---

## Dependencies

The `common-audit` library has the following dependencies:

| Dependency | Version | Purpose |
|------------|---------|---------|
| `spring-boot-starter` | Managed by parent | Spring Boot core functionality |
| `lombok` | Managed by parent | Reduce boilerplate code |
| `aspectjweaver` | Managed by parent | AOP support for audit aspects |
| `spring-data-jpa` | Managed by parent | Database persistence |
| `jakarta.persistence-api` | Managed by parent | JPA annotations |

---

## Core Components

### 1. **AuditLog** (Entity)
JPA entity representing an audit log entry in the database.

```java
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    private Long id;              // Auto-generated ID
    private String action;        // Action performed (e.g., "createUser")
    private String userId;        // User who performed the action
    private LocalDateTime timestamp; // When the action occurred
    private String details;       // Additional details about the action
}
```

### 2. **AuditService** (Service)
Service class for logging audit actions.

```java
@Service
public class AuditService {
    public void logAction(String action, String userId, String details);
}
```

### 3. **@Auditable** (Annotation)
Annotation to mark methods that should be automatically audited.

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
}
```

### 4. **AuditAspect** (AOP Aspect)
Aspect that automatically logs method executions annotated with `@Auditable`.

### 5. **AuditLogRepository** (Repository)
JPA repository for database operations on audit logs.

---

## Usage Examples

### 1. **Basic Manual Auditing**

Use `AuditService` directly to log actions:

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

### 2. **Automatic Auditing with @Auditable Annotation**

Annotate methods to automatically log their execution:

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

### 3. **Auditing Critical Operations**

```java
@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final AuditService auditService;
    
    @Transactional
    public Payment processPayment(PaymentRequest request, String userId) {
        Payment payment = new Payment();
        payment.setAmount(request.getAmount());
        payment.setUserId(userId);
        payment.setStatus(PaymentStatus.PROCESSING);
        
        try {
            // Process payment with external gateway
            PaymentResult result = paymentGateway.charge(request);
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(result.getTransactionId());
            
            // Audit successful payment
            auditService.logAction(
                "PAYMENT_SUCCESS",
                userId,
                String.format("Payment processed: $%.2f, Transaction ID: %s", 
                    request.getAmount(), result.getTransactionId())
            );
            
        } catch (PaymentException e) {
            payment.setStatus(PaymentStatus.FAILED);
            
            // Audit failed payment
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

### 4. **Auditing Data Access**

```java
@Service
@RequiredArgsConstructor
public class CustomerDataService {
    
    private final CustomerRepository customerRepository;
    private final AuditService auditService;
    
    public Customer getCustomerData(Long customerId, String requestingUserId) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        // Audit sensitive data access (GDPR compliance)
        auditService.logAction(
            "ACCESS_CUSTOMER_DATA",
            requestingUserId,
            String.format("Accessed customer data for customer ID: %d", customerId)
        );
        
        return customer;
    }
    
    public void updateCustomerEmail(Long customerId, String newEmail, String userId) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        String oldEmail = customer.getEmail();
        customer.setEmail(newEmail);
        customerRepository.save(customer);
        
        // Audit PII change
        auditService.logAction(
            "UPDATE_CUSTOMER_EMAIL",
            userId,
            String.format("Changed email for customer %d from %s to %s", 
                customerId, oldEmail, newEmail)
        );
    }
}
```

### 5. **Auditing Security Events**

```java
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final AuditService auditService;
    private final UserRepository userRepository;
    
    public AuthenticationResponse login(LoginRequest request, String ipAddress) {
        try {
            User user = authenticateUser(request);
            
            // Audit successful login
            auditService.logAction(
                "LOGIN_SUCCESS",
                user.getEmail(),
                String.format("User logged in from IP: %s", ipAddress)
            );
            
            return new AuthenticationResponse(generateToken(user));
            
        } catch (BadCredentialsException e) {
            // Audit failed login attempt
            auditService.logAction(
                "LOGIN_FAILED",
                request.getEmail(),
                String.format("Failed login attempt from IP: %s, Reason: %s", 
                    ipAddress, e.getMessage())
            );
            
            throw e;
        }
    }
    
    public void logout(String userId, String sessionId) {
        // Audit logout
        auditService.logAction(
            "LOGOUT",
            userId,
            String.format("User logged out, Session ID: %s", sessionId)
        );
    }
    
    public void passwordChanged(String userId, String ipAddress) {
        // Audit password change
        auditService.logAction(
            "PASSWORD_CHANGED",
            userId,
            String.format("Password changed from IP: %s", ipAddress)
        );
    }
}
```

### 6. **Auditing Admin Actions**

```java
@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final AuditService auditService;
    
    @PreAuthorize("hasRole('ADMIN')")
    public void suspendUser(Long userId, String adminId, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setStatus(UserStatus.SUSPENDED);
        userRepository.save(user);
        
        // Audit admin action
        auditService.logAction(
            "ADMIN_SUSPEND_USER",
            adminId,
            String.format("Admin suspended user %s (ID: %d). Reason: %s", 
                user.getEmail(), userId, reason)
        );
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUserData(Long userId, String adminId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Audit data deletion (compliance)
        auditService.logAction(
            "ADMIN_DELETE_USER_DATA",
            adminId,
            String.format("Admin deleted all data for user %s (ID: %d)", 
                user.getEmail(), userId)
        );
        
        userRepository.delete(user);
    }
}
```

### 7. **Querying Audit Logs**

Create custom queries in your service:

```java
@Service
@RequiredArgsConstructor
public class AuditReportService {
    
    private final AuditLogRepository auditLogRepository;
    
    // Get all actions by a specific user
    public List<AuditLog> getUserActions(String userId) {
        return auditLogRepository.findByUserId(userId);
    }
    
    // Get all actions within a date range
    public List<AuditLog> getActionsInDateRange(
        LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByTimestampBetween(start, end);
    }
    
    // Get specific action types
    public List<AuditLog> getActionsByType(String action) {
        return auditLogRepository.findByAction(action);
    }
}
```

### 8. **Enhanced Repository with Custom Queries**

Extend the repository for more complex queries:

```java
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // Find by user
    List<AuditLog> findByUserId(String userId);
    
    // Find by action type
    List<AuditLog> findByAction(String action);
    
    // Find by date range
    List<AuditLog> findByTimestampBetween(
        LocalDateTime start, LocalDateTime end);
    
    // Find by user and action
    List<AuditLog> findByUserIdAndAction(String userId, String action);
    
    // Find by user within date range
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

---

## Advanced Usage

### 1. **Custom Audit Aspect with User Context**

Enhance the audit aspect to capture real user information:

```java
@Aspect
@Component
@RequiredArgsConstructor
public class EnhancedAuditAspect {
    
    private final AuditService auditService;
    
    @Around("@annotation(auditable)")
    public Object logAuditAction(ProceedingJoinPoint joinPoint, Auditable auditable) 
        throws Throwable {
        
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        // Get current user from SecurityContext
        String userId = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        
        // Get method arguments
        Object[] args = joinPoint.getArgs();
        String argsString = Arrays.toString(args);
        
        // Build detailed log
        String details = String.format(
            "Class: %s, Method: %s, Arguments: %s",
            className, methodName, argsString
        );
        
        try {
            // Execute the method
            Object result = joinPoint.proceed();
            
            // Log success
            auditService.logAction(
                methodName.toUpperCase(),
                userId,
                details + " - SUCCESS"
            );
            
            return result;
            
        } catch (Exception e) {
            // Log failure
            auditService.logAction(
                methodName.toUpperCase() + "_FAILED",
                userId,
                details + " - ERROR: " + e.getMessage()
            );
            
            throw e;
        }
    }
}
```

### 2. **Async Audit Logging**

For high-performance systems, log asynchronously:

```java
@Service
public class AsyncAuditService {
    
    private final AuditLogRepository auditLogRepository;
    
    @Async
    public CompletableFuture<Void> logActionAsync(
        String action, String userId, String details) {
        
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setUserId(userId);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLog.setDetails(details);
        
        auditLogRepository.save(auditLog);
        
        return CompletableFuture.completedFuture(null);
    }
}
```

Enable async processing in your config:

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

### 3. **Audit Event Publishing**

Use Spring Events for audit logging:

```java
// Audit Event
public class AuditEvent extends ApplicationEvent {
    private final String action;
    private final String userId;
    private final String details;
    
    public AuditEvent(Object source, String action, String userId, String details) {
        super(source);
        this.action = action;
        this.userId = userId;
        this.details = details;
    }
    
    // Getters
}

// Event Publisher
@Component
@RequiredArgsConstructor
public class AuditEventPublisher {
    
    private final ApplicationEventPublisher eventPublisher;
    
    public void publishAuditEvent(String action, String userId, String details) {
        AuditEvent event = new AuditEvent(this, action, userId, details);
        eventPublisher.publishEvent(event);
    }
}

// Event Listener
@Component
@RequiredArgsConstructor
public class AuditEventListener {
    
    private final AuditService auditService;
    
    @EventListener
    @Async
    public void handleAuditEvent(AuditEvent event) {
        auditService.logAction(
            event.getAction(),
            event.getUserId(),
            event.getDetails()
        );
    }
}
```

### 4. **Audit Report Generation**

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
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime start,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime end) {
        
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
    
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAuditLogs(
        @RequestParam @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime start,
        @RequestParam @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime end) {
        
        List<AuditLog> logs = auditLogRepository.findByTimestampBetween(start, end);
        
        // Convert to CSV
        String csv = convertToCSV(logs);
        byte[] bytes = csv.getBytes();
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit-logs.csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(bytes);
    }
}
```

---

## Best Practices

### 1. **What to Audit**

**DO Audit:**
- ✅ User authentication (login, logout, failed attempts)
- ✅ Authorization changes (role changes, permission grants)
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
- ❌ System internal operations

### 2. **Audit Log Content**

Include:
- **Who**: User ID or system component
- **What**: Action performed
- **When**: Precise timestamp
- **Where**: IP address, location, service name
- **Why**: Business reason (if applicable)
- **How**: Method, API endpoint
- **Result**: Success/failure status

### 3. **Performance Considerations**

- Use **async logging** for high-throughput operations
- Index database columns (userId, timestamp, action)
- Archive old logs to separate storage
- Consider log aggregation services for scaling
- Batch insert audit logs when possible

### 4. **Security**

- Restrict access to audit logs (admin only)
- Ensure audit logs are tamper-proof
- Encrypt sensitive details in audit logs
- Never log passwords or tokens
- Implement log retention policies

### 5. **Compliance**

- Define retention periods per regulation
- Implement automated archival
- Ensure logs are immutable
- Regular audit log reviews
- Document audit procedures

---

## Configuration

### Application Properties

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
        dialect: org.hibernate.dialect.PostgreSQLDialect
        jdbc:
          batch_size: 20
        order_inserts: true

# Async executor configuration
spring:
  task:
    execution:
      pool:
        core-size: 5
        max-size: 10
        queue-capacity: 100
      thread-name-prefix: audit-

# Audit specific configuration
audit:
  enabled: true
  async: true
  retention-days: 365
  archive-enabled: true
```

---

## Real-World Use Cases

### 1. **E-Commerce Order Tracking**

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final AuditService auditService;
    
    public Order createOrder(OrderRequest request, String userId) {
        Order order = // create order
        
        auditService.logAction(
            "ORDER_CREATED",
            userId,
            String.format("Order #%s created, Total: $%.2f, Items: %d",
                order.getId(), order.getTotal(), order.getItems().size())
        );
        
        return order;
    }
    
    public void updateOrderStatus(Long orderId, OrderStatus newStatus, String userId) {
        // update status
        
        auditService.logAction(
            "ORDER_STATUS_CHANGED",
            userId,
            String.format("Order #%d status changed to %s", orderId, newStatus)
        );
    }
}
```

### 2. **Healthcare Data Access (HIPAA)**

```java
@Service
@RequiredArgsConstructor
public class PatientRecordService {
    
    private final AuditService auditService;
    
    public PatientRecord getPatientRecord(Long patientId, String doctorId) {
        PatientRecord record = // fetch record
        
        // HIPAA compliance: Log all PHI access
        auditService.logAction(
            "ACCESS_PATIENT_RECORD",
            doctorId,
            String.format("Doctor accessed patient record #%d", patientId)
        );
        
        return record;
    }
}
```

### 3. **Banking Transactions (SOX Compliance)**

```java
@Service
@RequiredArgsConstructor
public class TransactionService {
    
    private final AuditService auditService;
    
    @Transactional
    public Transaction transferFunds(TransferRequest request, String userId) {
        // Perform transfer
        Transaction transaction = // execute transfer
        
        // SOX compliance: Audit all financial transactions
        auditService.logAction(
            "FUND_TRANSFER",
            userId,
            String.format("Transfer $%.2f from account %s to %s, Transaction ID: %s",
                request.getAmount(), request.getFromAccount(), 
                request.getToAccount(), transaction.getId())
        );
        
        return transaction;
    }
}
```

---

## Troubleshooting

### Issue 1: Audit Logs Not Being Created

**Cause**: AOP not enabled or aspect not scanning packages

**Solution**:
```java
@SpringBootApplication
@EnableAspectJAutoProxy
@ComponentScan(basePackages = {"com.yaniq"})
public class Application {
    // ...
}
```

### Issue 2: Performance Degradation

**Cause**: Synchronous audit logging blocking operations

**Solution**: Enable async logging
```java
@Async
public void logAction(String action, String userId, String details) {
    // logging logic
}
```

### Issue 3: Large Audit Table

**Cause**: No archival strategy

**Solution**: Implement scheduled archival
```java
@Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
public void archiveOldLogs() {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(90);
    List<AuditLog> oldLogs = repository.findByTimestampBefore(cutoff);
    // Archive to cold storage
    // Delete from primary table
}
```

---

## Testing

### Unit Test Example

```java
@SpringBootTest
class AuditServiceTest {
    
    @Autowired
    private AuditService auditService;
    
    @Autowired
    private AuditLogRepository repository;
    
    @Test
    void testLogAction() {
        // Given
        String action = "TEST_ACTION";
        String userId = "test-user";
        String details = "Test details";
        
        // When
        auditService.logAction(action, userId, details);
        
        // Then
        List<AuditLog> logs = repository.findByAction(action);
        assertFalse(logs.isEmpty());
        assertEquals(userId, logs.get(0).getUserId());
    }
}
```

---

## Version History

### Version 1.0.0 (Current)
- ✅ Basic audit logging functionality
- ✅ AOP-based automatic auditing
- ✅ JPA entity and repository
- ✅ Manual audit service
- ✅ @Auditable annotation support

### Planned Features (v1.1.0)
- ⏳ Enhanced audit context (IP address, user agent)
- ⏳ Audit log encryption
- ⏳ Built-in retention policies
- ⏳ Audit dashboard and reporting
- ⏳ Elasticsearch integration for log search

---

## Related Libraries

- [common-security](./common-security.md) - For user context and authentication
- [common-logging](./common-logging.md) - For application logging
- [common-exceptions](./common-exceptions.md) - For error handling

---

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0

---

**Last Updated:** October 19, 2025  
**Maintainer:** Danukaji Hansanath

