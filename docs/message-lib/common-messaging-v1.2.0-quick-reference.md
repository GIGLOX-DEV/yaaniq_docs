---
sidebar_position: 5
title: Quick Reference Guide
description: Developer-focused quick start guide for Common Messaging Library v1.2.0
---

# 🚀 Common Messaging v1.2.0 - Developer Quick Reference

## 📦 **Installation & Setup**

### **1. Add Dependency**
```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-messaging</artifactId>
    <version>1.2.0</version>
</dependency>
```

### **2. Basic Configuration**
```java
@Configuration
@Import(UniversalMessagingConfig.class)
public class MessagingConfig {
    @Bean
    public UniversalMessageProducer messageProducer(RabbitTemplate rabbitTemplate) {
        return new UniversalMessageProducer(rabbitTemplate);
    }
}
```

---

## 🎯 **Quick Start Examples**

### **Publishing Messages**
```java
@Service
@RequiredArgsConstructor
public class MyService {
    private final UniversalMessageProducer messageProducer;
    
    // User events
    public void publishUserCreated(UserData user) {
        UserEventPayload payload = UserEventPayload.builder()
            .userId(user.getId())
            .eventType(UserEventType.CREATED)
            .status(UserStatus.INACTIVE)
            .email(user.getEmail())
            .build();
        
        messageProducer.sendUserEvent("created", "inactive", "my-service", payload);
    }
    
    // Notifications
    public void sendWelcomeEmail(String email) {
        NotificationPayload payload = NotificationPayload.builder()
            .recipient(email)
            .subject("Welcome!")
            .content("Welcome to YaniQ!")
            .type(NotificationType.EMAIL)
            .build();
        
        messageProducer.sendNotification("email", "welcome", "active", payload);
    }
    
    // Order events
    public void publishOrderCreated(Order order) {
        OrderEventPayload payload = OrderEventPayload.builder()
            .orderId(order.getId())
            .customerId(order.getCustomerId())
            .status(OrderStatus.CREATED)
            .build();
        
        messageProducer.sendOrderEvent("created", "pending", "order-service", payload);
    }
}
```

### **Consuming Messages**
```java
@Component
@RequiredArgsConstructor
public class MyEventHandler {
    
    @RabbitListener(queues = MessagingConstants.USER_NOTIFICATIONS_QUEUE)
    public void handleUserEvent(UserEventPayload payload, Message message) {
        String routingKey = message.getMessageProperties().getReceivedRoutingKey();
        
        if (payload.getEventType() == UserEventType.CREATED) {
            // Process user creation
            processUserCreation(payload);
        }
    }
    
    @RabbitListener(queues = MessagingConstants.EMAIL_NOTIFICATIONS_QUEUE)
    public void handleEmailNotification(NotificationPayload payload) {
        // Send email
        emailService.send(payload.getRecipient(), payload.getSubject(), payload.getContent());
    }
}
```

---

## 📋 **Essential Constants**

### **Exchanges**
```java
MessagingConstants.USER_EVENTS_EXCHANGE          // "user.events.exchange"
MessagingConstants.ORDER_EVENTS_EXCHANGE         // "order.events.exchange"
MessagingConstants.NOTIFICATION_EVENTS_EXCHANGE  // "notification.events.exchange"
MessagingConstants.PAYMENT_EVENTS_EXCHANGE       // "payment.events.exchange"
MessagingConstants.SYSTEM_EVENTS_EXCHANGE        // "system.events.exchange"
```

### **Queues**
```java
MessagingConstants.USER_NOTIFICATIONS_QUEUE      // "user.notifications.queue"
MessagingConstants.EMAIL_NOTIFICATIONS_QUEUE     // "email.notifications.queue"
MessagingConstants.SMS_NOTIFICATIONS_QUEUE       // "sms.notifications.queue"
MessagingConstants.PUSH_NOTIFICATIONS_QUEUE      // "push.notifications.queue"
MessagingConstants.ORDER_PROCESSING_QUEUE        // "order.processing.queue"
```

### **Routing Patterns**
```java
MessagingConstants.USER_CREATED_PATTERN          // "user.created.*.*"
MessagingConstants.USER_ALL_PATTERN              // "user.*.*.*"
MessagingConstants.NOTIFICATION_EMAIL_PATTERN    // "notification.email.*.*"
MessagingConstants.ORDER_ALL_PATTERN             // "order.*.*.*"
```

---

## 🔄 **Routing Key Examples**

### **Format: `{entity}.{action}.{status}.{service}`**

```java
// User events
"user.created.inactive.auth"         // New user registration
"user.activated.active.auth"         // User activation
"user.updated.active.user-service"   // Profile update

// Order events  
"order.created.pending.order-service"    // New order
"order.confirmed.processing.order-service" // Order confirmation
"order.shipped.transit.shipping-service"   // Order shipped

// Notifications
"notification.email.welcome.active"     // Welcome email
"notification.sms.verification.pending" // Verification SMS
"notification.push.order.completed"     // Order completion push

// Payments
"payment.initiated.pending.payment-service"  // Payment started
"payment.completed.success.payment-service"  // Payment success
"payment.failed.error.payment-service"       // Payment failure
```

---

## 🎯 **Message Types Reference**

### **User Domain (15 types)**
```java
MessageType.USER_CREATED             MessageType.USER_ACTIVATED
MessageType.USER_UPDATED             MessageType.USER_DEACTIVATED  
MessageType.USER_DELETED             MessageType.USER_VERIFIED
MessageType.USER_LOGIN_SUCCESS       MessageType.USER_LOGIN_FAILED
MessageType.USER_LOGOUT              MessageType.USER_SESSION_EXPIRED
MessageType.USER_PASSWORD_CHANGED    MessageType.USER_EMAIL_CHANGED
MessageType.USER_PHONE_CHANGED       MessageType.USER_PROFILE_UPDATED
MessageType.USER_PREFERENCES_UPDATED
```

### **Order Domain (12 types)**
```java
MessageType.ORDER_CREATED            MessageType.ORDER_CONFIRMED
MessageType.ORDER_UPDATED            MessageType.ORDER_SHIPPED
MessageType.ORDER_CANCELLED          MessageType.ORDER_DELIVERED
MessageType.ORDER_RETURNED           MessageType.ORDER_REFUNDED
MessageType.ORDER_PAYMENT_PENDING    MessageType.ORDER_PAYMENT_COMPLETED
MessageType.ORDER_PAYMENT_FAILED     MessageType.ORDER_STATUS_CHANGED
```

### **Notification Domain (7 types)**
```java
MessageType.NOTIFICATION_EMAIL       MessageType.NOTIFICATION_SMS
MessageType.NOTIFICATION_PUSH        MessageType.NOTIFICATION_IN_APP
MessageType.NOTIFICATION_WEBHOOK     MessageType.NOTIFICATION_SCHEDULED
MessageType.NOTIFICATION_DELIVERED
```

### **Priority Levels**
```java
MessagePriority.EMERGENCY(5)    // System failures, security breaches
MessagePriority.CRITICAL(4)     // Payment issues, order problems  
MessagePriority.HIGH(3)         // User registration, welcome emails
MessagePriority.NORMAL(2)       // Status updates, general notifications
MessagePriority.LOW(1)          // Analytics, reports
```

---

## 🛠️ **Advanced Usage**

### **Custom Routing Keys**
```java
// Build custom routing keys
String customKey = RoutingKeyBuilder.build("inventory", "updated", "low", "inventory-service");
// Result: "inventory.updated.low.inventory-service"

// Parse routing keys
RoutingKeyBuilder.RoutingKeyComponents components = RoutingKeyBuilder.parse(routingKey);
String entity = components.getEntity();   // "inventory"
String action = components.getAction();   // "updated" 
String status = components.getStatus();   // "low"
String service = components.getService(); // "inventory-service"
```

### **Priority Messages**
```java
// Critical system alert
messageProducer.sendCriticalMessage(
    MessagingConstants.SYSTEM_EVENTS_EXCHANGE,
    "system.alert.critical.monitoring",
    alertPayload
);

// High priority welcome email
messageProducer.sendNotification(
    "email", "welcome", "active", 
    emailPayload, 
    MessagePriority.HIGH
);
```

### **Message with Retry**
```java
// Send with custom retry count
messageProducer.sendMessageWithRetry(
    MessagingConstants.ORDER_EVENTS_EXCHANGE,
    "order.payment.retry.payment-service",
    paymentPayload,
    5  // max retries
);
```

### **Request/Response Pattern**
```java
// Send request and wait for response
BaseRequest request = BaseRequest.builder()
    .requestType(RequestType.CREATE_USER)
    .sourceService("auth-service")
    .targetService("user-service")
    .payload(userRequest)
    .build();

messageProducer.sendRequest(MessagingConstants.USER_REQUEST_EXCHANGE, request);
```

---

## 🔍 **Debugging & Monitoring**

### **Message Tracing**
```java
@RabbitListener(queues = MessagingConstants.USER_NOTIFICATIONS_QUEUE)
public void handleMessage(UserEventPayload payload, Message message) {
    String routingKey = message.getMessageProperties().getReceivedRoutingKey();
    String exchange = message.getMessageProperties().getReceivedExchange();
    String queue = message.getMessageProperties().getConsumerQueue();
    
    log.info("📧 Received message:");
    log.info("📧 Exchange: {}", exchange);
    log.info("📧 Routing Key: {}", routingKey);
    log.info("📧 Queue: {}", queue);
    log.info("📧 Payload: {}", payload);
}
```

### **Health Checks**
```java
@Component
public class MessagingHealthIndicator implements HealthIndicator {
    private final RabbitTemplate rabbitTemplate;
    
    @Override
    public Health health() {
        try {
            rabbitTemplate.convertAndSend(
                MessagingConstants.SYSTEM_EVENTS_EXCHANGE,
                "system.health.check.monitoring",
                "ping"
            );
            return Health.up().withDetail("messaging", "operational").build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}
```

---

## ⚠️ **Common Patterns & Best Practices**

### **✅ DO**
```java
// Use constants for queue names
@RabbitListener(queues = MessagingConstants.USER_NOTIFICATIONS_QUEUE)

// Use builders for payloads
UserEventPayload payload = UserEventPayload.builder()
    .userId(userId)
    .eventType(UserEventType.CREATED)
    .build();

// Add proper error handling
try {
    messageProducer.sendUserEvent("created", "active", "my-service", payload);
} catch (Exception e) {
    log.error("Failed to send message: {}", e.getMessage(), e);
}

// Use appropriate priority levels
messageProducer.sendCriticalMessage(exchange, routingKey, criticalData);
```

### **❌ DON'T**
```java
// Don't use hardcoded strings
@RabbitListener(queues = "user.notifications.queue") // ❌

// Don't ignore exceptions
messageProducer.sendUserEvent("created", "active", "service", payload); // ❌

// Don't create manual bean definitions for infrastructure
@Bean
public Queue userQueue() { ... } // ❌ Use UniversalMessagingConfig

// Don't use wrong priority for message types
messageProducer.sendCriticalMessage(exchange, routingKey, analyticsData); // ❌
```

---

## 🚨 **Troubleshooting Checklist**

### **Message Not Delivered**
1. ✅ Check if `@Import(UniversalMessagingConfig.class)` is present
2. ✅ Verify routing key pattern matches queue bindings  
3. ✅ Ensure exchange and queue exist
4. ✅ Check consumer is running and listening to correct queue
5. ✅ Verify message format is correct
6. ✅ Check dead letter queue for failed messages

### **Bean Injection Issues** 
1. ✅ Add `UniversalMessageProducer` bean in configuration
2. ✅ Remove duplicate bean definitions 
3. ✅ Ensure `@RequiredArgsConstructor` is used correctly
4. ✅ Check if service is annotated with `@Service` or `@Component`

### **Performance Issues**
1. ✅ Check queue depths in RabbitMQ management UI
2. ✅ Monitor consumer processing times
3. ✅ Verify appropriate message priorities are used
4. ✅ Check if prefetch count needs adjustment
5. ✅ Scale consumers if queue depth is consistently high

---

## 📞 **Quick Links**

- 📚 [Complete Documentation](./common-messaging-v1.2.0-complete-guide)
- 📊 [Visual Diagrams](./common-messaging-v1.2.0-diagrams)  
- 🔧 [Configuration Fix Guide](./rabbitmq-config-files-fixed)
- 🐰 [RabbitMQ Management UI](http://localhost:15672) (dev)
- 📈 [Grafana Dashboard](http://localhost:3000) (monitoring)

---

**Version**: 1.2.0 | **Last Updated**: November 2, 2025 | **Status**: Production Ready ✅
