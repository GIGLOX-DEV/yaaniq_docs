# Common-Messaging Library - Complete Usage Guide

## Overview

The `common-messaging` library provides a unified abstraction layer for asynchronous messaging with Kafka and RabbitMQ support. It includes message producers, consumers, batch processing, parallel processing, and pre-defined event payloads for inter-service communication.

---

## Version Information

- **Current Version:** `1.0.0`
- **Java Version:** `21`
- **Group ID:** `com.yaniq`
- **Artifact ID:** `common-messaging`
- **Last Updated:** October 2025

---

## Why Use Common-Messaging?

### 🔄 **Unified Messaging Interface**
- **Broker Agnostic**: Switch between Kafka and RabbitMQ without code changes
- **Consistent API**: Same interface for all messaging operations
- **Easy Migration**: Move from one broker to another seamlessly
- **Reduced Learning Curve**: Learn once, use everywhere

### 📨 **Multiple Processing Patterns**
- **Single Message**: Process messages one at a time
- **Batch Processing**: Process multiple messages together
- **Parallel Processing**: Handle messages concurrently
- **Parallel Batch**: Combine batch and parallel processing

### ⚡ **High Performance**
- **Async by Default**: Non-blocking message processing
- **Thread Pool Management**: Efficient resource utilization
- **Backpressure Handling**: Prevent system overload
- **Scalable Architecture**: Handle millions of messages

### 📦 **Pre-defined Payloads**
- **Order Events**: OrderEventPayload
- **Payment Events**: PaymentEventPayload
- **User Events**: UserEventPayload
- **Notifications**: NotificationPayload

---

## Installation

### Maven Dependency

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-messaging</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `spring-cloud-stream` | 2023.0.0 | Stream abstraction |
| `spring-cloud-stream-binder-kafka` | 2023.0.0 | Kafka support |
| `spring-cloud-stream-binder-rabbit` | 2023.0.0 | RabbitMQ support |
| `lombok` | Managed | Reduce boilerplate |
| `jackson-databind` | Managed | JSON serialization |

---

## Core Components

### 1. Message Producers

```
MessageProducer (Interface)
├── StreamBridgeMessageProducer - Spring Cloud Stream
└── EnhancedMessageProducer - Advanced features
```

### 2. Message Consumers

```
MessageConsumer (Interface)
├── BatchMessageConsumer - Batch processing
├── ParallelMessageConsumer - Parallel processing
└── ParallelBatchMessageConsumer - Combined approach
```

### 3. Event Payloads

- **OrderEventPayload** - Order-related messages
- **PaymentEventPayload** - Payment transactions
- **UserEventPayload** - User account events
- **NotificationPayload** - System notifications

### 4. Enums

- **OrderStatus**, **PaymentStatus**, **PaymentMethod**
- **UserEventType**, **UserStatus**, **NotificationType**

---

## Usage Examples

### 1. Publishing Messages

#### Simple Message Publishing

```java
@Service
@RequiredArgsConstructor
public class OrderMessagingService {
    
    private final MessageProducer<OrderEventPayload> messageProducer;
    
    public void publishOrderCreated(Order order) {
        OrderEventPayload payload = OrderEventPayload.builder()
            .orderId(order.getId())
            .userId(order.getUserId())
            .totalAmount(order.getTotalAmount())
            .status(OrderStatus.CREATED)
            .items(order.getItems())
            .timestamp(LocalDateTime.now())
            .build();
        
        messageProducer.send("order-events", payload);
    }
    
    public void publishOrderConfirmed(String orderId) {
        OrderEventPayload payload = OrderEventPayload.builder()
            .orderId(orderId)
            .status(OrderStatus.CONFIRMED)
            .timestamp(LocalDateTime.now())
            .build();
        
        messageProducer.send("order-events", payload);
    }
}
```

#### Payment Event Publishing

```java
@Service
@RequiredArgsConstructor
public class PaymentMessagingService {
    
    private final MessageProducer<PaymentEventPayload> messageProducer;
    
    public void publishPaymentProcessed(Payment payment) {
        PaymentEventPayload payload = PaymentEventPayload.builder()
            .paymentId(payment.getId())
            .orderId(payment.getOrderId())
            .userId(payment.getUserId())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .method(PaymentMethod.valueOf(payment.getMethod()))
            .status(PaymentStatus.SUCCESS)
            .transactionId(payment.getTransactionId())
            .timestamp(LocalDateTime.now())
            .build();
        
        messageProducer.send("payment-events", payload);
    }
    
    public void publishPaymentFailed(String orderId, String reason) {
        PaymentEventPayload payload = PaymentEventPayload.builder()
            .orderId(orderId)
            .status(PaymentStatus.FAILED)
            .failureReason(reason)
            .timestamp(LocalDateTime.now())
            .build();
        
        messageProducer.send("payment-events", payload);
    }
}
```

#### Notification Publishing

```java
@Service
@RequiredArgsConstructor
public class NotificationMessagingService {
    
    private final MessageProducer<NotificationPayload> messageProducer;
    
    public void sendEmailNotification(String userId, String subject, String body) {
        NotificationPayload payload = NotificationPayload.builder()
            .userId(userId)
            .type(NotificationType.EMAIL)
            .subject(subject)
            .message(body)
            .timestamp(LocalDateTime.now())
            .build();
        
        messageProducer.send("notifications", payload);
    }
    
    public void sendPushNotification(String userId, String title, String message) {
        NotificationPayload payload = NotificationPayload.builder()
            .userId(userId)
            .type(NotificationType.PUSH)
            .subject(title)
            .message(message)
            .timestamp(LocalDateTime.now())
            .build();
        
        messageProducer.send("notifications", payload);
    }
}
```

### 2. Consuming Messages

#### Simple Consumer

```java
@Component
@Slf4j
public class OrderEventConsumer {
    
    @StreamListener("order-events-input")
    public void handleOrderEvent(OrderEventPayload payload) {
        log.info("Received order event: {} - Status: {}", 
            payload.getOrderId(), payload.getStatus());
        
        switch (payload.getStatus()) {
            case CREATED -> handleOrderCreated(payload);
            case CONFIRMED -> handleOrderConfirmed(payload);
            case SHIPPED -> handleOrderShipped(payload);
            case DELIVERED -> handleOrderDelivered(payload);
            case CANCELLED -> handleOrderCancelled(payload);
        }
    }
    
    private void handleOrderCreated(OrderEventPayload payload) {
        log.info("Processing new order: {}", payload.getOrderId());
        // Reserve inventory, calculate shipping, etc.
    }
    
    private void handleOrderConfirmed(OrderEventPayload payload) {
        log.info("Order confirmed: {}", payload.getOrderId());
        // Trigger fulfillment process
    }
}
```

#### Batch Consumer

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentBatchConsumer implements BatchMessageConsumer<PaymentEventPayload> {
    
    private final PaymentAnalyticsService analyticsService;
    
    @Override
    public void consume(List<PaymentEventPayload> messages) {
        log.info("Processing batch of {} payment events", messages.size());
        
        // Group by status
        Map<PaymentStatus, List<PaymentEventPayload>> grouped = messages.stream()
            .collect(Collectors.groupingBy(PaymentEventPayload::getStatus));
        
        // Process successful payments
        List<PaymentEventPayload> successful = grouped.get(PaymentStatus.SUCCESS);
        if (successful != null && !successful.isEmpty()) {
            analyticsService.recordSuccessfulPayments(successful);
        }
        
        // Handle failed payments
        List<PaymentEventPayload> failed = grouped.get(PaymentStatus.FAILED);
        if (failed != null && !failed.isEmpty()) {
            analyticsService.recordFailedPayments(failed);
        }
    }
}
```

#### Parallel Consumer

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationParallelConsumer implements ParallelMessageConsumer<NotificationPayload> {
    
    private final EmailService emailService;
    private final PushService pushService;
    private final SmsService smsService;
    
    @Override
    public void consume(NotificationPayload message) {
        log.info("Processing notification for user: {}", message.getUserId());
        
        try {
            switch (message.getType()) {
                case EMAIL -> emailService.send(
                    message.getUserId(),
                    message.getSubject(),
                    message.getMessage()
                );
                case PUSH -> pushService.send(
                    message.getUserId(),
                    message.getSubject(),
                    message.getMessage()
                );
                case SMS -> smsService.send(
                    message.getUserId(),
                    message.getMessage()
                );
            }
            
            log.info("Notification sent successfully: {}", message.getUserId());
            
        } catch (Exception ex) {
            log.error("Failed to send notification: {}", message.getUserId(), ex);
            // Could retry or send to dead letter queue
        }
    }
    
    @Override
    public int getParallelism() {
        return 10; // Process 10 notifications concurrently
    }
}
```

#### Parallel Batch Consumer

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderAnalyticsConsumer implements ParallelBatchMessageConsumer<OrderEventPayload> {
    
    private final AnalyticsService analyticsService;
    
    @Override
    public void consume(List<OrderEventPayload> messages) {
        log.info("Processing batch of {} orders in parallel", messages.size());
        
        // Process batch efficiently
        analyticsService.processOrderMetrics(messages);
    }
    
    @Override
    public int getParallelism() {
        return 5; // Process 5 batches concurrently
    }
    
    @Override
    public int getBatchSize() {
        return 100; // 100 messages per batch
    }
}
```

### 3. Request-Response Pattern

```java
@Service
@RequiredArgsConstructor
public class InventoryQueryService {
    
    private final MessagingClient messagingClient;
    
    public CompletableFuture<InventoryResponse> checkStock(String productId) {
        InventoryQuery query = InventoryQuery.builder()
            .productId(productId)
            .timestamp(LocalDateTime.now())
            .build();
        
        return messagingClient.sendAndReceive(
            "inventory-queries",
            "inventory-responses",
            query,
            InventoryResponse.class
        );
    }
}

// Consumer side
@Component
public class InventoryQueryHandler {
    
    @StreamListener("inventory-queries-input")
    @SendTo("inventory-responses-output")
    public InventoryResponse handleQuery(InventoryQuery query) {
        int availableStock = getAvailableStock(query.getProductId());
        
        return InventoryResponse.builder()
            .productId(query.getProductId())
            .availableQuantity(availableStock)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
```

### 4. Dead Letter Queue Handling

```java
@Component
@Slf4j
public class DeadLetterQueueHandler {
    
    @StreamListener("order-events-dlq")
    public void handleFailedMessages(OrderEventPayload payload, 
                                     @Header("x-exception-message") String error) {
        log.error("Message failed processing: {} - Error: {}", 
            payload.getOrderId(), error);
        
        // Store in database for manual review
        failedMessageRepository.save(FailedMessage.builder()
            .payload(toJson(payload))
            .errorMessage(error)
            .timestamp(LocalDateTime.now())
            .build());
        
        // Alert ops team
        alertService.sendAlert("DLQ Message", error);
    }
}
```

---

## Configuration

### Kafka Configuration

```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          brokers: localhost:9092
          auto-create-topics: true
          min-partition-count: 3
          replication-factor: 1
      
      bindings:
        # Producer
        order-events-output:
          destination: order-events
          content-type: application/json
          producer:
            partition-count: 3
        
        # Consumer
        order-events-input:
          destination: order-events
          group: order-service
          content-type: application/json
          consumer:
            max-attempts: 3
            back-off-initial-interval: 1000
            back-off-multiplier: 2
```

### RabbitMQ Configuration

```yaml
spring:
  cloud:
    stream:
      rabbit:
        binder:
          admin-addresses: localhost:15672
          nodes: localhost:5672
      
      bindings:
        # Producer
        payment-events-output:
          destination: payment-events
          content-type: application/json
          producer:
            required-groups: payment-processor
        
        # Consumer
        payment-events-input:
          destination: payment-events
          group: payment-processor
          content-type: application/json
          consumer:
            max-attempts: 3
            republish-to-dlq: true
```

### Multi-Binder Configuration

```yaml
spring:
  cloud:
    stream:
      bindings:
        # Use Kafka for high-throughput
        analytics-output:
          destination: analytics
          binder: kafka
        
        # Use RabbitMQ for critical notifications
        notifications-output:
          destination: notifications
          binder: rabbit
      
      binders:
        kafka:
          type: kafka
          environment:
            spring:
              cloud:
                stream:
                  kafka:
                    binder:
                      brokers: localhost:9092
        
        rabbit:
          type: rabbit
          environment:
            spring:
              rabbitmq:
                host: localhost
                port: 5672
```

### Thread Pool Configuration

```java
@Configuration
public class ThreadPoolTaskExecutorConfig {
    
    @Bean
    public TaskExecutor messageTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("msg-executor-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

---

## Advanced Patterns

### 1. Message Filtering

```java
@Component
public class OrderEventFilter {
    
    @StreamListener("order-events-input")
    @SendTo("high-value-orders-output")
    public OrderEventPayload filterHighValueOrders(OrderEventPayload payload) {
        if (payload.getTotalAmount().compareTo(new BigDecimal("1000")) > 0) {
            return payload; // Forward to high-value queue
        }
        return null; // Filter out
    }
}
```

### 2. Message Transformation

```java
@Component
public class OrderTransformer {
    
    @Transformer(inputChannel = "order-events-input", 
                 outputChannel = "enriched-orders-output")
    public EnrichedOrderPayload transform(OrderEventPayload payload) {
        // Enrich with additional data
        User user = userService.findById(payload.getUserId());
        
        return EnrichedOrderPayload.builder()
            .orderId(payload.getOrderId())
            .userId(payload.getUserId())
            .userName(user.getName())
            .userEmail(user.getEmail())
            .totalAmount(payload.getTotalAmount())
            .build();
    }
}
```

### 3. Message Aggregation

```java
@Component
public class OrderAggregator {
    
    private final Map<String, List<OrderEventPayload>> orderBuffer = new ConcurrentHashMap<>();
    
    @StreamListener("order-events-input")
    public void aggregate(OrderEventPayload payload) {
        String userId = payload.getUserId();
        
        orderBuffer.computeIfAbsent(userId, k -> new ArrayList<>()).add(payload);
        
        List<OrderEventPayload> userOrders = orderBuffer.get(userId);
        
        // Once we have all order events, process them together
        if (isComplete(userOrders)) {
            processAggregatedOrders(userId, userOrders);
            orderBuffer.remove(userId);
        }
    }
}
```

### 4. Saga Pattern with Messaging

```java
@Component
@RequiredArgsConstructor
public class OrderSagaCoordinator {
    
    private final MessageProducer<OrderEventPayload> orderProducer;
    private final MessageProducer<PaymentEventPayload> paymentProducer;
    private final MessageProducer<InventoryEventPayload> inventoryProducer;
    
    @StreamListener("order-created-input")
    public void handleOrderCreated(OrderEventPayload order) {
        // Step 1: Reserve inventory
        inventoryProducer.send("inventory-reserve", buildReserveRequest(order));
    }
    
    @StreamListener("inventory-reserved-input")
    public void handleInventoryReserved(InventoryEventPayload inventory) {
        // Step 2: Process payment
        paymentProducer.send("payment-process", buildPaymentRequest(inventory));
    }
    
    @StreamListener("payment-failed-input")
    public void handlePaymentFailed(PaymentEventPayload payment) {
        // Compensation: Release inventory
        inventoryProducer.send("inventory-release", buildReleaseRequest(payment));
    }
}
```

---

## Best Practices

### 1. Message Design

**DO:**
- ✅ Keep messages small and focused
- ✅ Include timestamps
- ✅ Use correlation IDs
- ✅ Make messages self-contained
- ✅ Version your message schemas

**DON'T:**
- ❌ Send large binary data
- ❌ Include sensitive information
- ❌ Assume message ordering
- ❌ Create circular dependencies

### 2. Error Handling

```java
@StreamListener("order-events-input")
public void handleOrder(OrderEventPayload payload) {
    try {
        processOrder(payload);
    } catch (TransientException ex) {
        // Retryable error - throw to trigger retry
        throw ex;
    } catch (PermanentException ex) {
        // Non-retryable - log and move to DLQ
        log.error("Permanent failure for order: {}", payload.getOrderId(), ex);
        deadLetterQueue.send(payload, ex.getMessage());
    }
}
```

### 3. Idempotency

```java
@Component
@RequiredArgsConstructor
public class IdempotentOrderConsumer {
    
    private final ProcessedMessageRepository processedRepo;
    
    @StreamListener("order-events-input")
    @Transactional
    public void handleOrder(OrderEventPayload payload) {
        String messageId = payload.getOrderId() + "-" + payload.getStatus();
        
        // Check if already processed
        if (processedRepo.existsById(messageId)) {
            log.info("Message already processed: {}", messageId);
            return;
        }
        
        // Process message
        processOrder(payload);
        
        // Mark as processed
        processedRepo.save(new ProcessedMessage(messageId, LocalDateTime.now()));
    }
}
```

---

## Testing

### Unit Testing Producers

```java
@SpringBootTest
class OrderMessagingServiceTest {
    
    @MockBean
    private MessageProducer<OrderEventPayload> messageProducer;
    
    @Autowired
    private OrderMessagingService messagingService;
    
    @Test
    void testPublishOrderCreated() {
        // Given
        Order order = new Order();
        order.setId("ORD-123");
        order.setUserId("USER-456");
        
        // When
        messagingService.publishOrderCreated(order);
        
        // Then
        verify(messageProducer).send(eq("order-events"), argThat(payload ->
            payload.getOrderId().equals("ORD-123") &&
            payload.getStatus() == OrderStatus.CREATED
        ));
    }
}
```

### Integration Testing with TestContainers

```java
@SpringBootTest
@Testcontainers
class MessagingIntegrationTest {
    
    @Container
    static KafkaContainer kafka = new KafkaContainer(
        DockerImageName.parse("confluentinc/cp-kafka:7.4.0")
    );
    
    @DynamicPropertySource
    static void kafkaProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.cloud.stream.kafka.binder.brokers", 
            kafka::getBootstrapServers);
    }
    
    @Test
    void testMessageFlow() throws Exception {
        // Publish message
        orderService.publishOrderCreated(testOrder);
        
        // Wait for consumer
        await().atMost(5, TimeUnit.SECONDS)
            .until(() -> orderConsumer.getProcessedOrders().size() > 0);
        
        // Verify
        assertEquals(1, orderConsumer.getProcessedOrders().size());
    }
}
```

---

## Troubleshooting

### Messages Not Being Consumed

**Check:**
1. Consumer group configuration
2. Topic/queue exists
3. Message format matches (JSON)
4. Network connectivity to broker

### Slow Message Processing

**Solutions:**
- Enable parallel processing
- Increase consumer instances
- Optimize message processing logic
- Use batch processing

### Messages Going to DLQ

**Debug:**
```java
@StreamListener("order-events-dlq")
public void debugDLQ(Message<?> message) {
    log.error("DLQ Message: {}", message.getPayload());
    log.error("Headers: {}", message.getHeaders());
    log.error("Exception: {}", message.getHeaders().get("x-exception-message"));
}
```

---

## Version History

### Version 1.0.0 (Current)
- ✅ Kafka and RabbitMQ support
- ✅ Multiple processing patterns
- ✅ Pre-defined event payloads
- ✅ Batch and parallel processing
- ✅ Spring Cloud Stream integration

### Planned Features (v1.1.0)
- ⏳ Message schema registry
- ⏳ Advanced retry strategies
- ⏳ Circuit breaker integration
- ⏳ Message tracing

---

## Related Libraries

- [common-events](./common-events.md) - Domain events
- [common-api](./common-api.md) - API structures
- [common-logging](./common-logging.md) - Message logging

---

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0

---

**Last Updated:** October 19, 2025  
**Maintainer:** Danukaji Hansanath

