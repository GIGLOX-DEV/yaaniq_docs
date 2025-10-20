# Common-Message Library - API Documentation

## Overview

The `common-messaging` library provides a unified, production-ready abstraction layer for asynchronous messaging with **Kafka** and **RabbitMQ** support. It enables seamless inter-service communication across the YaniQ microservices ecosystem with advanced features including message routing, partitioning, batch processing, and event-driven architecture support.

---

## Version Information

| Property | Value |
|----------|-------|
| **Current Version** | `1.1.0` |
| **Previous Version** | `1.0.0` |
| **Release Date** | October 2025 |
| **Java Version** | `21+` |
| **Group ID** | `com.yaniq` |
| **Artifact ID** | `common-messaging` |
| **License** | MIT |

### Version 1.1.0 Changelog

#### 🆕 New Features
- Enhanced message producer with custom headers support
- Message event dispatcher with annotation-based handlers
- Inter-service messaging service for common patterns
- Improved partition key and routing key management
- Correlation ID tracking across services

#### 🔧 Improvements
- Better error handling and retry mechanisms
- Performance optimizations for batch processing
- Enhanced documentation and examples
- Improved type safety with generics

#### 🐛 Bug Fixes
- Fixed message header propagation issues
- Resolved partition key serialization problems
- Corrected concurrent handler registration

---

## Why Use Common-Messaging?

### 🔄 **Broker Agnostic Architecture**
- **Multi-Protocol Support**: Seamless Kafka and RabbitMQ integration
- **Zero Lock-in**: Switch message brokers without code changes
- **Unified API**: Consistent interface regardless of underlying broker
- **Easy Migration**: Transparent broker transitions

### 📨 **Advanced Messaging Patterns**
- **Point-to-Point**: Direct service-to-service communication
- **Publish-Subscribe**: Broadcast events to multiple consumers
- **Request-Reply**: Synchronous-style messaging over async channels
- **Event Sourcing**: Full event history and replay capabilities

### ⚡ **High Performance & Scalability**
- **Async by Default**: Non-blocking message processing
- **Batch Operations**: Process multiple messages efficiently
- **Parallel Processing**: Concurrent message handling
- **Partitioning**: Horizontal scalability with Kafka partitions
- **Routing**: Intelligent message routing with RabbitMQ

### 📦 **Production-Ready Features**
- **Pre-defined Payloads**: Type-safe event models
- **Correlation Tracking**: End-to-end request tracing
- **Header Management**: Custom metadata propagation
- **Error Handling**: Robust retry and dead-letter queues
- **Monitoring**: Built-in metrics and observability

---

## Installation

### Maven Dependency

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-messaging</artifactId>
    <version>1.1.0</version>
</dependency>
```

### Gradle Dependency

```gradle
implementation 'com.yaniq:common-messaging:1.1.0'
```

---

## Architecture

### Component Hierarchy

```
common-messaging (v1.1.0)
│
├── Producer Layer
│   ├── MessageProducer (Interface)
│   ├── StreamBridgeMessageProducer
│   └── EnhancedMessageProducer ⭐ (Recommended)
│
├── Consumer Layer
│   ├── Function-based Consumers
│   └── Annotation-based Handlers
│
├── Service Layer
│   └── InterServiceMessagingService
│
├── Handler Layer
│   ├── MessageEventHandler (Annotation)
│   └── MessageEventDispatcher
│
└── Payload Models
    ├── OrderEventPayload
    ├── PaymentEventPayload
    ├── UserEventPayload
    ├── NotificationPayload
    └── Custom Payloads
```

---

## Core Components

### 1. Message Producers

#### MessageProducer Interface
```java
public interface MessageProducer<T> {
    void send(String destination, T payload);
}
```

#### EnhancedMessageProducer (v1.1.0)
Advanced producer with headers, routing keys, and partition keys support.

**Key Methods:**
- `send(destination, payload)` - Basic send
- `sendWithHeaders(destination, payload, headers)` - Custom headers
- `sendWithRoutingKey(destination, payload, routingKey)` - RabbitMQ routing
- `sendWithPartitionKey(destination, payload, partitionKey)` - Kafka partitioning
- `sendWithAll(destination, payload, headers, routingKey, partitionKey)` - Full control

### 2. Service Layer

#### InterServiceMessagingService
High-level service for common messaging patterns between microservices.

**Key Methods:**
- `sendNotificationViaKafka(notification)` - Kafka-based notifications
- `sendOrderEventToInventory(order, action)` - RabbitMQ order events
- `sendUserEventViaKafka(user, eventType)` - User lifecycle events
- `sendPaymentEventToBilling(payment, status)` - Payment processing
- `sendAnalyticsEvent(data, userId)` - Analytics tracking
- `sendAuditLog(audit, entityType, entityId)` - Audit logging

### 3. Event Handlers

#### @MessageEventHandler Annotation
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MessageEventHandler {
    String eventType();
    int priority() default 0;
}
```

#### MessageEventDispatcher
Automatically discovers and invokes annotated handler methods across all services.

### 4. Event Payloads

#### Pre-defined Payload Models

| Payload Class | Purpose | Key Fields |
|---------------|---------|------------|
| `OrderEventPayload` | Order lifecycle events | orderId, customerId, status, items |
| `PaymentEventPayload` | Payment transactions | paymentId, orderId, amount, method |
| `UserEventPayload` | User account events | userId, eventType, email, status |
| `NotificationPayload` | System notifications | title, content, recipientId, type |

### 5. Enumerations

| Enum | Values |
|------|--------|
| `OrderStatus` | CREATED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED |
| `PaymentStatus` | PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED |
| `PaymentMethod` | CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER |
| `NotificationType` | INFO, WARNING, ERROR, SUCCESS |
| `UserEventType` | CREATED, UPDATED, DELETED, ACTIVATED, DEACTIVATED |
| `UserStatus` | ACTIVE, INACTIVE, SUSPENDED |

---

## Configuration

### Application Properties (Kafka)

```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          brokers: localhost:9092
          auto-create-topics: true
        bindings:
          notification-events-out:
            producer:
              configuration:
                key.serializer: org.apache.kafka.common.serialization.StringSerializer
                value.serializer: org.springframework.kafka.support.serializer.JsonSerializer
      bindings:
        notification-events-out:
          destination: notification-events
          content-type: application/json
```

### Application Properties (RabbitMQ)

```yaml
spring:
  cloud:
    stream:
      rabbit:
        binder:
          connection-name-prefix: yaniq
        bindings:
          inventory-events-out:
            producer:
              routing-key-expression: headers['routingKey']
      bindings:
        inventory-events-out:
          destination: inventory-exchange
          content-type: application/json
```

---

## API Reference

### EnhancedMessageProducer API

#### Constructor
```java
public EnhancedMessageProducer(StreamBridge streamBridge)
```

#### Methods

##### send()
```java
void send(String destination, T payload)
```
**Description**: Sends a simple message to the specified destination.

**Parameters**:
- `destination` - Topic name (Kafka) or Exchange name (RabbitMQ)
- `payload` - Message payload (any serializable object)

**Example**:
```java
messageProducer.send("user-events", userPayload);
```

---

##### sendWithHeaders()
```java
void sendWithHeaders(String destination, T payload, Map<String, Object> headers)
```
**Description**: Sends a message with custom headers for metadata propagation.

**Parameters**:
- `destination` - Target destination
- `payload` - Message payload
- `headers` - Custom headers (correlation-id, trace-id, etc.)

**Use Cases**:
- Request tracing
- Metadata propagation
- Custom routing logic

**Example**:
```java
Map<String, Object> headers = Map.of(
    "correlation-id", UUID.randomUUID().toString(),
    "service", "order-service",
    "timestamp", Instant.now().toString()
);
messageProducer.sendWithHeaders("order-events", orderPayload, headers);
```

---

##### sendWithRoutingKey()
```java
void sendWithRoutingKey(String destination, T payload, String routingKey)
```
**Description**: Sends a message with a routing key for RabbitMQ topic/direct exchanges.

**Parameters**:
- `destination` - Exchange name
- `payload` - Message payload
- `routingKey` - Routing pattern (e.g., "order.created", "payment.completed")

**Use Cases**:
- RabbitMQ topic exchanges
- Conditional routing
- Queue binding patterns

**Example**:
```java
messageProducer.sendWithRoutingKey(
    "payment-exchange", 
    paymentPayload, 
    "payment.success"
);
```

---

##### sendWithPartitionKey()
```java
void sendWithPartitionKey(String destination, T payload, String partitionKey)
```
**Description**: Sends a message with a partition key for Kafka topic partitioning.

**Parameters**:
- `destination` - Kafka topic name
- `payload` - Message payload
- `partitionKey` - Partition key (ensures ordering per key)

**Use Cases**:
- Kafka partitioning
- Message ordering per entity
- Load distribution

**Example**:
```java
messageProducer.sendWithPartitionKey(
    "user-events", 
    userPayload, 
    userId.toString()
);
```

---

##### sendWithAll()
```java
void sendWithAll(String destination, T payload, Map<String, Object> headers, 
                 String routingKey, String partitionKey)
```
**Description**: Sends a message with all advanced features combined.

**Parameters**:
- `destination` - Target destination
- `payload` - Message payload
- `headers` - Custom headers (nullable)
- `routingKey` - RabbitMQ routing key (nullable)
- `partitionKey` - Kafka partition key (nullable)

**Use Cases**:
- Complex routing scenarios
- Multi-broker compatibility
- Full message control

**Example**:
```java
Map<String, Object> headers = Map.of(
    "priority", "high",
    "retry-count", 0
);

messageProducer.sendWithAll(
    "critical-events",
    criticalPayload,
    headers,
    "critical.alert",
    "system-1"
);
```

---

### InterServiceMessagingService API

#### sendNotificationViaKafka()
```java
void sendNotificationViaKafka(NotificationPayload notification)
```
**Description**: Sends notification events via Kafka with automatic partitioning by recipient.

**Features**:
- Automatic partition key assignment (recipientId)
- Correlation ID tracking
- Timestamping
- Service identification

---

#### sendOrderEventToInventory()
```java
void sendOrderEventToInventory(Object orderPayload, String action)
```
**Description**: Sends order events to inventory service via RabbitMQ with routing keys.

**Parameters**:
- `orderPayload` - Order event data
- `action` - Action type ("created", "cancelled", "updated")

**Routing Key Pattern**: `order.{action}`

---

#### sendUserEventViaKafka()
```java
void sendUserEventViaKafka(Object userPayload, String eventType)
```
**Description**: Broadcasts user events to multiple services (fanout pattern).

**Use Cases**:
- User registration
- Profile updates
- Account status changes

---

#### sendPaymentEventToBilling()
```java
void sendPaymentEventToBilling(Object paymentPayload, String paymentStatus)
```
**Description**: Sends payment events to billing service with status-based routing.

**Routing Key Pattern**: `payment.{status}`

---

#### sendAnalyticsEvent()
```java
void sendAnalyticsEvent(Object analyticsPayload, String userId)
```
**Description**: Sends analytics events partitioned by user ID for aggregation.

---

#### sendAuditLog()
```java
void sendAuditLog(Object auditPayload, String entityType, String entityId)
```
**Description**: Sends audit logs with entity-based partitioning.

**Partition Key Pattern**: `{entityType}:{entityId}`

---

### MessageEventDispatcher API

#### dispatch()
```java
void dispatch(String eventType, Object payload)
```
**Description**: Dispatches event to all registered handlers.

**Parameters**:
- `eventType` - Event type identifier
- `payload` - Event payload

---

#### dispatch() (Extended)
```java
void dispatch(String eventType, Object payload, String correlationId, String sourceService)
```
**Description**: Dispatches event with correlation tracking.

**Parameters**:
- `eventType` - Event type identifier
- `payload` - Event payload
- `correlationId` - Request correlation ID
- `sourceService` - Source service name

---

## Usage Examples

### Example 1: Simple Message Publishing (Basic)

**Scenario**: Send a basic notification message.

```java
import com.yaniq.common_messaging.producer.EnhancedMessageProducer;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    
    private final EnhancedMessageProducer<String> messageProducer;
    
    public NotificationService(EnhancedMessageProducer<String> messageProducer) {
        this.messageProducer = messageProducer;
    }
    
    public void sendSimpleNotification(String message) {
        // Simple send to Kafka topic or RabbitMQ exchange
        messageProducer.send("notifications", message);
    }
}
```

**Output**: Message sent to `notifications` destination.

---

### Example 2: Publishing with Headers (Intermediate)

**Scenario**: Send an order event with tracing headers.

```java
import com.yaniq.common_messaging.producer.EnhancedMessageProducer;
import com.yaniq.common_messaging.payloads.OrderEventPayload;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {
    
    private final EnhancedMessageProducer<OrderEventPayload> messageProducer;
    
    public OrderService(EnhancedMessageProducer<OrderEventPayload> messageProducer) {
        this.messageProducer = messageProducer;
    }
    
    public void publishOrderCreated(OrderEventPayload order) {
        // Create custom headers for tracing and metadata
        Map<String, Object> headers = new HashMap<>();
        headers.put("correlation-id", UUID.randomUUID().toString());
        headers.put("service", "order-service");
        headers.put("event-type", "order-created");
        headers.put("timestamp", Instant.now().toString());
        headers.put("version", "1.1.0");
        
        // Send with headers
        messageProducer.sendWithHeaders("order-events", order, headers);
        
        System.out.println("Order created event published with tracking headers");
    }
}
```

**Benefits**:
- Request tracing across services
- Event versioning
- Service identification
- Timestamp tracking

---

### Example 3: RabbitMQ Routing (Intermediate)

**Scenario**: Route payment events based on status using RabbitMQ topic exchange.

```java
import com.yaniq.common_messaging.producer.EnhancedMessageProducer;
import com.yaniq.common_messaging.payloads.PaymentEventPayload;
import com.yaniq.common_messaging.payloads.enums.PaymentStatus;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    
    private final EnhancedMessageProducer<PaymentEventPayload> messageProducer;
    
    public PaymentService(EnhancedMessageProducer<PaymentEventPayload> messageProducer) {
        this.messageProducer = messageProducer;
    }
    
    public void publishPaymentEvent(PaymentEventPayload payment) {
        String routingKey = buildRoutingKey(payment.getStatus());
        
        // Send to RabbitMQ exchange with routing key
        messageProducer.sendWithRoutingKey(
            "payment-exchange",
            payment,
            routingKey
        );
        
        System.out.println("Payment routed with key: " + routingKey);
    }
    
    private String buildRoutingKey(PaymentStatus status) {
        // payment.completed, payment.failed, payment.pending
        return "payment." + status.name().toLowerCase();
    }
}
```

**Queue Bindings**:
- `billing-queue` → `payment.completed`
- `retry-queue` → `payment.failed`
- `processing-queue` → `payment.pending`

---

### Example 4: Kafka Partitioning (Intermediate)

**Scenario**: Partition user events by user ID to maintain ordering.

```java
import com.yaniq.common_messaging.producer.EnhancedMessageProducer;
import com.yaniq.common_messaging.payloads.UserEventPayload;
import com.yaniq.common_messaging.payloads.enums.UserEventType;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class UserService {
    
    private final EnhancedMessageProducer<UserEventPayload> messageProducer;
    
    public UserService(EnhancedMessageProducer<UserEventPayload> messageProducer) {
        this.messageProducer = messageProducer;
    }
    
    public void publishUserEvent(UUID userId, UserEventType eventType, String email) {
        // Build user event payload
        UserEventPayload userEvent = UserEventPayload.builder()
            .userId(userId)
            .eventType(eventType)
            .email(email)
            .eventTimestamp(Instant.now())
            .sourceService("user-service")
            .build();
        
        // Partition by userId to ensure all events for same user go to same partition
        // This maintains ordering for user-specific events
        messageProducer.sendWithPartitionKey(
            "user-events",
            userEvent,
            userId.toString()
        );
        
        System.out.println("User event published to partition for user: " + userId);
    }
}
```

**Benefits**:
- Event ordering per user
- Parallel processing across users
- Scalable event processing

---

### Example 5: Complete Message with All Features (Advanced)

**Scenario**: Send critical order event with full tracing, routing, and partitioning.

```java
import com.yaniq.common_messaging.producer.EnhancedMessageProducer;
import com.yaniq.common_messaging.payloads.OrderEventPayload;
import com.yaniq.common_messaging.payloads.enums.OrderStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AdvancedOrderService {
    
    private final EnhancedMessageProducer<OrderEventPayload> messageProducer;
    
    public AdvancedOrderService(EnhancedMessageProducer<OrderEventPayload> messageProducer) {
        this.messageProducer = messageProducer;
    }
    
    public void publishCriticalOrder(UUID orderId, UUID customerId, BigDecimal amount) {
        // Build comprehensive order payload
        OrderEventPayload order = OrderEventPayload.builder()
            .orderId(orderId)
            .customerId(customerId)
            .status(OrderStatus.CREATED)
            .totalAmount(amount)
            .currency("USD")
            .createdAt(Instant.now())
            .build();
        
        // Prepare custom headers for tracing and metadata
        Map<String, Object> headers = new HashMap<>();
        headers.put("correlation-id", UUID.randomUUID().toString());
        headers.put("trace-id", UUID.randomUUID().toString());
        headers.put("service", "order-service");
        headers.put("event-type", "order-created");
        headers.put("priority", "high");
        headers.put("timestamp", Instant.now().toString());
        headers.put("version", "1.1.0");
        headers.put("environment", "production");
        
        // RabbitMQ routing key for conditional routing
        String routingKey = "order.high-value.created";
        
        // Kafka partition key for customer-based partitioning
        String partitionKey = customerId.toString();
        
        // Send with all features enabled
        messageProducer.sendWithAll(
            "order-events",      // Destination (topic/exchange)
            order,               // Payload
            headers,             // Custom headers
            routingKey,          // RabbitMQ routing
            partitionKey         // Kafka partitioning
        );
        
        System.out.println("Critical order published:");
        System.out.println("  - Order ID: " + orderId);
        System.out.println("  - Routing Key: " + routingKey);
        System.out.println("  - Partition Key: " + customerId);
        System.out.println("  - Headers: " + headers.size());
    }
}
```

**Features Demonstrated**:
- ✅ Complete payload construction
- ✅ Distributed tracing headers
- ✅ RabbitMQ topic routing
- ✅ Kafka customer partitioning
- ✅ Priority handling
- ✅ Version tracking

---

### Example 6: Using InterServiceMessagingService (High-Level)

**Scenario**: Use high-level service for common messaging patterns.

```java
import com.yaniq.common_messaging.service.InterServiceMessagingService;
import com.yaniq.common_messaging.payloads.NotificationPayload;
import com.yaniq.common_messaging.payloads.enums.NotificationType;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class UserRegistrationService {
    
    private final InterServiceMessagingService messagingService;
    
    public UserRegistrationService(InterServiceMessagingService messagingService) {
        this.messagingService = messagingService;
    }
    
    public void registerUser(String email, String firstName, String lastName) {
        UUID userId = UUID.randomUUID();
        
        // 1. Send analytics event (Kafka partitioned by user)
        Map<String, Object> analyticsData = new HashMap<>();
        analyticsData.put("event", "user-registered");
        analyticsData.put("email", email);
        analyticsData.put("timestamp", Instant.now());
        
        messagingService.sendAnalyticsEvent(analyticsData, userId.toString());
        
        // 2. Send welcome notification (Kafka partitioned by recipient)
        NotificationPayload welcomeNotification = NotificationPayload.builder()
            .title("Welcome to YaniQ!")
            .content("Thank you for registering, " + firstName + "!")
            .type(NotificationType.INFO)
            .recipientId(userId.toString())
            .recipientType("USER")
            .email(email)
            .firstName(firstName)
            .lastName(lastName)
            .sourceService("user-service")
            .eventType("user-registered")
            .correlationId(UUID.randomUUID())
            .build();
        
        messagingService.sendNotificationViaKafka(welcomeNotification);
        
        // 3. Send audit log (Kafka partitioned by entity)
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("action", "CREATE");
        auditData.put("entity", "User");
        auditData.put("entityId", userId.toString());
        auditData.put("userId", userId.toString());
        auditData.put("timestamp", Instant.now());
        auditData.put("changes", Map.of("email", email, "status", "ACTIVE"));
        
        messagingService.sendAuditLog(auditData, "User", userId.toString());
        
        System.out.println("User registration events published successfully");
    }
}
```

**Benefits**:
- Pre-configured messaging patterns
- Automatic header management
- Consistent correlation tracking
- Reduced boilerplate code

---

### Example 7: Event Handler with @MessageEventHandler (Advanced)

**Scenario**: Create annotation-based event handlers for incoming messages.

```java
import com.yaniq.common_messaging.handler.MessageEventHandler;
import com.yaniq.common_messaging.payloads.OrderEventPayload;
import com.yaniq.common_messaging.payloads.PaymentEventPayload;
import com.yaniq.common_messaging.payloads.enums.OrderStatus;
import org.springframework.stereotype.Component;

@Component
public class InventoryEventHandlers {
    
    /**
     * Handle order created events with high priority
     */
    @MessageEventHandler(eventType = "ORDER_CREATED", priority = 10)
    public void handleOrderCreated(OrderEventPayload order) {
        System.out.println("Processing order creation: " + order.getOrderId());
        
        // Reserve inventory for order items
        order.getItems().forEach(item -> {
            System.out.println("Reserving stock for product: " + item.getProductId());
            System.out.println("Quantity: " + item.getQuantity());
            // Business logic here
        });
    }
    
    /**
     * Handle order cancelled events
     */
    @MessageEventHandler(eventType = "ORDER_CANCELLED", priority = 5)
    public void handleOrderCancelled(OrderEventPayload order) {
        System.out.println("Processing order cancellation: " + order.getOrderId());
        
        // Release reserved inventory
        order.getItems().forEach(item -> {
            System.out.println("Releasing stock for product: " + item.getProductId());
            // Business logic here
        });
    }
    
    /**
     * Handle payment completed events
     */
    @MessageEventHandler(eventType = "PAYMENT_COMPLETED", priority = 8)
    public void handlePaymentCompleted(PaymentEventPayload payment) {
        System.out.println("Payment completed for order: " + payment.getOrderId());
        
        // Confirm inventory reservation
        System.out.println("Confirming inventory reservation");
        // Business logic here
    }
    
    /**
     * Handle payment failed events with lower priority
     */
    @MessageEventHandler(eventType = "PAYMENT_FAILED", priority = 3)
    public void handlePaymentFailed(PaymentEventPayload payment) {
        System.out.println("Payment failed for order: " + payment.getOrderId());
        
        // Release inventory back to available stock
        System.out.println("Releasing inventory due to payment failure");
        // Business logic here
    }
}
```

**Features**:
- Automatic handler discovery
- Priority-based execution
- Type-safe event handling
- Decoupled event processing

---

### Example 8: Spring Cloud Function Consumer (Advanced)

**Scenario**: Create functional consumers for processing messages.

```java
import com.yaniq.common_messaging.payloads.NotificationPayload;
import com.yaniq.common_messaging.payloads.OrderEventPayload;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;

import java.util.function.Consumer;

@Configuration
public class MessageConsumers {
    
    /**
     * Kafka consumer for notification events
     */
    @Bean
    public Consumer<NotificationPayload> notificationConsumer() {
        return notification -> {
            System.out.println("=== Notification Received ===");
            System.out.println("Title: " + notification.getTitle());
            System.out.println("Recipient: " + notification.getRecipientId());
            System.out.println("Type: " + notification.getType());
            
            // Process notification (send email, SMS, push notification, etc.)
            sendNotification(notification);
        };
    }
    
    /**
     * RabbitMQ consumer for order events with message headers
     */
    @Bean
    public Consumer<Message<OrderEventPayload>> orderEventConsumer() {
        return message -> {
            OrderEventPayload order = message.getPayload();
            
            System.out.println("=== Order Event Received ===");
            System.out.println("Order ID: " + order.getOrderId());
            System.out.println("Status: " + order.getStatus());
            
            // Access headers
            String correlationId = (String) message.getHeaders().get("correlation-id");
            String eventType = (String) message.getHeaders().get("event-type");
            
            System.out.println("Correlation ID: " + correlationId);
            System.out.println("Event Type: " + eventType);
            
            // Process order event
            processOrderEvent(order, eventType);
        };
    }
    
    /**
     * Batch consumer for processing multiple messages together
     */
    @Bean
    public Consumer<java.util.List<OrderEventPayload>> batchOrderConsumer() {
        return orders -> {
            System.out.println("=== Batch Processing " + orders.size() + " Orders ===");
            
            orders.forEach(order -> {
                System.out.println("Processing order: " + order.getOrderId());
                // Batch processing logic
            });
            
            System.out.println("Batch processing completed");
        };
    }
    
    private void sendNotification(NotificationPayload notification) {
        // Implementation
    }
    
    private void processOrderEvent(OrderEventPayload order, String eventType) {
        // Implementation
    }
}
```

**Configuration**:
```yaml
spring:
  cloud:
    function:
      definition: notificationConsumer;orderEventConsumer;batchOrderConsumer
    stream:
      bindings:
        notificationConsumer-in-0:
          destination: notification-events
          group: notification-service
        orderEventConsumer-in-0:
          destination: order-events
          group: order-processor
        batchOrderConsumer-in-0:
          destination: order-events-batch
          group: batch-processor
          consumer:
            batch-mode: true
```

---

### Example 9: Complete E-Commerce Order Flow (Complex)

**Scenario**: Orchestrate a complete order flow with multiple services and message types.

```java
import com.yaniq.common_messaging.producer.EnhancedMessageProducer;
import com.yaniq.common_messaging.service.InterServiceMessagingService;
import com.yaniq.common_messaging.payloads.*;
import com.yaniq.common_messaging.payloads.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
public class OrderOrchestrationService {
    
    private final EnhancedMessageProducer<Object> messageProducer;
    private final InterServiceMessagingService messagingService;
    
    public OrderOrchestrationService(
            EnhancedMessageProducer<Object> messageProducer,
            InterServiceMessagingService messagingService) {
        this.messageProducer = messageProducer;
        this.messagingService = messagingService;
    }
    
    @Transactional
    public void processNewOrder(UUID customerId, List<OrderItem> items) {
        String correlationId = UUID.randomUUID().toString();
        UUID orderId = UUID.randomUUID();
        
        // Step 1: Create order event payload
        OrderEventPayload orderPayload = buildOrderPayload(orderId, customerId, items);
        
        // Step 2: Publish order created event to multiple services
        publishOrderCreatedEvent(orderPayload, correlationId);
        
        // Step 3: Send inventory check request
        checkInventoryAvailability(orderPayload, correlationId);
        
        // Step 4: Send notification to customer
        notifyCustomerOrderReceived(customerId, orderId, correlationId);
        
        // Step 5: Send analytics event
        trackOrderAnalytics(orderPayload, correlationId);
        
        // Step 6: Create audit log
        auditOrderCreation(orderPayload, correlationId);
        
        System.out.println("Order orchestration completed for: " + orderId);
        System.out.println("Correlation ID: " + correlationId);
    }
    
    private OrderEventPayload buildOrderPayload(UUID orderId, UUID customerId, 
                                                 List<OrderItem> items) {
        BigDecimal totalAmount = items.stream()
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return OrderEventPayload.builder()
            .orderId(orderId)
            .customerId(customerId)
            .status(OrderStatus.CREATED)
            .totalAmount(totalAmount)
            .currency("USD")
            .items(items)
            .createdAt(Instant.now())
            .build();
    }
    
    private void publishOrderCreatedEvent(OrderEventPayload order, String correlationId) {
        Map<String, Object> headers = new HashMap<>();
        headers.put("correlation-id", correlationId);
        headers.put("service", "order-service");
        headers.put("event-type", "order-created");
        headers.put("timestamp", Instant.now().toString());
        headers.put("priority", "high");
        
        // Publish to Kafka partitioned by customer
        messageProducer.sendWithAll(
            "order-events",
            order,
            headers,
            null, // No routing key for Kafka
            order.getCustomerId().toString() // Partition by customer
        );
        
        System.out.println("✓ Order created event published");
    }
    
    private void checkInventoryAvailability(OrderEventPayload order, String correlationId) {
        Map<String, Object> inventoryCheck = new HashMap<>();
        inventoryCheck.put("orderId", order.getOrderId());
        inventoryCheck.put("items", order.getItems());
        inventoryCheck.put("correlationId", correlationId);
        
        // Send to inventory service via RabbitMQ with routing key
        messagingService.sendOrderEventToInventory(inventoryCheck, "check");
        
        System.out.println("✓ Inventory check requested");
    }
    
    private void notifyCustomerOrderReceived(UUID customerId, UUID orderId, 
                                             String correlationId) {
        NotificationPayload notification = NotificationPayload.builder()
            .title("Order Received")
            .content("Your order #" + orderId + " has been received and is being processed.")
            .type(NotificationType.INFO)
            .recipientId(customerId.toString())
            .recipientType("CUSTOMER")
            .sourceService("order-service")
            .eventType("order-received")
            .correlationId(UUID.fromString(correlationId))
            .build();
        
        messagingService.sendNotificationViaKafka(notification);
        
        System.out.println("✓ Customer notification sent");
    }
    
    private void trackOrderAnalytics(OrderEventPayload order, String correlationId) {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("event", "order-created");
        analytics.put("orderId", order.getOrderId());
        analytics.put("customerId", order.getCustomerId());
        analytics.put("totalAmount", order.getTotalAmount());
        analytics.put("itemCount", order.getItems().size());
        analytics.put("timestamp", Instant.now());
        analytics.put("correlationId", correlationId);
        
        messagingService.sendAnalyticsEvent(analytics, order.getCustomerId().toString());
        
        System.out.println("✓ Analytics event tracked");
    }
    
    private void auditOrderCreation(OrderEventPayload order, String correlationId) {
        Map<String, Object> audit = new HashMap<>();
        audit.put("action", "CREATE");
        audit.put("entity", "Order");
        audit.put("entityId", order.getOrderId());
        audit.put("userId", order.getCustomerId());
        audit.put("timestamp", Instant.now());
        audit.put("correlationId", correlationId);
        audit.put("details", Map.of(
            "status", order.getStatus(),
            "totalAmount", order.getTotalAmount(),
            "itemCount", order.getItems().size()
        ));
        
        messagingService.sendAuditLog(audit, "Order", order.getOrderId().toString());
        
        System.out.println("✓ Audit log created");
    }
    
    // Inner class for order items
    public static class OrderItem {
        private UUID productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        
        // Getters, setters, constructor
        public UUID getProductId() { return productId; }
        public Integer getQuantity() { return quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
    }
}
```

**Event Flow**:
```
Order Service
    ↓
    ├─→ order-events (Kafka) → [Order Service, Shipping Service]
    ├─→ inventory-events (RabbitMQ) → [Inventory Service]
    ├─→ notification-events (Kafka) → [Notification Service]
    ├─→ analytics-events (Kafka) → [Analytics Service]
    └─→ audit-logs (Kafka) → [Audit Service]
```

---

### Example 10: Error Handling and Retry Logic (Advanced)

**Scenario**: Implement robust error handling with retry mechanisms.

```java
import com.yaniq.common_messaging.producer.EnhancedMessageProducer;
import org.springframework.stereotype.Service;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class ResilientMessagingService {
    
    private final EnhancedMessageProducer<Object> messageProducer;
    
    public ResilientMessagingService(EnhancedMessageProducer<Object> messageProducer) {
        this.messageProducer = messageProducer;
    }
    
    /**
     * Send message with automatic retry on failure
     */
    @Retryable(
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2),
        retryFor = {RuntimeException.class}
    )
    public void sendMessageWithRetry(String destination, Object payload) {
        Map<String, Object> headers = new HashMap<>();
        headers.put("timestamp", Instant.now().toString());
        headers.put("attempt", getCurrentAttempt());
        
        try {
            messageProducer.sendWithHeaders(destination, payload, headers);
            System.out.println("Message sent successfully");
        } catch (Exception e) {
            System.err.println("Failed to send message: " + e.getMessage());
            throw new RuntimeException("Message sending failed", e);
        }
    }
    
    /**
     * Recovery method when all retries are exhausted
     */
    @Recover
    public void recoverFromFailure(RuntimeException e, String destination, Object payload) {
        System.err.println("All retry attempts exhausted for destination: " + destination);
        
        // Send to dead letter queue
        Map<String, Object> dlqHeaders = new HashMap<>();
        dlqHeaders.put("original-destination", destination);
        dlqHeaders.put("error-message", e.getMessage());
        dlqHeaders.put("timestamp", Instant.now().toString());
        dlqHeaders.put("retry-count", 3);
        
        try {
            messageProducer.sendWithHeaders("dead-letter-queue", payload, dlqHeaders);
            System.out.println("Message sent to DLQ");
        } catch (Exception dlqException) {
            System.err.println("Failed to send to DLQ: " + dlqException.getMessage());
            // Log to monitoring system, send alert, etc.
        }
    }
    
    private int getCurrentAttempt() {
        // Implementation to track current retry attempt
        return 1;
    }
}
```

**Configuration for Retry**:
```yaml
spring:
  retry:
    enabled: true
```

---

## Best Practices

### 1. **Message Design**
- ✅ Use immutable payload objects
- ✅ Include version information in payloads
- ✅ Add correlation IDs for tracing
- ✅ Keep messages small and focused
- ❌ Avoid large binary data in messages

### 2. **Partitioning Strategy**
- ✅ Partition by entity ID for ordering (userId, orderId)
- ✅ Use consistent partition keys
- ✅ Consider data distribution
- ❌ Don't use random partition keys

### 3. **Routing Keys**
- ✅ Use hierarchical patterns (e.g., `order.created.vip`)
- ✅ Keep routing keys readable
- ✅ Document routing patterns
- ❌ Avoid complex routing logic

### 4. **Error Handling**
- ✅ Implement retry logic
- ✅ Use dead letter queues
- ✅ Log failures with context
- ✅ Monitor message failures
- ❌ Don't lose messages silently

### 5. **Performance**
- ✅ Use batch processing when appropriate
- ✅ Configure proper thread pools
- ✅ Monitor message lag
- ✅ Implement backpressure
- ❌ Don't block message processing

### 6. **Testing**
- ✅ Use embedded brokers for tests
- ✅ Test message serialization
- ✅ Verify partition keys
- ✅ Test error scenarios
- ❌ Don't skip integration tests

---

## Monitoring and Observability

### Metrics to Track

```java
// Example metrics to collect
- Message send rate
- Message processing rate
- Message lag (Kafka)
- Failed messages count
- Retry attempts
- Dead letter queue size
- Processing time
- Partition distribution
```

### Logging Best Practices

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class LoggingExample {
    private static final Logger log = LoggerFactory.getLogger(LoggingExample.class);
    
    public void sendWithLogging(String destination, Object payload) {
        log.info("Sending message to destination: {}", destination);
        log.debug("Payload: {}", payload);
        
        try {
            messageProducer.send(destination, payload);
            log.info("Message sent successfully");
        } catch (Exception e) {
            log.error("Failed to send message to {}: {}", destination, e.getMessage(), e);
        }
    }
}
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Messages Not Received
**Symptoms**: Messages sent but not consumed

**Solutions**:
- Check destination name matches
- Verify consumer binding configuration
- Check consumer group settings
- Verify broker connectivity

#### Issue 2: Message Ordering Issues
**Symptoms**: Messages processed out of order

**Solutions**:
- Use partition keys for Kafka
- Ensure single consumer per partition
- Check concurrent consumer configuration

#### Issue 3: Message Serialization Errors
**Symptoms**: JSON parsing failures

**Solutions**:
- Verify payload class has no-arg constructor
- Check JSON annotations
- Validate message format

#### Issue 4: Performance Degradation
**Symptoms**: Slow message processing

**Solutions**:
- Increase partition count
- Add more consumer instances
- Optimize message processing logic
- Check broker performance

---

## Migration Guide

### Upgrading from 1.0.0 to 1.1.0

#### Breaking Changes
- None (backward compatible)

#### New Features to Adopt

**Before (v1.0.0)**:
```java
messageProducer.send("topic", payload);
```

**After (v1.1.0)** - With enhanced features:
```java
Map<String, Object> headers = Map.of("trace-id", traceId);
messageProducer.sendWithHeaders("topic", payload, headers);
```

#### Recommended Updates

1. **Add correlation IDs**:
```java
// Old way
messageProducer.send("topic", payload);

// New way - with tracking
Map<String, Object> headers = Map.of(
    "correlation-id", UUID.randomUUID().toString()
);
messageProducer.sendWithHeaders("topic", payload, headers);
```

2. **Use InterServiceMessagingService**:
```java
// Old way
messageProducer.send("notification-events", notification);

// New way - with pre-configured patterns
messagingService.sendNotificationViaKafka(notification);
```

3. **Implement event handlers**:
```java
// Old way - manual consumer
@Bean
public Consumer<OrderEvent> orderConsumer() {
    return order -> processOrder(order);
}

// New way - annotation-based
@MessageEventHandler(eventType = "ORDER_CREATED")
public void handleOrderCreated(OrderEvent order) {
    processOrder(order);
}
```

---

## Performance Tuning

### Kafka Configuration

```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          producer-properties:
            batch.size: 16384
            linger.ms: 10
            compression.type: snappy
            max.in.flight.requests.per.connection: 5
          consumer-properties:
            max.poll.records: 500
            fetch.min.bytes: 1024
            fetch.max.wait.ms: 500
```

### RabbitMQ Configuration

```yaml
spring:
  cloud:
    stream:
      rabbit:
        binder:
          connection-name-prefix: yaniq-${spring.application.name}
        bindings:
          output:
            producer:
              batch-enabled: true
              batch-size: 100
              batch-timeout: 1000
```

---

## Security Considerations

### Message Encryption
```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          producer-properties:
            security.protocol: SSL
            ssl.truststore.location: /path/to/truststore.jks
            ssl.truststore.password: ${TRUSTSTORE_PASSWORD}
```

### Authentication
```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          jaas:
            login-module: org.apache.kafka.common.security.plain.PlainLoginModule
            options:
              username: ${KAFKA_USERNAME}
              password: ${KAFKA_PASSWORD}
```

---

## Support and Resources

### Documentation
- [Spring Cloud Stream Documentation](https://spring.io/projects/spring-cloud-stream)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

### Internal Resources
- YaniQ Architecture Documentation
- Service Communication Patterns
- Event Catalog

### Getting Help
- Create an issue in the YaniQ repository
- Contact the platform team
- Check internal wiki for patterns

---

## Appendix

### A. Complete Payload Reference

#### OrderEventPayload
```java
{
  "orderId": "uuid",
  "customerId": "uuid",
  "status": "CREATED|CONFIRMED|SHIPPED|DELIVERED|CANCELLED",
  "totalAmount": "decimal",
  "currency": "string",
  "items": [
    {
      "productId": "uuid",
      "productName": "string",
      "quantity": "integer",
      "unitPrice": "decimal",
      "totalPrice": "decimal"
    }
  ],
  "shippingAddress": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### PaymentEventPayload
```java
{
  "paymentId": "uuid",
  "orderId": "uuid",
  "amount": "decimal",
  "currency": "string",
  "method": "CREDIT_CARD|DEBIT_CARD|PAYPAL|BANK_TRANSFER",
  "status": "PENDING|PROCESSING|COMPLETED|FAILED|REFUNDED",
  "transactionId": "string",
  "timestamp": "timestamp"
}
```

#### UserEventPayload
```java
{
  "userId": "uuid",
  "eventType": "CREATED|UPDATED|DELETED|ACTIVATED|DEACTIVATED",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "status": "ACTIVE|INACTIVE|SUSPENDED",
  "eventTimestamp": "timestamp",
  "sourceService": "string"
}
```

#### NotificationPayload
```java
{
  "title": "string",
  "content": "string",
  "type": "INFO|WARNING|ERROR|SUCCESS",
  "recipientId": "string",
  "recipientType": "string",
  "email": "string",
  "phone": "string",
  "firstName": "string",
  "lastName": "string",
  "metadata": {},
  "sourceService": "string",
  "eventType": "string",
  "correlationId": "uuid"
}
```

### B. Glossary

- **Partition Key**: Key used to determine which Kafka partition a message goes to
- **Routing Key**: Pattern used by RabbitMQ to route messages to queues
- **Correlation ID**: Unique identifier to track requests across services
- **Dead Letter Queue**: Queue for messages that couldn't be processed
- **Consumer Group**: Group of consumers sharing message processing load
- **Topic**: Named channel for publishing messages (Kafka)
- **Exchange**: Message routing component (RabbitMQ)

---

## License

This library is part of the YaniQ platform and is licensed under the MIT License.

---

**Document Version**: 1.1.0  
**Last Updated**: October 2025  
**Maintained By**: YaniQ Platform Team
