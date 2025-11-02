# Common Messaging Library v1.2.0 - Usage Guide

## Overview

The Common Messaging Library v1.2.0 provides comprehensive messaging infrastructure for the YaniQ microservices architecture. This version introduces maximum reusability with standardized message types, request types, routing configurations, and universal producers.

## Key Features

### 🎯 **Centralized Message Types**
- **67 predefined message types** covering all business domains
- **46 standardized request types** for inter-service communication
- **Comprehensive enums** for priorities, statuses, and routing

### 🔄 **Universal Routing System**
- **Consistent routing patterns** across all services
- **Automatic routing key generation** with `RoutingKeyBuilder`
- **Pattern matching support** for complex message routing

### 🏗️ **Enhanced Infrastructure**
- **Universal message producer** with convenience methods
- **Standardized message interfaces** and implementations
- **Automatic exchange/queue creation** with proper configuration

### 🔧 **Maximum Reusability**
- **Constants-based configuration** for all messaging infrastructure
- **Factory patterns** for easy service-specific customization
- **Backward compatibility** with existing implementations

## Quick Start

### 1. Add Dependency

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-messaging</artifactId>
    <version>1.2.0</version>
</dependency>
```

### 2. Basic Usage

```java
@Component
@RequiredArgsConstructor
public class MyService {
    
    private final UniversalMessageProducer messageProducer;
    
    // Send user event
    public void publishUserCreated(UserData userData) {
        messageProducer.sendUserEvent(
            RoutingKeyBuilder.ACTION_CREATED,
            RoutingKeyBuilder.STATUS_ACTIVE, 
            "my-service",
            userData
        );
    }
    
    // Send notification
    public void sendWelcomeEmail(String email, String content) {
        messageProducer.sendNotification(
            "email",
            "welcome", 
            "active",
            NotificationPayload.builder()
                .recipient(email)
                .content(content)
                .build()
        );
    }
}
```

### 3. Advanced Usage with StandardMessage

```java
@Service
public class OrderService {
    
    private final UniversalMessageProducer messageProducer;
    
    public void processOrder(Order order) {
        // Create a comprehensive message
        StandardMessage message = messageProducer.messageBuilder()
            .messageType(MessageType.ORDER_CREATED)
            .priority(MessagePriority.HIGH)
            .sourceService("order-service")
            .targetService("inventory-service")
            .payload(order)
            .expiresAt(Instant.now().plusMinutes(5))
            .maxRetries(5)
            .build();
            
        // Add custom metadata
        message.addMetadata("order_value", order.getTotalAmount());
        message.addMetadata("customer_tier", order.getCustomerTier());
        
        // Send the message
        messageProducer.sendMessage(MessagingConstants.ORDER_EVENTS_EXCHANGE, message);
    }
}
```

## Message Types Reference

### User-Related Messages
```java
MessageType.USER_CREATED          // "user.created"
MessageType.USER_UPDATED          // "user.updated" 
MessageType.USER_ACTIVATED        // "user.activated"
MessageType.AUTH_LOGIN            // "auth.login"
MessageType.AUTH_PASSWORD_RESET   // "auth.password.reset"
```

### Order-Related Messages
```java
MessageType.ORDER_CREATED         // "order.created"
MessageType.ORDER_CONFIRMED       // "order.confirmed"
MessageType.ORDER_SHIPPED         // "order.shipped"
MessageType.PAYMENT_COMPLETED     // "payment.completed"
```

### Notification Messages
```java
MessageType.NOTIFICATION_EMAIL    // "notification.email"
MessageType.NOTIFICATION_SMS      // "notification.sms" 
MessageType.NOTIFICATION_PUSH     // "notification.push"
```

## Request Types Reference

### User Management
```java
RequestType.CREATE_USER           // "create_user"
RequestType.UPDATE_USER          // "update_user"
RequestType.ACTIVATE_USER        // "activate_user"
RequestType.LOGIN                // "login"
```

### Order Management
```java
RequestType.CREATE_ORDER         // "create_order"
RequestType.PROCESS_PAYMENT      // "process_payment"
RequestType.CALCULATE_SHIPPING   // "calculate_shipping"
```

## Routing Key Patterns

### Standard Pattern
```
entity.action.status.service
```

### Examples
```
user.created.active.auth-service
order.confirmed.processing.order-service
notification.email.welcome.notification-service
payment.completed.success.payment-service
```

### Using RoutingKeyBuilder

```java
// Build specific routing keys
String userKey = RoutingKeyBuilder.buildUserEvent("created", "active", "auth-service");
String orderKey = RoutingKeyBuilder.buildOrderEvent("confirmed", "processing", "order-service");
String notifyKey = RoutingKeyBuilder.buildNotification("email", "welcome", "active");

// Build patterns for queue binding
String userPattern = RoutingKeyBuilder.buildPattern("user", "created");  // user.created.*.*
String allUsers = RoutingKeyBuilder.buildEntityPattern("user");          // user.#

// Parse routing keys
RoutingKeyBuilder.RoutingKeyComponents components = RoutingKeyBuilder.parse("user.created.active.auth-service");
// components.getEntity() -> "user"
// components.getAction() -> "created"
// components.getStatus() -> "active"
// components.getService() -> "auth-service"
```

## Exchange and Queue Configuration

### Pre-configured Exchanges
```java
// Event exchanges (TopicExchange)
MessagingConstants.USER_EVENTS_EXCHANGE          // "user.events.exchange"
MessagingConstants.ORDER_EVENTS_EXCHANGE         // "order.events.exchange"
MessagingConstants.NOTIFICATION_EVENTS_EXCHANGE  // "notification.events.exchange"

// Request exchanges (DirectExchange)  
MessagingConstants.USER_REQUEST_EXCHANGE         // "user.requests.exchange"
MessagingConstants.ORDER_REQUEST_EXCHANGE        // "order.requests.exchange"

// Response exchanges (DirectExchange)
MessagingConstants.USER_RESPONSE_EXCHANGE        // "user.responses.exchange"
MessagingConstants.ORDER_RESPONSE_EXCHANGE       // "order.responses.exchange"
```

### Pre-configured Queues
```java
// Notification queues
MessagingConstants.EMAIL_NOTIFICATIONS_QUEUE     // "email.notifications.queue"
MessagingConstants.SMS_NOTIFICATIONS_QUEUE       // "sms.notifications.queue"
MessagingConstants.PUSH_NOTIFICATIONS_QUEUE      // "push.notifications.queue"

// Analytics queues
MessagingConstants.USER_ANALYTICS_QUEUE          // "user.analytics.queue"
MessagingConstants.ORDER_ANALYTICS_QUEUE         // "order.analytics.queue"

// Audit queues
MessagingConstants.USER_AUDIT_QUEUE              // "user.audit.queue"
MessagingConstants.ORDER_AUDIT_QUEUE             // "order.audit.queue"
```

### Queue Binding Patterns
```java
// User events
MessagingConstants.USER_CREATED_PATTERN          // "user.created.*.*"
MessagingConstants.USER_ALL_PATTERN              // "user.*.*.*"

// Order events  
MessagingConstants.ORDER_CREATED_PATTERN         // "order.created.*.*"
MessagingConstants.ORDER_ALL_PATTERN             // "order.*.*.*"

// Notification patterns
MessagingConstants.NOTIFICATION_EMAIL_PATTERN    // "notification.email.*.*"
MessagingConstants.NOTIFICATION_ALL_PATTERN      // "notification.*.*.*"
```

## Message Priorities and TTL

### Priorities
```java
MessagePriority.LOW         // Level 1
MessagePriority.NORMAL      // Level 2 (default)
MessagePriority.HIGH        // Level 3
MessagePriority.CRITICAL    // Level 4
MessagePriority.EMERGENCY   // Level 5
```

### TTL Configuration
```java
MessagingConstants.DEFAULT_MESSAGE_TTL     // 5 minutes
MessagingConstants.NOTIFICATION_MESSAGE_TTL // 10 minutes
MessagingConstants.SYSTEM_MESSAGE_TTL      // 1 minute
MessagingConstants.ANALYTICS_MESSAGE_TTL   // 1 hour
MessagingConstants.AUDIT_MESSAGE_TTL       // 24 hours
```

### Retry Configuration
```java
MessagingConstants.DEFAULT_MAX_RETRIES     // 3
MessagingConstants.CRITICAL_MAX_RETRIES    // 5
MessagingConstants.NOTIFICATION_MAX_RETRIES // 2
MessagingConstants.SYSTEM_MAX_RETRIES      // 1
```

## Service Integration Examples

### Notification Service

```java
@Component
@RequiredArgsConstructor
public class NotificationEventHandler {
    
    private final UniversalMessageProducer producer;
    
    @RabbitListener(queues = MessagingConstants.USER_NOTIFICATIONS_QUEUE)
    public void handleUserEvent(UserEventPayload payload, Message message) {
        String routingKey = message.getMessageProperties().getReceivedRoutingKey();
        
        if (routingKey.contains("created")) {
            // Send welcome email
            producer.sendNotification("email", "welcome", "active", 
                buildWelcomeEmail(payload));
                
            // Send welcome SMS
            producer.sendNotification("sms", "welcome", "active",
                buildWelcomeSMS(payload));
        }
    }
}
```

### Auth Service Integration

```java
@Service
@RequiredArgsConstructor  
public class AuthEventPublisher {
    
    private final UniversalMessageProducer producer;
    
    public void publishUserRegistration(User user) {
        // Method 1: Using convenience method
        producer.sendUserEvent(
            RoutingKeyBuilder.ACTION_CREATED,
            RoutingKeyBuilder.STATUS_INACTIVE,
            RoutingKeyBuilder.SERVICE_AUTH,
            UserEventPayload.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .eventType(UserEventType.CREATED)
                .build()
        );
        
        // Method 2: Using StandardMessage for complex scenarios
        StandardMessage message = producer.messageBuilder()
            .messageType(MessageType.USER_CREATED)
            .priority(MessagePriority.HIGH)
            .sourceService("auth-service")
            .payload(buildUserEventPayload(user))
            .build();
            
        message.addMetadata("registration_source", "web");
        message.addMetadata("user_tier", "standard");
        
        producer.sendMessage(MessagingConstants.USER_EVENTS_EXCHANGE, message);
    }
}
```

### Order Service Integration

```java
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {
    
    private final UniversalMessageProducer producer;
    
    public void publishOrderCreated(Order order) {
        // Send to multiple destinations
        
        // 1. Analytics for reporting
        producer.sendOrderEvent(
            RoutingKeyBuilder.ACTION_CREATED,
            RoutingKeyBuilder.STATUS_PENDING,
            RoutingKeyBuilder.SERVICE_ORDER,
            OrderAnalyticsPayload.from(order)
        );
        
        // 2. Inventory for stock reservation
        producer.sendInventoryEvent(
            "reserve",
            RoutingKeyBuilder.STATUS_PENDING,
            RoutingKeyBuilder.SERVICE_ORDER,
            InventoryReservationPayload.from(order)
        );
        
        // 3. Notification for customer
        producer.sendNotification(
            "email",
            "order_confirmation",
            RoutingKeyBuilder.STATUS_ACTIVE,
            OrderConfirmationPayload.from(order)
        );
    }
}
```

## Request-Response Pattern

### Sending Requests

```java
@Service
@RequiredArgsConstructor
public class UserServiceClient {
    
    private final UniversalMessageProducer producer;
    private final InterServiceMessageClient messageClient;
    
    public void createUserProfile(CreateUserProfileRequest request) {
        BaseRequest baseRequest = producer.requestBuilder()
            .requestType(RequestType.CREATE_PROFILE)
            .sourceService("auth-service")
            .targetService("user-service")
            .payload(request)
            .timeout(Instant.now().plusSeconds(30))
            .build();
            
        baseRequest.addHeader("priority", "high");
        baseRequest.addMetadata("source", "registration_flow");
        
        producer.sendRequest(MessagingConstants.USER_REQUEST_EXCHANGE, baseRequest);
    }
}
```

### Handling Requests

```java
@Component
@RequiredArgsConstructor
public class UserRequestHandler {
    
    @RabbitListener(queues = MessagingConstants.USER_REQUESTS_QUEUE)
    public void handleUserRequest(BaseRequest request, Message message) {
        RequestType requestType = RequestType.fromString(
            (String) message.getMessageProperties().getHeaders().get(MessagingConstants.REQUEST_TYPE_HEADER)
        );
        
        switch (requestType) {
            case CREATE_PROFILE:
                handleCreateProfile(request);
                break;
            case UPDATE_PROFILE:
                handleUpdateProfile(request);
                break;
            // ... other cases
        }
    }
}
```

## Migration from v1.0.0

### Breaking Changes
- `EnhancedMessageProducer` is deprecated in favor of `UniversalMessageProducer`
- Custom routing key builders should migrate to `RoutingKeyBuilder`
- Exchange/queue names should use `MessagingConstants`

### Migration Steps

1. **Update dependency version**:
```xml
<version>1.2.0</version>
```

2. **Replace EnhancedMessageProducer**:
```java
// Old (v1.0.0)
@Autowired
private EnhancedMessageProducer<UserEventPayload> producer;

// New (v1.2.0)  
@Autowired
private UniversalMessageProducer producer;
```

3. **Update routing keys**:
```java
// Old (v1.0.0)
String routingKey = "user.created.inactive.authservice";

// New (v1.2.0)
String routingKey = RoutingKeyBuilder.buildUserEvent("created", "inactive", "auth-service");
```

4. **Use constants for exchanges**:
```java
// Old (v1.0.0)
String exchange = "user.events.exchange";

// New (v1.2.0)
String exchange = MessagingConstants.USER_EVENTS_EXCHANGE;
```

## Best Practices

### 1. Use Message Types
```java
// ✅ Good - Use predefined message types
StandardMessage message = StandardMessage.builder()
    .messageType(MessageType.USER_CREATED)
    .build();

// ❌ Avoid - Custom strings
message.setType("custom_user_event");
```

### 2. Leverage Routing Patterns
```java
// ✅ Good - Use RoutingKeyBuilder
String routingKey = RoutingKeyBuilder.buildUserEvent("created", "active", "auth-service");

// ❌ Avoid - Manual string building  
String routingKey = "user" + "." + "created" + "." + "active" + "." + "auth-service";
```

### 3. Use Constants
```java
// ✅ Good - Use constants
producer.sendMessage(MessagingConstants.USER_EVENTS_EXCHANGE, routingKey, payload);

// ❌ Avoid - Hard-coded strings
producer.sendMessage("user.events.exchange", routingKey, payload);
```

### 4. Set Appropriate Priorities
```java
// ✅ Good - Set priority based on urgency
if (isUrgent) {
    producer.sendCriticalMessage(exchange, routingKey, payload);
} else {
    producer.sendMessage(exchange, routingKey, payload);
}
```

### 5. Use Metadata for Context
```java
// ✅ Good - Add relevant metadata
StandardMessage message = producer.messageBuilder()
    .messageType(MessageType.ORDER_CREATED)
    .payload(order)
    .build();
    
message.addMetadata("order_value", order.getTotalAmount());
message.addMetadata("customer_tier", order.getCustomerTier());
message.addMetadata("source_channel", "mobile_app");
```

## Troubleshooting

### Common Issues

1. **Messages not routing**: Check routing key patterns and exchange bindings
2. **Messages expiring**: Adjust TTL values in MessagingConstants
3. **Dead letter queue filling**: Check consumer performance and retry logic
4. **Type conversion errors**: Ensure proper JSON serialization configuration

### Debugging

```java
// Enable detailed logging
logging.level.com.yaniq.common_messaging=DEBUG

// Check message headers
@RabbitListener(queues = "my.queue")
public void handleMessage(Object payload, Message message) {
    MessageProperties props = message.getMessageProperties();
    log.info("Routing key: {}", props.getReceivedRoutingKey());
    log.info("Headers: {}", props.getHeaders());
}
```

## Performance Considerations

1. **Use appropriate TTL** to prevent queue buildup
2. **Set max retries** to avoid infinite retry loops  
3. **Monitor dead letter queues** for failed messages
4. **Use message priorities** to ensure critical messages are processed first
5. **Batch analytics messages** to improve throughput

## Version History

- **v1.2.0**: Complete rewrite with universal messaging, 67 message types, routing builders, comprehensive constants
- **v1.0.0**: Initial version with basic EnhancedMessageProducer

---

The Common Messaging Library v1.2.0 provides a solid foundation for all messaging needs in the YaniQ microservices architecture, ensuring consistency, reliability, and maximum reusability across all services.
