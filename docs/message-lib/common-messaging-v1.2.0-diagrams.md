---
sidebar_position: 30
title: Visual Diagrams & Charts
description: Comprehensive visual diagrams and Mermaid charts for Common Messaging v1.2.0 architecture and flows
---

# 📊 Common Messaging v1.2.0 - Visual Diagrams & Charts

## 🎯 **Overview**

This document provides comprehensive visual diagrams for the Common Messaging Library v1.2.0, including architecture flows, deployment patterns, and troubleshooting guides.

---

## 🏗️ **System Architecture Diagrams**

### **1. Complete YaniQ Microservices Messaging Architecture**

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App]
        MOBILE[Mobile App]
        API[API Gateway]
    end
    
    subgraph "Authentication & Authorization"
        AUTH[Auth Service]
        JWT[JWT Validator]
    end
    
    subgraph "Core Business Services"
        USER[User Service]
        ORDER[Order Service]
        PAYMENT[Payment Service]
        PRODUCT[Product Service]
        INVENTORY[Inventory Service]
    end
    
    subgraph "Support Services"
        NOTIFICATION[Notification Service]
        ANALYTICS[Analytics Service]
        AUDIT[Audit Service]
        FILE[File Service]
    end
    
    subgraph "Messaging Infrastructure (Common-Messaging v1.2.0)"
        RMQ[RabbitMQ Cluster]
        subgraph "Exchanges"
            UE[user.events.exchange]
            OE[order.events.exchange]
            PE[payment.events.exchange]
            NE[notification.events.exchange]
            SE[system.events.exchange]
            DLX[dlx.exchange]
        end
        subgraph "Queues"
            UQ[user.notifications.queue]
            EQ[email.notifications.queue]
            SQ[sms.notifications.queue]
            PQ[push.notifications.queue]
            AQ[analytics.queue]
            DLQ[dlx.queue]
        end
    end
    
    subgraph "External Services"
        EMAIL[Email Provider<br/>SendGrid/AWS SES]
        SMS[SMS Provider<br/>Twilio]
        PUSH[Push Service<br/>Firebase]
    end
    
    WEB --> API
    MOBILE --> API
    API --> AUTH
    AUTH --> JWT
    
    AUTH -.->|publishes| UE
    ORDER -.->|publishes| OE
    PAYMENT -.->|publishes| PE
    
    UE --> UQ
    NE --> EQ
    NE --> SQ
    NE --> PQ
    
    UQ --> NOTIFICATION
    EQ --> EMAIL
    SQ --> SMS
    PQ --> PUSH
    
    AUTH --> USER
    ORDER --> PAYMENT
    ORDER --> INVENTORY
    
    NOTIFICATION -.->|publishes| NE
    ANALYTICS -.->|consumes| AQ
    
    UE -.->|failed msgs| DLX
    OE -.->|failed msgs| DLX
    PE -.->|failed msgs| DLX
    DLX --> DLQ
    
    style RMQ fill:#ff9800
    style UE fill:#fff3e0
    style OE fill:#fff3e0
    style PE fill:#fff3e0
    style NE fill:#fff3e0
    style NOTIFICATION fill:#e8f5e8
    style AUTH fill:#e1f5fe
```

### **2. Message Flow State Diagram**

```mermaid
stateDiagram-v2
    [*] --> Published
    
    Published --> Routed : Exchange routing
    Published --> Failed : Routing failed
    
    Routed --> Queued : Queue available
    Routed --> Failed : Queue full/unavailable
    
    Queued --> Processing : Consumer available
    Queued --> Expired : TTL exceeded
    
    Processing --> Acknowledged : Success
    Processing --> Retry : Transient failure
    Processing --> Failed : Permanent failure
    
    Retry --> Processing : Retry attempt
    Retry --> Failed : Max retries exceeded
    
    Failed --> DeadLetter : Send to DLX
    Expired --> DeadLetter : Send to DLX
    
    DeadLetter --> ManualReview : Admin investigation
    ManualReview --> Republished : Issue resolved
    ManualReview --> Archived : Cannot recover
    
    Acknowledged --> [*]
    Republished --> Published
    Archived --> [*]
    
    note right of Processing
        Max 3 retry attempts
        Exponential backoff
    end note
    
    note right of DeadLetter
        Dead Letter Exchange
        Manual intervention required
    end note
```

### **3. User Registration Complete Flow**

```mermaid
flowchart TD
    A[User Submits Registration] --> B[Gateway Service]
    B --> C[Auth Service]
    
    C --> D{Validate Input}
    D -->|Invalid| E[Return Validation Error]
    D -->|Valid| F[Create Auth User]
    
    F --> G[Hash Password & Store]
    G --> H[Generate User ID]
    
    H --> I[UniversalMessageProducer<br/>sendUserEvent]
    I --> J[user.events.exchange]
    
    J --> K[user.request.queue]
    J --> L[user.notifications.queue]
    
    K --> M[User Service<br/>UserAccountMessageHandler]
    M --> N[Create User Profile]
    N --> O[Create User Account]
    O --> P[Link Auth User ID]
    P --> Q[Return Success Response]
    
    L --> R[Notification Service<br/>UserEventHandler]
    R --> S[Create Email Notification]
    R --> T[Create SMS Notification]
    R --> U[Create Push Notification]
    
    S --> V[notification.events.exchange<br/>notification.email.welcome.active]
    T --> W[notification.events.exchange<br/>notification.sms.welcome.active]
    U --> X[notification.events.exchange<br/>notification.push.welcome.active]
    
    V --> Y[email.notifications.queue]
    W --> Z[sms.notifications.queue]
    X --> AA[push.notifications.queue]
    
    Y --> BB[EmailNotificationHandler]
    Z --> CC[SmsNotificationHandler]
    AA --> DD[PushNotificationHandler]
    
    BB --> EE[SendGrid/AWS SES]
    CC --> FF[Twilio SMS]
    DD --> GG[Firebase Push]
    
    Q --> HH[Auth Service Response]
    HH --> II[Gateway Response]
    II --> JJ[User Receives Confirmation]
    
    EE --> KK[User Receives Welcome Email]
    FF --> LL[User Receives Welcome SMS]
    GG --> MM[User Receives Push Notification]
    
    style I fill:#e1f5fe
    style R fill:#e8f5e8
    style J fill:#fff3e0
    style V fill:#fff3e0
    style W fill:#fff3e0
    style X fill:#fff3e0
```

---

## 🔄 **Component Interaction Diagrams**

### **4. UniversalMessageProducer Internal Flow**

```mermaid
flowchart TD
    A[Service Method Call] --> B[UniversalMessageProducer]
    
    B --> C{Message Type Check}
    C -->|User Event| D[sendUserEvent()]
    C -->|Notification| E[sendNotification()]
    C -->|Order Event| F[sendOrderEvent()]
    C -->|Custom| G[sendMessage()]
    
    D --> H[RoutingKeyBuilder.buildUserEvent()]
    E --> I[RoutingKeyBuilder.buildNotificationEvent()]
    F --> J[RoutingKeyBuilder.buildOrderEvent()]
    G --> K[RoutingKeyBuilder.build()]
    
    H --> L[Add Headers<br/>- messageId<br/>- timestamp<br/>- priority<br/>- retryCount]
    I --> L
    J --> L
    K --> L
    
    L --> M{Priority Check}
    M -->|EMERGENCY| N[Immediate Processing]
    M -->|CRITICAL| O[High Priority Queue]
    M -->|NORMAL| P[Standard Processing]
    M -->|LOW| Q[Batch Processing]
    
    N --> R[RabbitTemplate.convertAndSend()]
    O --> R
    P --> R
    Q --> R
    
    R --> S{Confirm Callback}
    S -->|ACK| T[Message Delivered Successfully]
    S -->|NACK| U[Delivery Failed]
    
    U --> V[Log Error & Trigger Retry]
    V --> W[Exponential Backoff]
    W --> R
    
    T --> X[Update Metrics]
    X --> Y[Return Success]
    
    style B fill:#e1f5fe
    style H fill:#fff3e0
    style I fill:#fff3e0
    style J fill:#fff3e0
    style K fill:#fff3e0
    style R fill:#ffecb3
```

### **5. RabbitMQ Queue Binding Strategy**

```mermaid
graph LR
    subgraph "Topic Exchanges"
        UE[user.events.exchange]
        NE[notification.events.exchange]
        OE[order.events.exchange]
        PE[payment.events.exchange]
        SE[system.events.exchange]
    end
    
    subgraph "Routing Patterns"
        UP1[user.created.*.*]
        UP2[user.activated.*.*]
        UP3[user.deactivated.*.*]
        UP4[user.*.*.*]
        
        NP1[notification.email.*.*]
        NP2[notification.sms.*.*]
        NP3[notification.push.*.*]
        NP4[notification.webhook.*.*]
        
        OP1[order.created.*.*]
        OP2[order.confirmed.*.*]
        OP3[order.shipped.*.*]
        
        PP1[payment.initiated.*.*]
        PP2[payment.completed.*.*]
        PP3[payment.failed.*.*]
        
        SP1[system.health.*.*]
        SP2[system.error.*.*]
        SP3[system.*.*.*]
    end
    
    subgraph "Target Queues"
        UQ[user.notifications.queue]
        EQ[email.notifications.queue]
        SQ[sms.notifications.queue]
        PQ[push.notifications.queue]
        WQ[webhook.notifications.queue]
        OQ[order.processing.queue]
        PayQ[payment.processing.queue]
        AQ[analytics.queue]
        MQ[monitoring.queue]
        DLQ[dlx.queue]
    end
    
    UE -.->|UP1| UQ
    UE -.->|UP2| UQ
    UE -.->|UP3| UQ
    UE -.->|UP4| AQ
    
    NE -.->|NP1| EQ
    NE -.->|NP2| SQ
    NE -.->|NP3| PQ
    NE -.->|NP4| WQ
    
    OE -.->|OP1| OQ
    OE -.->|OP2| OQ
    OE -.->|OP3| OQ
    
    PE -.->|PP1| PayQ
    PE -.->|PP2| PayQ
    PE -.->|PP3| PayQ
    
    SE -.->|SP1| MQ
    SE -.->|SP2| MQ
    SE -.->|SP3| AQ
    
    style UE fill:#fff3e0
    style NE fill:#fff3e0
    style OE fill:#fff3e0
    style PE fill:#fff3e0
    style SE fill:#fff3e0
```

---

## 📊 **Performance & Monitoring Diagrams**

### **6. Message Processing Performance Flow**

```mermaid
gantt
    title Message Processing Timeline
    dateFormat X
    axisFormat %L ms
    
    section Message Journey
    Published to Exchange     :0, 5
    Routed to Queue          :5, 10
    Queue Wait Time          :10, 50
    Consumer Processing      :50, 200
    Business Logic           :200, 800
    Response Generation      :800, 850
    Acknowledgment           :850, 860
    
    section Error Scenarios
    Retry Attempt 1         :milestone, 1000
    Retry Attempt 2         :milestone, 2000
    Retry Attempt 3         :milestone, 4000
    Dead Letter Queue       :milestone, 8000
    
    section Priority Levels
    Emergency Processing    :crit, 0, 100
    Critical Processing     :active, 0, 200
    Normal Processing       :done, 0, 500
    Low Priority Batch      :0, 2000
```

### **7. System Health Monitoring Dashboard**

```mermaid
flowchart TD
    subgraph "Health Checks"
        HC1[RabbitMQ Connection]
        HC2[Queue Depths]
        HC3[Message Rates]
        HC4[Error Rates]
        HC5[Dead Letter Counts]
    end
    
    subgraph "Metrics Collection"
        M1[Prometheus Metrics]
        M2[Custom Gauges]
        M3[Timing Histograms]
        M4[Error Counters]
    end
    
    subgraph "Alerting"
        A1[Queue Depth > 1000]
        A2[Error Rate > 5%]
        A3[Processing Time > 5s]
        A4[Connection Failures]
    end
    
    subgraph "Dashboard Views"
        D1[Grafana Dashboard]
        D2[Service Health Page]
        D3[Real-time Monitoring]
        D4[Historical Trends]
    end
    
    HC1 --> M1
    HC2 --> M2
    HC3 --> M3
    HC4 --> M4
    
    M1 --> A1
    M2 --> A1
    M3 --> A3
    M4 --> A2
    
    A1 --> D1
    A2 --> D1
    A3 --> D1
    A4 --> D4
    
    M1 --> D2
    M2 --> D3
    M3 --> D3
    M4 --> D4
    
    style HC1 fill:#e8f5e8
    style HC2 fill:#e8f5e8
    style A1 fill:#ffcdd2
    style A2 fill:#ffcdd2
    style D1 fill:#e1f5fe
```

---

## 🚀 **Deployment Architecture Diagrams**

### **8. Kubernetes Deployment Strategy**

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Namespace: messaging"
            RMQ[RabbitMQ StatefulSet<br/>3 replicas]
            MGMT[RabbitMQ Management UI]
        end
        
        subgraph "Namespace: services"
            AUTH[Auth Service<br/>3 replicas]
            USER[User Service<br/>2 replicas]
            NOTIF[Notification Service<br/>5 replicas]
            ORDER[Order Service<br/>3 replicas]
        end
        
        subgraph "Namespace: monitoring"
            PROM[Prometheus]
            GRAF[Grafana]
            ALERT[AlertManager]
        end
        
        subgraph "ConfigMaps & Secrets"
            CM1[RabbitMQ Config]
            CM2[Service Configs]
            SEC1[RabbitMQ Credentials]
            SEC2[External API Keys]
        end
        
        subgraph "Services & Ingress"
            SVC1[RabbitMQ Service]
            SVC2[Auth Service]
            SVC3[Notification Service]
            ING[Ingress Controller]
        end
    end
    
    subgraph "External"
        LB[Load Balancer]
        DNS[DNS]
        USERS[Users]
    end
    
    USERS --> DNS
    DNS --> LB
    LB --> ING
    
    ING --> SVC2
    ING --> SVC3
    
    AUTH --> SVC1
    USER --> SVC1
    NOTIF --> SVC1
    ORDER --> SVC1
    
    SVC1 --> RMQ
    
    CM1 --> RMQ
    CM2 --> AUTH
    CM2 --> USER
    CM2 --> NOTIF
    
    SEC1 --> RMQ
    SEC2 --> NOTIF
    
    PROM --> AUTH
    PROM --> USER
    PROM --> NOTIF
    PROM --> RMQ
    
    GRAF --> PROM
    ALERT --> PROM
    
    style RMQ fill:#ff9800
    style AUTH fill:#e1f5fe
    style NOTIF fill:#e8f5e8
    style PROM fill:#fff3e0
```

### **9. Docker Compose Development Setup**

```mermaid
graph TD
    subgraph "Docker Compose Stack"
        subgraph "Infrastructure"
            RMQ[rabbitmq:3-management<br/>Port: 5672, 15672]
            PG[postgres:13<br/>Port: 5432]
            REDIS[redis:alpine<br/>Port: 6379]
        end
        
        subgraph "Services"
            DISC[discovery-service<br/>Port: 8761]
            GW[gateway-service<br/>Port: 8080]
            AUTH[auth-service<br/>Port: 8081]
            USER[user-service<br/>Port: 8082]
            NOTIF[notification-service<br/>Port: 8083]
        end
        
        subgraph "External Services (Mock)"
            EMAIL[mailhog<br/>Port: 8025]
            SMS[sms-mock<br/>Port: 3001]
        end
        
        subgraph "Volumes"
            V1[postgres_data]
            V2[rabbitmq_data]
            V3[redis_data]
        end
    end
    
    RMQ -.-> V2
    PG -.-> V1
    REDIS -.-> V3
    
    GW --> DISC
    AUTH --> DISC
    USER --> DISC
    NOTIF --> DISC
    
    AUTH --> RMQ
    USER --> RMQ
    NOTIF --> RMQ
    
    AUTH --> PG
    USER --> PG
    
    NOTIF --> EMAIL
    NOTIF --> SMS
    
    style RMQ fill:#ff9800
    style PG fill:#336791
    style REDIS fill:#dc382d
    style DISC fill:#6db33f
```

---

## 🔍 **Troubleshooting Flowcharts**

### **10. Message Not Delivered Troubleshooting**

```mermaid
flowchart TD
    A[Message Not Delivered] --> B{Check Publisher Logs}
    B -->|Error Found| C[Fix Publisher Issue]
    B -->|No Error| D{Check Exchange Exists}
    
    D -->|No| E[Create Missing Exchange]
    D -->|Yes| F{Check Routing Key}
    
    F -->|Wrong Pattern| G[Fix Routing Key Pattern]
    F -->|Correct| H{Check Queue Binding}
    
    H -->|No Binding| I[Create Queue Binding]
    H -->|Binding Exists| J{Check Queue Exists}
    
    J -->|No| K[Create Missing Queue]
    J -->|Yes| L{Check Consumer Running}
    
    L -->|No Consumer| M[Start Consumer Service]
    L -->|Consumer Running| N{Check Consumer Logs}
    
    N -->|Processing Error| O[Fix Consumer Logic]
    N -->|No Error| P{Check Message Format}
    
    P -->|Invalid Format| Q[Fix Message Serialization]
    P -->|Valid| R{Check Dead Letter Queue}
    
    R -->|Messages in DLQ| S[Investigate DLQ Messages]
    R -->|No Messages| T[Check RabbitMQ Connectivity]
    
    C --> U[Republish Message]
    E --> U
    G --> U
    I --> U
    K --> U
    M --> U
    O --> U
    Q --> U
    S --> V[Manual Message Recovery]
    T --> W[Fix Infrastructure]
    
    style A fill:#ffcdd2
    style U fill:#e8f5e8
    style V fill:#fff3e0
    style W fill:#ffecb3
```

### **11. Performance Issues Diagnostic**

```mermaid
flowchart TD
    A[Performance Issues Detected] --> B{Check Queue Depths}
    B -->|High| C[Scale Consumers]
    B -->|Normal| D{Check Processing Time}
    
    D -->|Slow| E{Check Business Logic}
    E -->|Complex| F[Optimize Business Logic]
    E -->|Simple| G{Check Database Performance}
    
    G -->|Slow Queries| H[Optimize Database Queries]
    G -->|Fast| I{Check External API Calls}
    
    I -->|Slow APIs| J[Implement Caching/Circuit Breaker]
    I -->|Fast| K{Check Message Size}
    
    K -->|Large| L[Reduce Message Payload]
    K -->|Small| M{Check Connection Pool}
    
    M -->|Exhausted| N[Increase Connection Pool Size]
    M -->|Available| O{Check Consumer Configuration}
    
    O -->|Low Prefetch| P[Increase Prefetch Count]
    O -->|Correct| Q{Check Resource Limits}
    
    Q -->|CPU/Memory High| R[Scale Infrastructure]
    Q -->|Normal| S[Advanced Profiling Required]
    
    D -->|Fast| T{Check Error Rates}
    T -->|High| U[Investigate Error Patterns]
    T -->|Low| V[Monitor Trends]
    
    C --> W[Monitor Improvements]
    F --> W
    H --> W
    J --> W
    L --> W
    N --> W
    P --> W
    R --> W
    
    style A fill:#ffcdd2
    style W fill:#e8f5e8
    style S fill:#fff3e0
    style U fill:#ffecb3
```

---

## 📈 **Capacity Planning Diagrams**

### **12. Load Testing Scenarios**

```mermaid
graph LR
    subgraph "Load Test Scenarios"
        L1[Normal Load<br/>1000 msg/sec]
        L2[Peak Load<br/>5000 msg/sec]
        L3[Burst Load<br/>10000 msg/sec]
        L4[Sustained Load<br/>3000 msg/sec for 1hr]
    end
    
    subgraph "Message Types"
        T1[User Registration<br/>20% of traffic]
        T2[Order Processing<br/>30% of traffic]
        T3[Notifications<br/>40% of traffic]
        T4[Analytics<br/>10% of traffic]
    end
    
    subgraph "Expected Behavior"
        B1[< 100ms processing]
        B2[< 1000 messages in queue]
        B3[< 1% error rate]
        B4[Auto-scaling triggers]
    end
    
    subgraph "Failure Scenarios"
        F1[Single Consumer Down]
        F2[Database Unavailable]
        F3[RabbitMQ Node Failure]
        F4[Network Partition]
    end
    
    L1 --> T1
    L1 --> T2
    L1 --> T3
    L1 --> T4
    
    L2 --> B1
    L2 --> B2
    L2 --> B3
    L3 --> B4
    
    L4 --> F1
    L4 --> F2
    L4 --> F3
    L4 --> F4
    
    style L1 fill:#e8f5e8
    style L2 fill:#fff3e0
    style L3 fill:#ffecb3
    style L4 fill:#ffcdd2
```

### **13. Scaling Strategy Decision Tree**

```mermaid
flowchart TD
    A[Performance Issues] --> B{Queue Depth > 1000?}
    B -->|Yes| C{Consumer CPU > 80%?}
    B -->|No| D{Response Time > 1s?}
    
    C -->|Yes| E[Scale Horizontally<br/>Add More Consumer Instances]
    C -->|No| F[Scale Vertically<br/>Increase Consumer Resources]
    
    D -->|Yes| G{Error Rate > 1%?}
    D -->|No| H[Monitor & Wait]
    
    G -->|Yes| I[Investigate Errors<br/>Check Dead Letter Queue]
    G -->|No| J[Optimize Business Logic]
    
    E --> K[Monitor Queue Reduction]
    F --> K
    J --> L[Performance Testing]
    I --> M[Fix Issues & Redeploy]
    
    K --> N{Performance Improved?}
    L --> N
    M --> N
    
    N -->|Yes| O[Update Scaling Policy]
    N -->|No| P[Consider Architecture Changes]
    
    O --> Q[Continue Monitoring]
    P --> R[Design Review Required]
    
    style A fill:#ffcdd2
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style I fill:#fff3e0
    style O fill:#e8f5e8
    style R fill:#ffecb3
```

---

## 🔐 **Security & Compliance Diagrams**

### **14. Message Security Flow**

```mermaid
sequenceDiagram
    participant P as Publisher Service
    participant MQ as RabbitMQ
    participant C as Consumer Service
    participant A as Audit Service
    participant S as Security Monitor
    
    Note over P,S: Secure Message Flow
    
    P->>P: Validate Payload
    P->>P: Add Security Headers
    P->>P: Encrypt Sensitive Data
    
    P->>+MQ: Publish Message (TLS)
    MQ->>MQ: Authenticate Publisher
    MQ->>MQ: Authorize Exchange Access
    MQ->>MQ: Store Message (Encrypted)
    
    MQ->>A: Log Message Event
    MQ->>S: Security Event
    
    MQ->>+C: Deliver Message (TLS)
    C->>C: Authenticate Consumer
    C->>C: Authorize Queue Access
    C->>C: Decrypt Sensitive Data
    C->>C: Validate Message Integrity
    
    C->>A: Log Processing Event
    C->>S: Compliance Event
    
    C-->>MQ: Acknowledge
    MQ-->>-P: Confirm Delivery
    
    Note over A: Audit Trail Created
    Note over S: Security Monitoring Active
```

### **15. Compliance & Audit Trail**

```mermaid
graph TB
    subgraph "Message Lifecycle"
        M1[Message Created]
        M2[Message Published]
        M3[Message Routed]
        M4[Message Consumed]
        M5[Message Processed]
        M6[Message Acknowledged]
    end
    
    subgraph "Audit Events"
        A1[Creation Audit]
        A2[Publication Audit]
        A3[Routing Audit]
        A4[Consumption Audit]
        A5[Processing Audit]
        A6[Completion Audit]
    end
    
    subgraph "Compliance Requirements"
        C1[Data Retention<br/>7 years]
        C2[PII Encryption<br/>AES-256]
        C3[Access Logging<br/>All operations]
        C4[Integrity Validation<br/>Message hashing]
    end
    
    subgraph "Audit Storage"
        DB1[Audit Database]
        ES[Elasticsearch]
        S3[Archive Storage]
    end
    
    M1 --> A1
    M2 --> A2
    M3 --> A3
    M4 --> A4
    M5 --> A5
    M6 --> A6
    
    A1 --> DB1
    A2 --> DB1
    A3 --> ES
    A4 --> ES
    A5 --> ES
    A6 --> DB1
    
    C1 --> S3
    C2 --> A1
    C3 --> ES
    C4 --> A5
    
    DB1 --> S3
    ES --> S3
    
    style M1 fill:#e1f5fe
    style A1 fill:#fff3e0
    style C1 fill:#e8f5e8
    style S3 fill:#ffecb3
```

---

## 📊 **Version Comparison Chart**

### **16. Feature Evolution: v1.0.0 → v1.2.0**

```mermaid
timeline
    title Common Messaging Library Evolution
    
    section v1.0.0 (Initial Release)
        Basic RabbitMQ Support : Manual Queue Creation
                               : Custom Routing Keys
                               : Limited Error Handling
        
    section v1.1.0 (Enhancement)
        Enhanced Producer : EnhancedMessageProducer
                          : Basic Routing Patterns
                          : Simple Retry Logic
        
    section v1.2.0 (Major Upgrade)
        Universal Infrastructure : UniversalMessagingConfig
                                 : 67 Message Types
                                 : 46 Request Types
                                 : RoutingKeyBuilder
                                 : Dead Letter Queues
                                 : Priority-based Processing
                                 : Comprehensive Error Handling
                                 : Zero Bean Conflicts
                                 : Complete Documentation
```

---

## 🎯 **Quick Reference Diagrams**

### **17. Routing Key Pattern Reference**

```mermaid
block-beta
    columns 4
    
    block:Entity
        User["user"]
        Order["order"]
        Payment["payment"]
        Notification["notification"]
        System["system"]
        Analytics["analytics"]
    end
    
    block:Action
        Created["created"]
        Updated["updated"]
        Deleted["deleted"]
        Activated["activated"]
        Confirmed["confirmed"]
        Failed["failed"]
    end
    
    block:Status
        Active["active"]
        Inactive["inactive"]
        Pending["pending"]
        Processing["processing"]
        Completed["completed"]
        Error["error"]
    end
    
    block:Service
        Auth["auth"]
        UserSvc["user-service"]
        OrderSvc["order-service"]
        NotifSvc["notification"]
        Gateway["gateway"]
        Analytics["analytics"]
    end
    
    Entity --> Action
    Action --> Status
    Status --> Service
    
    classDef entity fill:#e1f5fe
    classDef action fill:#fff3e0
    classDef status fill:#e8f5e8
    classDef service fill:#ffecb3
    
    class User,Order,Payment,Notification,System,Analytics entity
    class Created,Updated,Deleted,Activated,Confirmed,Failed action
    class Active,Inactive,Pending,Processing,Completed,Error status
    class Auth,UserSvc,OrderSvc,NotifSvc,Gateway,Analytics service
```

### **18. Message Priority Processing**

```mermaid
graph LR
    subgraph "Message Priorities"
        P1[EMERGENCY<br/>Level 5]
        P2[CRITICAL<br/>Level 4]
        P3[HIGH<br/>Level 3]
        P4[NORMAL<br/>Level 2]
        P5[LOW<br/>Level 1]
    end
    
    subgraph "Processing Queues"
        Q1[Emergency Queue<br/>Immediate Processing]
        Q2[Critical Queue<br/>< 1 second]
        Q3[High Queue<br/>< 5 seconds]
        Q4[Normal Queue<br/>< 30 seconds]
        Q5[Low Queue<br/>Batch Processing]
    end
    
    subgraph "Use Cases"
        U1[System Failures<br/>Security Breaches]
        U2[Payment Issues<br/>Order Problems]
        U3[User Registration<br/>Welcome Emails]
        U4[Status Updates<br/>General Notifications]
        U5[Analytics<br/>Reports]
    end
    
    P1 --> Q1
    P2 --> Q2
    P3 --> Q3
    P4 --> Q4
    P5 --> Q5
    
    Q1 --> U1
    Q2 --> U2
    Q3 --> U3
    Q4 --> U4
    Q5 --> U5
    
    style P1 fill:#ffcdd2
    style P2 fill:#ffecb3
    style P3 fill:#fff3e0
    style P4 fill:#e8f5e8
    style P5 fill:#e1f5fe
```

---

## 📝 **Summary**

This comprehensive visual documentation provides detailed diagrams for:

- ✅ **System Architecture** - Complete messaging infrastructure overview
- ✅ **Message Flows** - Step-by-step process diagrams
- ✅ **Component Interactions** - Internal library workflows
- ✅ **Performance Monitoring** - Metrics and health checks
- ✅ **Deployment Strategies** - Kubernetes and Docker Compose
- ✅ **Troubleshooting Guides** - Problem resolution flowcharts
- ✅ **Security & Compliance** - Audit trails and security flows
- ✅ **Quick References** - Routing patterns and priorities

These diagrams complement the main documentation and provide visual guidance for implementing, maintaining, and troubleshooting the Common Messaging Library v1.2.0 in production environments.

**Last Updated**: November 2, 2025  
**Version**: 1.2.0  
**Status**: Production Ready ✅
