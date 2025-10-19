# Common-Events Library - Complete Usage Guide

## Overview

The `common-events` library provides a standardized event-driven architecture for asynchronous communication between YaniQ microservices. It includes pre-defined domain events, event handlers, and publishing utilities for building reactive, decoupled systems.

---

## Version Information

- **Current Version:** `1.0.0`
- **Java Version:** `21`
- **Group ID:** `com.yaniq.common`
- **Artifact ID:** `common-events`
- **Last Updated:** October 2025

---

## Why Use Common-Events?

### 🔄 **Event-Driven Architecture**
- **Loose Coupling**: Services communicate through events without direct dependencies
- **Scalability**: Handle millions of events asynchronously
- **Resilience**: Services continue operating even if consumers are temporarily down
- **Flexibility**: Add new consumers without modifying producers

### 📨 **Asynchronous Communication**
- **Non-Blocking Operations**: Don't wait for synchronous responses
- **Better Performance**: Process events in parallel
- **Improved User Experience**: Return responses immediately
- **Background Processing**: Handle time-consuming tasks asynchronously

### 📊 **Event Sourcing & CQRS**
- **Complete Audit Trail**: Every state change is recorded as an event
- **Replay Capability**: Reconstruct system state from event history
- **Temporal Queries**: Query historical data at any point in time
- **Command Query Separation**: Separate read and write models

### 🔔 **Real-Time Notifications**
- **Instant Updates**: Notify users of important events immediately
- **Cross-Service Communication**: Coordinate actions across multiple services
- **Event Broadcasting**: Multiple services can react to the same event

---

## Installation

### Maven Dependency

```xml
<dependency>
    <groupId>com.yaniq.common</groupId>
    <artifactId>common-events</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `lombok` | 1.18.30 | Reduce boilerplate code |
| `jackson-databind` | 2.15.3 | JSON serialization/deserialization |
| `jackson-datatype-jsr310` | 2.15.3 | Java 8 date/time support |
| `jakarta.validation-api` | 3.0.2 | Bean validation |

---

## Core Components

### 1. Event Categories

The library provides events organized by domain:

#### **Order Events**
- `OrderCreatedEvent` - When a new order is placed
- `OrderConfirmedEvent` - When order is confirmed
- `OrderShippedEvent` - When order is shipped
- `OrderDeliveredEvent` - When order is delivered
- `OrderCancelledEvent` - When order is cancelled

#### **Product Events**
- `ProductCreatedEvent` - New product added
- `ProductPriceChangedEvent` - Product price updated
- `ProductDeletedEvent` - Product removed

#### **Inventory Events**
- `InventoryReservedEvent` - Stock reserved for order
- `InventoryReleasedEvent` - Reserved stock released
- `InventoryLowStockEvent` - Stock below threshold

#### **Cart Events**
- `CartItemRemovedEvent` - Item removed from cart
- `CartCheckedOutEvent` - Cart checked out

#### **Billing Events**
- `InvoiceCreatedEvent` - Invoice generated
- `InvoicePaidEvent` - Invoice payment received

#### **Analytics Events**
- `ProductViewedEvent` - Product page viewed
- `SearchPerformedEvent` - Search query executed

### 2. EventSource Constants

```java
public class EventSource {
    public static final String USER_SERVICE = "user-service";
    public static final String ORDER_SERVICE = "order-service";
    public static final String PRODUCT_SERVICE = "product-service";
    public static final String PAYMENT_SERVICE = "payment-service";
    // ... and more
}
```

### 3. EventPublisher Utility

Provides serialization/deserialization for events:
- `toJson(BaseEvent)` - Convert event to JSON
- `fromJson(String, Class)` - Parse JSON to event
- `toPrettyJson(BaseEvent)` - Pretty-print JSON

---

## Usage Examples

### 1. Publishing Events

#### Order Service - Create Order Event

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public Order createOrder(OrderRequest request, String userId) {
        // Create order
        Order order = new Order();
        order.setUserId(userId);
        order.setItems(request.getItems());
        order.setTotalAmount(calculateTotal(request.getItems()));
        order.setStatus(OrderStatus.PENDING);
        
        Order savedOrder = orderRepository.save(order);
        
        // Publish event
        OrderCreatedEvent event = OrderCreatedEvent.builder()
            .orderId(savedOrder.getId())
            .userId(userId)
            .items(savedOrder.getItems())
            .totalAmount(savedOrder.getTotalAmount())
            .orderDate(LocalDateTime.now())
            .eventSource(EventSource.ORDER_SERVICE)
            .build();
        
        eventPublisher.publishEvent(event);
        
        return savedOrder;
    }
}
```

#### Product Service - Price Change Event

```java
@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public Product updatePrice(Long productId, BigDecimal newPrice) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        
        BigDecimal oldPrice = product.getPrice();
        product.setPrice(newPrice);
        Product updated = productRepository.save(product);
        
        // Publish price change event
        ProductPriceChangedEvent event = ProductPriceChangedEvent.builder()
            .productId(productId)
            .productName(product.getName())
            .oldPrice(oldPrice)
            .newPrice(newPrice)
            .changedAt(LocalDateTime.now())
            .eventSource(EventSource.PRODUCT_SERVICE)
            .build();
        
        eventPublisher.publishEvent(event);
        
        return updated;
    }
}
```

### 2. Consuming Events

#### Inventory Service - Reserve Stock on Order Created

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {
    
    private final InventoryService inventoryService;
    private final ApplicationEventPublisher eventPublisher;
    
    @EventListener
    @Async
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent for order: {}", event.getOrderId());
        
        try {
            // Reserve inventory for each item
            for (OrderItem item : event.getItems()) {
                inventoryService.reserveStock(
                    item.getProductId(), 
                    item.getQuantity(), 
                    event.getOrderId()
                );
            }
            
            // Publish inventory reserved event
            InventoryReservedEvent reservedEvent = InventoryReservedEvent.builder()
                .orderId(event.getOrderId())
                .reservedAt(LocalDateTime.now())
                .eventSource(EventSource.INVENTORY_SERVICE)
                .build();
            
            eventPublisher.publishEvent(reservedEvent);
            
        } catch (InsufficientStockException ex) {
            log.error("Failed to reserve inventory for order: {}", event.getOrderId(), ex);
            // Publish compensation event or handle failure
        }
    }
}
```

#### Notification Service - Send Order Confirmation

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationListener {
    
    private final NotificationService notificationService;
    private final UserService userService;
    
    @EventListener
    @Async
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Sending order confirmation for order: {}", event.getOrderId());
        
        User user = userService.findById(event.getUserId());
        
        notificationService.sendEmail(
            user.getEmail(),
            "Order Confirmation - #" + event.getOrderId(),
            buildOrderConfirmationEmail(event)
        );
        
        notificationService.sendPush(
            user.getId(),
            "Order Placed Successfully",
            "Your order #" + event.getOrderId() + " has been placed."
        );
    }
    
    @EventListener
    @Async
    public void handleOrderShipped(OrderShippedEvent event) {
        User user = userService.findById(event.getUserId());
        
        notificationService.sendEmail(
            user.getEmail(),
            "Order Shipped - #" + event.getOrderId(),
            "Your order has been shipped. Tracking: " + event.getTrackingNumber()
        );
    }
}
```

### 3. Analytics Service - Track Product Views

```java
@Service
@RequiredArgsConstructor
public class ProductAnalyticsService {
    
    private final ApplicationEventPublisher eventPublisher;
    private final ProductViewRepository viewRepository;
    
    public void trackProductView(Long productId, String userId, String sessionId) {
        // Record view in database
        ProductView view = new ProductView();
        view.setProductId(productId);
        view.setUserId(userId);
        view.setSessionId(sessionId);
        view.setViewedAt(LocalDateTime.now());
        viewRepository.save(view);
        
        // Publish event for real-time analytics
        ProductViewedEvent event = ProductViewedEvent.builder()
            .productId(productId)
            .userId(userId)
            .sessionId(sessionId)
            .viewedAt(LocalDateTime.now())
            .eventSource(EventSource.ANALYTICS_SERVICE)
            .build();
        
        eventPublisher.publishEvent(event);
    }
}
```

### 4. Multi-Consumer Pattern

```java
// Multiple services can listen to the same event

// Service 1: Analytics Service
@Component
public class AnalyticsListener {
    
    @EventListener
    @Async
    public void handleProductPriceChanged(ProductPriceChangedEvent event) {
        // Track price changes for analytics
        analyticsService.recordPriceChange(event);
    }
}

// Service 2: Notification Service
@Component
public class NotificationListener {
    
    @EventListener
    @Async
    public void handleProductPriceChanged(ProductPriceChangedEvent event) {
        // Notify users who favorited this product
        notificationService.notifyPriceChange(event.getProductId(), event.getNewPrice());
    }
}

// Service 3: Search Service
@Component
public class SearchIndexListener {
    
    @EventListener
    @Async
    public void handleProductPriceChanged(ProductPriceChangedEvent event) {
        // Update search index with new price
        searchService.updateProductPrice(event.getProductId(), event.getNewPrice());
    }
}
```

### 5. Event Serialization

```java
@Service
public class EventStorageService {
    
    public void storeEvent(BaseEvent event) throws JsonProcessingException {
        // Serialize event to JSON
        String jsonEvent = EventPublisher.toJson(event);
        
        // Store in database
        EventLog log = new EventLog();
        log.setEventType(event.getClass().getSimpleName());
        log.setEventData(jsonEvent);
        log.setEventSource(event.getEventSource());
        log.setTimestamp(LocalDateTime.now());
        
        eventLogRepository.save(log);
    }
    
    public OrderCreatedEvent retrieveEvent(String eventId) throws JsonProcessingException {
        EventLog log = eventLogRepository.findById(eventId)
            .orElseThrow(() -> new NotFoundException("Event not found"));
        
        // Deserialize from JSON
        return EventPublisher.fromJson(log.getEventData(), OrderCreatedEvent.class);
    }
}
```

---

## Event Patterns

### 1. Saga Pattern (Distributed Transactions)

```java
@Service
@RequiredArgsConstructor
public class OrderSagaOrchestrator {
    
    private final ApplicationEventPublisher eventPublisher;
    
    @EventListener
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Step 1: Reserve inventory
        // (Inventory service listens and reserves)
    }
    
    @EventListener
    @Transactional
    public void handleInventoryReserved(InventoryReservedEvent event) {
        // Step 2: Process payment
        eventPublisher.publishEvent(new ProcessPaymentCommand(event.getOrderId()));
    }
    
    @EventListener
    @Transactional
    public void handlePaymentFailed(PaymentFailedEvent event) {
        // Compensation: Release inventory
        eventPublisher.publishEvent(new ReleaseInventoryCommand(event.getOrderId()));
    }
}
```

### 2. Event Sourcing

```java
@Service
@RequiredArgsConstructor
public class OrderEventSourcingService {
    
    private final EventStore eventStore;
    
    public Order rebuildOrderState(String orderId) throws JsonProcessingException {
        // Get all events for this order
        List<EventLog> events = eventStore.findByAggregateId(orderId);
        
        Order order = new Order();
        
        for (EventLog eventLog : events) {
            // Apply each event to rebuild state
            if (eventLog.getEventType().equals("OrderCreatedEvent")) {
                OrderCreatedEvent event = EventPublisher.fromJson(
                    eventLog.getEventData(), 
                    OrderCreatedEvent.class
                );
                order.setId(event.getOrderId());
                order.setUserId(event.getUserId());
                order.setStatus(OrderStatus.PENDING);
            }
            else if (eventLog.getEventType().equals("OrderConfirmedEvent")) {
                order.setStatus(OrderStatus.CONFIRMED);
            }
            else if (eventLog.getEventType().equals("OrderShippedEvent")) {
                OrderShippedEvent event = EventPublisher.fromJson(
                    eventLog.getEventData(), 
                    OrderShippedEvent.class
                );
                order.setStatus(OrderStatus.SHIPPED);
                order.setTrackingNumber(event.getTrackingNumber());
            }
        }
        
        return order;
    }
}
```

### 3. CQRS (Command Query Responsibility Segregation)

```java
// Write Model - Command Side
@Service
public class OrderCommandService {
    
    @Transactional
    public void createOrder(CreateOrderCommand command) {
        // Create order (write)
        Order order = orderRepository.save(new Order(command));
        
        // Publish event
        eventPublisher.publishEvent(new OrderCreatedEvent(order));
    }
}

// Read Model - Query Side
@Component
public class OrderQueryModelUpdater {
    
    @EventListener
    @Async
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Update read-optimized view
        OrderReadModel readModel = new OrderReadModel();
        readModel.setOrderId(event.getOrderId());
        readModel.setUserName(getUserName(event.getUserId()));
        readModel.setProductNames(getProductNames(event.getItems()));
        
        orderReadRepository.save(readModel);
    }
}
```

---

## Configuration

### Enable Async Event Processing

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("event-async-");
        executor.initialize();
        return executor;
    }
    
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, objects) -> {
            log.error("Exception in async method: {} with params: {}", 
                method.getName(), objects, throwable);
        };
    }
}
```

### Application Properties

```yaml
spring:
  application:
    name: order-service
  
# Event processing configuration
events:
  async:
    enabled: true
    core-pool-size: 10
    max-pool-size: 20
    queue-capacity: 500
  
  retry:
    max-attempts: 3
    backoff-delay: 1000 # milliseconds
```

---

## Best Practices

### 1. Event Design

**DO:**
- ✅ Make events immutable
- ✅ Include all necessary context
- ✅ Use past tense for event names (OrderCreated, not CreateOrder)
- ✅ Include timestamp and event source
- ✅ Keep events small and focused

**DON'T:**
- ❌ Include sensitive data (passwords, tokens)
- ❌ Make events too large (reference IDs instead of full objects)
- ❌ Use events for request-response patterns
- ❌ Depend on event ordering (design idempotent handlers)

### 2. Event Handling

```java
@EventListener
@Async
@Transactional
@Retryable(
    value = {DataAccessException.class},
    maxAttempts = 3,
    backoff = @Backoff(delay = 1000)
)
public void handleEvent(OrderCreatedEvent event) {
    // Idempotent processing
    if (alreadyProcessed(event.getEventId())) {
        log.info("Event already processed: {}", event.getEventId());
        return;
    }
    
    try {
        processEvent(event);
        markAsProcessed(event.getEventId());
    } catch (Exception ex) {
        log.error("Failed to process event: {}", event.getEventId(), ex);
        throw ex; // Retry will kick in
    }
}
```

### 3. Error Handling

```java
@Component
@Slf4j
public class EventErrorHandler {
    
    @EventListener
    public void handleEventError(EventErrorEvent error) {
        log.error("Event processing failed: {}", error.getOriginalEvent(), error.getException());
        
        // Store in dead letter queue
        deadLetterQueue.store(error.getOriginalEvent(), error.getException());
        
        // Alert monitoring system
        alertService.sendAlert("Event Processing Failed", error);
    }
}
```

---

## Testing

### Unit Testing Events

```java
@Test
void testOrderCreatedEventSerialization() throws JsonProcessingException {
    // Given
    OrderCreatedEvent event = OrderCreatedEvent.builder()
        .orderId("ORD-123")
        .userId("USER-456")
        .totalAmount(new BigDecimal("99.99"))
        .eventSource(EventSource.ORDER_SERVICE)
        .build();
    
    // When
    String json = EventPublisher.toJson(event);
    OrderCreatedEvent deserialized = EventPublisher.fromJson(json, OrderCreatedEvent.class);
    
    // Then
    assertEquals(event.getOrderId(), deserialized.getOrderId());
    assertEquals(event.getUserId(), deserialized.getUserId());
    assertEquals(event.getTotalAmount(), deserialized.getTotalAmount());
}
```

### Integration Testing Event Handlers

```java
@SpringBootTest
class OrderEventListenerTest {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @MockBean
    private InventoryService inventoryService;
    
    @Test
    void testOrderCreatedEventTriggersInventoryReservation() {
        // Given
        OrderCreatedEvent event = OrderCreatedEvent.builder()
            .orderId("ORD-123")
            .items(List.of(new OrderItem("PROD-1", 2)))
            .build();
        
        // When
        eventPublisher.publishEvent(event);
        
        // Wait for async processing
        await().atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> 
                verify(inventoryService).reserveStock("PROD-1", 2, "ORD-123")
            );
    }
}
```

---

## Troubleshooting

### Events Not Being Processed

**Check:**
1. Is `@EnableAsync` configured?
2. Are event listeners annotated with `@EventListener` and `@Async`?
3. Is the component scan including your listener packages?

### Events Processed Multiple Times

**Solution:** Implement idempotency

```java
@EventListener
public void handleEvent(OrderCreatedEvent event) {
    String idempotencyKey = event.getEventId();
    
    if (processedEvents.contains(idempotencyKey)) {
        return; // Already processed
    }
    
    processEvent(event);
    processedEvents.add(idempotencyKey);
}
```

---

## Version History

### Version 1.0.0 (Current)
- ✅ Order, Product, Inventory, Cart, Billing, Analytics events
- ✅ EventPublisher utility for JSON serialization
- ✅ EventSource constants for all services
- ✅ Java 21 support
- ✅ Jackson integration

### Planned Features (v1.1.0)
- ⏳ Event versioning support
- ⏳ Event replay capability
- ⏳ Built-in dead letter queue
- ⏳ Event schema validation

---

## Related Libraries

- [common-messaging](./common-messaging.md) - Kafka/RabbitMQ integration
- [common-api](./common-api.md) - API response structures
- [common-logging](./common-logging.md) - Logging utilities

---

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0

---

**Last Updated:** October 19, 2025  
**Maintainer:** Danukaji Hansanath

