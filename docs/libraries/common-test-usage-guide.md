# Common-Test Library - Complete Usage Guide

## Overview

The `common-test` library provides testing utilities, base test classes, test containers, mock data builders, and testing best practices for all YaniQ microservices. It ensures consistent and comprehensive testing across the platform.

---

## Version Information

- **Current Version:** `1.0.0`
- **Java Version:** `21`
- **Group ID:** `com.yaniq`
- **Artifact ID:** `common-test`
- **Last Updated:** October 2025

---

## Why Use Common-Test?

### 🧪 **Comprehensive Testing**
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete workflows
- **Contract Tests**: Verify API contracts

### 🐳 **TestContainers Integration**
- **Real Dependencies**: Test with actual databases, message brokers
- **Isolated Environments**: Each test gets fresh containers
- **No Mock Limitations**: Test real scenarios
- **Easy Cleanup**: Containers removed after tests

### 🏗️ **Test Data Builders**
- **Fluent API**: Build test data easily
- **Reusable Fixtures**: Share test data across tests
- **Realistic Data**: Generate valid test objects
- **Randomization**: Create varied test scenarios

### ⚡ **Testing Best Practices**
- **Fast Tests**: Optimized for quick feedback
- **Reliable Tests**: Deterministic and repeatable
- **Maintainable Tests**: Clean and organized
- **Documentation**: Tests as living documentation

---

## Installation

### Maven Dependency

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-test</artifactId>
    <version>1.0.0</version>
    <scope>test</scope>
</dependency>
```

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `junit-jupiter` | 5.10.0 | JUnit 5 testing framework |
| `mockito-core` | 5.5.0 | Mocking framework |
| `testcontainers` | 1.19.0 | Docker container management |
| `spring-boot-starter-test` | 3.3.0 | Spring testing support |
| `rest-assured` | 5.3.0 | API testing |

---

## Core Components (To Be Implemented)

### 1. Base Test Classes
- `BaseUnitTest` - Unit test base
- `BaseIntegrationTest` - Integration test base
- `BaseE2ETest` - End-to-end test base

### 2. Test Containers
- `PostgresTestContainer`
- `MongoTestContainer`
- `KafkaTestContainer`
- `RedisTestContainer`

### 3. Test Data Builders
- `UserTestBuilder`
- `ProductTestBuilder`
- `OrderTestBuilder`

### 4. Test Utilities
- `TestDataGenerator`
- `MockBuilder`
- `AssertionHelpers`

---

## Usage Examples

### 1. Unit Testing

#### Simple Unit Test

```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    
    @Mock
    private ProductRepository productRepository;
    
    @InjectMocks
    private ProductService productService;
    
    @Test
    @DisplayName("Should create product successfully")
    void testCreateProduct() {
        // Given
        ProductRequest request = ProductRequest.builder()
            .name("Test Product")
            .price(new BigDecimal("29.99"))
            .build();
        
        Product savedProduct = Product.builder()
            .id(1L)
            .name("Test Product")
            .price(new BigDecimal("29.99"))
            .build();
        
        when(productRepository.save(any(Product.class)))
            .thenReturn(savedProduct);
        
        // When
        Product result = productService.create(request);
        
        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Product", result.getName());
        verify(productRepository).save(any(Product.class));
    }
    
    @Test
    @DisplayName("Should throw exception when product not found")
    void testProductNotFound() {
        // Given
        Long nonExistentId = 999L;
        when(productRepository.findById(nonExistentId))
            .thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(NotFoundException.class, 
            () -> productService.findById(nonExistentId));
    }
}
```

#### Parameterized Tests

```java
class PriceCalculatorTest {
    
    @ParameterizedTest
    @CsvSource({
        "100.00, 10, 90.00",
        "50.00, 20, 40.00",
        "200.00, 15, 170.00"
    })
    @DisplayName("Should calculate discounted price correctly")
    void testDiscountCalculation(BigDecimal original, int discount, BigDecimal expected) {
        // When
        BigDecimal result = PriceCalculator.applyDiscount(original, discount);
        
        // Then
        assertEquals(expected, result);
    }
    
    @ParameterizedTest
    @MethodSource("provideProductPrices")
    void testBulkDiscount(BigDecimal price, int quantity, BigDecimal expected) {
        BigDecimal result = PriceCalculator.calculateBulkPrice(price, quantity);
        assertEquals(expected, result);
    }
    
    static Stream<Arguments> provideProductPrices() {
        return Stream.of(
            Arguments.of(new BigDecimal("10.00"), 5, new BigDecimal("50.00")),
            Arguments.of(new BigDecimal("15.00"), 10, new BigDecimal("135.00")),
            Arguments.of(new BigDecimal("20.00"), 20, new BigDecimal("360.00"))
        );
    }
}
```

### 2. Integration Testing with TestContainers

#### PostgreSQL Integration Test

```java
@SpringBootTest
@Testcontainers
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:tc:postgresql:15:///testdb"
})
class ProductRepositoryIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
        "postgres:15-alpine"
    )
    .withDatabaseName("testdb")
    .withUsername("test")
    .withPassword("test");
    
    @Autowired
    private ProductRepository productRepository;
    
    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }
    
    @Test
    @DisplayName("Should save and retrieve product")
    void testSaveAndRetrieve() {
        // Given
        Product product = Product.builder()
            .name("Test Product")
            .price(new BigDecimal("29.99"))
            .build();
        
        // When
        Product saved = productRepository.save(product);
        Optional<Product> retrieved = productRepository.findById(saved.getId());
        
        // Then
        assertTrue(retrieved.isPresent());
        assertEquals("Test Product", retrieved.get().getName());
    }
    
    @Test
    @DisplayName("Should find products by price range")
    void testFindByPriceRange() {
        // Given
        productRepository.saveAll(List.of(
            Product.builder().name("Cheap").price(new BigDecimal("10.00")).build(),
            Product.builder().name("Medium").price(new BigDecimal("50.00")).build(),
            Product.builder().name("Expensive").price(new BigDecimal("100.00")).build()
        ));
        
        // When
        List<Product> results = productRepository.findByPriceBetween(
            new BigDecimal("20.00"),
            new BigDecimal("80.00")
        );
        
        // Then
        assertEquals(1, results.size());
        assertEquals("Medium", results.get(0).getName());
    }
}
```

#### Kafka Integration Test

```java
@SpringBootTest
@Testcontainers
class OrderEventPublisherIntegrationTest {
    
    @Container
    static KafkaContainer kafka = new KafkaContainer(
        DockerImageName.parse("confluentinc/cp-kafka:7.4.0")
    );
    
    @DynamicPropertySource
    static void kafkaProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }
    
    @Autowired
    private OrderEventPublisher eventPublisher;
    
    @Autowired
    private KafkaTemplate<String, OrderEvent> kafkaTemplate;
    
    @Test
    void testPublishOrderCreatedEvent() throws Exception {
        // Given
        OrderEvent event = OrderEvent.builder()
            .orderId("ORD-123")
            .userId("USER-456")
            .status(OrderStatus.CREATED)
            .build();
        
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<OrderEvent> receivedEvent = new AtomicReference<>();
        
        // Subscribe to topic
        kafkaTemplate.setConsumerFactory(consumerFactory);
        Consumer<String, OrderEvent> consumer = consumerFactory.createConsumer();
        consumer.subscribe(List.of("order-events"));
        
        // When
        eventPublisher.publishOrderCreated(event);
        
        // Poll for message
        ConsumerRecords<String, OrderEvent> records = consumer.poll(Duration.ofSeconds(10));
        records.forEach(record -> {
            receivedEvent.set(record.value());
            latch.countDown();
        });
        
        // Then
        assertTrue(latch.await(10, TimeUnit.SECONDS));
        assertEquals("ORD-123", receivedEvent.get().getOrderId());
    }
}
```

### 3. REST API Testing

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class ProductControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateProduct() throws Exception {
        // Given
        ProductRequest request = ProductRequest.builder()
            .name("Test Product")
            .price(new BigDecimal("29.99"))
            .build();
        
        String requestJson = objectMapper.writeValueAsString(request);
        
        // When & Then
        mockMvc.perform(post("/api/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.name").value("Test Product"))
            .andExpect(jsonPath("$.data.price").value(29.99));
    }
    
    @Test
    void testGetProductWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/products/1"))
            .andExpect(status().isUnauthorized());
    }
}
```

#### RestAssured API Testing

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class ProductApiTest {
    
    @LocalServerPort
    private int port;
    
    @BeforeEach
    void setUp() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;
    }
    
    @Test
    void testGetAllProducts() {
        given()
            .header("Authorization", "Bearer " + getAuthToken())
        .when()
            .get("/api/v1/products")
        .then()
            .statusCode(200)
            .body("data", hasSize(greaterThan(0)))
            .body("data[0].name", notNullValue());
    }
    
    @Test
    void testCreateProduct() {
        ProductRequest request = ProductRequest.builder()
            .name("API Test Product")
            .price(new BigDecimal("49.99"))
            .build();
        
        given()
            .header("Authorization", "Bearer " + getAuthToken())
            .contentType(ContentType.JSON)
            .body(request)
        .when()
            .post("/api/v1/products")
        .then()
            .statusCode(201)
            .body("data.name", equalTo("API Test Product"))
            .body("data.id", notNullValue());
    }
}
```

### 4. Test Data Builders

```java
public class ProductTestBuilder {
    
    private Long id;
    private String name = "Test Product";
    private BigDecimal price = new BigDecimal("29.99");
    private String description = "Test Description";
    private String sku = "TEST-SKU-" + UUID.randomUUID().toString();
    
    public static ProductTestBuilder aProduct() {
        return new ProductTestBuilder();
    }
    
    public ProductTestBuilder withId(Long id) {
        this.id = id;
        return this;
    }
    
    public ProductTestBuilder withName(String name) {
        this.name = name;
        return this;
    }
    
    public ProductTestBuilder withPrice(BigDecimal price) {
        this.price = price;
        return this;
    }
    
    public ProductTestBuilder withRandomData() {
        this.name = "Product-" + UUID.randomUUID().toString();
        this.price = new BigDecimal(ThreadLocalRandom.current().nextDouble(10, 1000));
        this.sku = "SKU-" + UUID.randomUUID().toString();
        return this;
    }
    
    public Product build() {
        return Product.builder()
            .id(id)
            .name(name)
            .price(price)
            .description(description)
            .sku(sku)
            .build();
    }
}

// Usage
@Test
void testWithBuilder() {
    Product product = ProductTestBuilder.aProduct()
        .withName("Custom Product")
        .withPrice(new BigDecimal("99.99"))
        .build();
    
    assertNotNull(product);
    assertEquals("Custom Product", product.getName());
}

@Test
void testWithRandomData() {
    Product product1 = ProductTestBuilder.aProduct().withRandomData().build();
    Product product2 = ProductTestBuilder.aProduct().withRandomData().build();
    
    assertNotEquals(product1.getName(), product2.getName());
}
```

### 5. Mocking External Services

```java
@SpringBootTest
class PaymentServiceTest {
    
    @MockBean
    private PaymentGatewayClient paymentGateway;
    
    @Autowired
    private PaymentService paymentService;
    
    @Test
    void testSuccessfulPayment() {
        // Given
        PaymentRequest request = PaymentRequest.builder()
            .orderId("ORD-123")
            .amount(new BigDecimal("99.99"))
            .build();
        
        PaymentResponse gatewayResponse = PaymentResponse.builder()
            .transactionId("TXN-456")
            .status("SUCCESS")
            .build();
        
        when(paymentGateway.processPayment(any()))
            .thenReturn(gatewayResponse);
        
        // When
        Payment result = paymentService.processPayment(request);
        
        // Then
        assertEquals("TXN-456", result.getTransactionId());
        assertEquals(PaymentStatus.SUCCESS, result.getStatus());
        verify(paymentGateway).processPayment(any());
    }
}
```

---

## Testing Best Practices

### 1. Test Structure (AAA Pattern)

```java
@Test
void testOrderCalculation() {
    // Arrange (Given) - Setup test data
    Order order = new Order();
    order.addItem(new OrderItem("Product A", 2, new BigDecimal("10.00")));
    order.addItem(new OrderItem("Product B", 1, new BigDecimal("15.00")));
    
    // Act (When) - Execute the code being tested
    BigDecimal total = order.calculateTotal();
    
    // Assert (Then) - Verify the results
    assertEquals(new BigDecimal("35.00"), total);
}
```

### 2. Test Naming Conventions

```java
// Good naming conventions
@Test
void shouldCalculateTotalWhenOrderHasMultipleItems() { }

@Test
void shouldThrowExceptionWhenProductNotFound() { }

@Test
void givenEmptyCart_whenCheckout_thenReturnBadRequest() { }
```

### 3. Test Independence

```java
@TestMethodOrder(MethodOrderer.Random.class)
class ProductServiceTest {
    
    @BeforeEach
    void setUp() {
        // Reset state before each test
        productRepository.deleteAll();
    }
    
    @Test
    void test1() {
        // Should not depend on test2
    }
    
    @Test
    void test2() {
        // Should not depend on test1
    }
}
```

### 4. Testing Exceptions

```java
@Test
void shouldThrowExceptionForInvalidPrice() {
    // Using assertThrows
    BigDecimal invalidPrice = new BigDecimal("-10.00");
    
    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> productService.createProduct("Product", invalidPrice)
    );
    
    assertEquals("Price must be positive", exception.getMessage());
}
```

---

## Performance Testing

```java
@Test
@Timeout(value = 1, unit = TimeUnit.SECONDS)
void shouldCompleteWithinOneSecond() {
    // Test must complete within 1 second
    List<Product> products = productService.findAll();
    assertNotNull(products);
}

@RepeatedTest(100)
void shouldHandleRepeatedCalls() {
    // Test repeated 100 times to catch intermittent issues
    Product product = productService.findById(1L);
    assertNotNull(product);
}
```

---

## Test Coverage

### Generating Coverage Reports

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

Run tests with coverage:
```bash
mvn clean test
mvn jacoco:report
```

---

## Troubleshooting

### Tests Running Slowly

**Solutions:**
- Use `@DirtiesContext` sparingly
- Mock external dependencies
- Use in-memory databases for unit tests
- Parallelize test execution

### Flaky Tests

**Solutions:**
- Avoid Thread.sleep()
- Use Awaitility for async operations
- Make tests deterministic
- Fix timing dependencies

### TestContainers Issues

**Solutions:**
- Ensure Docker is running
- Increase container startup timeout
- Check resource limits
- Use lightweight container images

---

## Version History

### Version 1.0.0 (Current)
- ✅ Basic dependencies configured
- ⏳ Base test classes (planned)
- ⏳ TestContainers setup (planned)
- ⏳ Test data builders (planned)

### Planned Features (v1.1.0)
- Test utilities library
- Performance testing support
- Contract testing support
- Test documentation generator

---

## Related Libraries

- [common-api](./common-api.md) - API testing
- [common-messaging](./common-messaging.md) - Message testing
- [common-security](./common-security.md) - Security testing

---

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0

---

**Last Updated:** October 19, 2025  
**Maintainer:** Danukaji Hansanath
# Common-Security Library - Complete Usage Guide

## Overview

The `common-security` library provides security utilities, authentication/authorization components, JWT token management, and security configurations for all YaniQ microservices. It ensures consistent security practices across the entire platform.

---

## Version Information

- **Current Version:** `1.0.0`
- **Java Version:** `21`
- **Group ID:** `com.yaniq`
- **Artifact ID:** `common-security`
- **Last Updated:** October 2025

---

## Why Use Common-Security?

### 🔒 **Centralized Security**
- **Consistent Authentication**: Same authentication mechanism across all services
- **Unified Authorization**: Standardized role and permission management
- **Single Source of Truth**: Security configuration in one place
- **Easy Updates**: Update security policies globally

### 🛡️ **JWT Token Management**
- **Token Generation**: Create secure JWT tokens
- **Token Validation**: Verify token authenticity
- **Token Refresh**: Implement refresh token pattern
- **Claims Management**: Extract and validate token claims

### 👥 **Role-Based Access Control (RBAC)**
- **Hierarchical Roles**: Admin, User, Manager, etc.
- **Fine-Grained Permissions**: Resource-level access control
- **Dynamic Authorization**: Runtime permission checks
- **Method-Level Security**: @PreAuthorize, @Secured annotations

### 🔐 **Security Best Practices**
- **Password Hashing**: BCrypt, Argon2 support
- **CORS Configuration**: Cross-origin request handling
- **CSRF Protection**: Prevent cross-site request forgery
- **Rate Limiting**: Prevent brute force attacks
- **API Key Management**: Secure API key handling

---

## Installation

### Maven Dependency

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-security</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## Core Components (Planned/To Be Implemented)

### 1. JWT Token Service
- Token generation and validation
- Claims extraction
- Token refresh mechanism

### 2. Security Configuration
- Spring Security configuration
- CORS settings
- Authentication providers

### 3. User Details Service
- Load user information
- Map to Spring Security UserDetails

### 4. Security Context
- Get current user
- Check permissions
- Role verification

---

## Usage Examples

### 1. JWT Token Service

```java
@Service
@RequiredArgsConstructor
public class JwtTokenService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:3600000}") // 1 hour default
    private long jwtExpirationMs;
    
    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        
        return Jwts.builder()
            .setSubject(userPrincipal.getId().toString())
            .claim("email", userPrincipal.getEmail())
            .claim("roles", userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()))
            .setIssuedAt(now)
            .setExpirationAt(expiryDate)
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS512)
            .compact();
    }
    
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return claims.getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
```

### 2. Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://yaniq.com"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 3. JWT Authentication Filter

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtTokenService tokenService;
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = extractJwtFromRequest(request);
            
            if (jwt != null && tokenService.validateToken(jwt)) {
                String userId = tokenService.getUserIdFromToken(jwt);
                
                UserDetails userDetails = userDetailsService.loadUserById(userId);
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### 4. Custom User Details Service

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> 
                new UsernameNotFoundException("User not found with email: " + email));
        
        return UserPrincipal.create(user);
    }
    
    @Transactional
    public UserDetails loadUserById(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> 
                new UsernameNotFoundException("User not found with id: " + id));
        
        return UserPrincipal.create(user);
    }
}
```

### 5. User Principal

```java
@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {
    
    private String id;
    private String email;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    
    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
            .collect(Collectors.toList());
        
        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            authorities
        );
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
}
```

### 6. Authentication Controller

```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService tokenService;
    private final UserService userService;
    
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String token = tokenService.generateToken(authentication);
        String refreshToken = tokenService.generateRefreshToken(authentication);
        
        AuthResponse response = AuthResponse.builder()
            .accessToken(token)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(3600)
            .build();
        
        return ApiResponse.success(response, "Login successful");
    }
    
    @PostMapping("/register")
    public ApiResponse<UserDTO> register(@RequestBody @Valid RegisterRequest request) {
        UserDTO user = userService.register(request);
        return ApiResponse.success(user, "Registration successful");
    }
    
    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        String newAccessToken = tokenService.refreshAccessToken(request.getRefreshToken());
        
        AuthResponse response = AuthResponse.builder()
            .accessToken(newAccessToken)
            .tokenType("Bearer")
            .expiresIn(3600)
            .build();
        
        return ApiResponse.success(response, "Token refreshed");
    }
    
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader("Authorization") String token) {
        tokenService.invalidateToken(token);
        SecurityContextHolder.clearContext();
        return ApiResponse.success(null, "Logout successful");
    }
}
```

### 7. Method-Level Security

```java
@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    
    @PreAuthorize("hasRole('USER')")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        return productRepository.save(product);
    }
    
    @PreAuthorize("hasRole('ADMIN') or @securityService.isOwner(#productId)")
    public Product updateProduct(Long productId, ProductRequest request) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        return productRepository.save(product);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }
}
```

### 8. Security Utility Service

```java
@Service
public class SecurityService {
    
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getId();
    }
    
    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        return (UserPrincipal) authentication.getPrincipal();
    }
    
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.getAuthorities().stream()
                   .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role));
    }
    
    public boolean isOwner(Long resourceId) {
        String currentUserId = getCurrentUserId();
        // Check if current user owns the resource
        return resourceService.isOwner(resourceId, currentUserId);
    }
}
```

### 9. API Key Authentication

```java
@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {
    
    @Value("${api.keys}")
    private List<String> validApiKeys;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        String apiKey = request.getHeader("X-API-Key");
        
        if (apiKey != null && validApiKeys.contains(apiKey)) {
            // Create authentication for API key
            ApiKeyAuthenticationToken authentication = 
                new ApiKeyAuthenticationToken(apiKey, List.of(new SimpleGrantedAuthority("ROLE_API")));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

## Configuration

### Application Properties

```yaml
# application.yml

jwt:
  secret: ${JWT_SECRET:your-secret-key-change-in-production}
  expiration: 3600000  # 1 hour in milliseconds
  refresh-expiration: 604800000  # 7 days in milliseconds

security:
  cors:
    allowed-origins:
      - http://localhost:3000
      - https://yaniq.com
    allowed-methods:
      - GET
      - POST
      - PUT
      - DELETE
      - OPTIONS
    allowed-headers: "*"
    allow-credentials: true
  
  rate-limit:
    enabled: true
    requests-per-minute: 60
  
  api-keys:
    - ${API_KEY_1}
    - ${API_KEY_2}

# Actuator security
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
```

---

## Best Practices

### 1. Password Security

```java
@Service
@RequiredArgsConstructor
public class PasswordService {
    
    private final PasswordEncoder passwordEncoder;
    
    public String hashPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }
    
    public boolean matches(String plainPassword, String hashedPassword) {
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }
    
    public boolean isStrongPassword(String password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special char
        String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password.matches(regex);
    }
}
```

### 2. Token Security

**DO:**
- ✅ Use strong secret keys (256-bit minimum)
- ✅ Set appropriate expiration times
- ✅ Implement token refresh mechanism
- ✅ Store refresh tokens securely
- ✅ Validate tokens on every request

**DON'T:**
- ❌ Store JWT secret in code
- ❌ Use short expiration for refresh tokens
- ❌ Send tokens in URL parameters
- ❌ Store tokens in localStorage (use httpOnly cookies)

### 3. HTTPS Enforcement

```java
@Configuration
public class HttpsConfig {
    
    @Bean
    public TomcatServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
            @Override
            protected void postProcessContext(Context context) {
                SecurityConstraint securityConstraint = new SecurityConstraint();
                securityConstraint.setUserConstraint("CONFIDENTIAL");
                SecurityCollection collection = new SecurityCollection();
                collection.addPattern("/*");
                securityConstraint.addCollection(collection);
                context.addConstraint(securityConstraint);
            }
        };
        tomcat.addAdditionalTomcatConnectors(redirectConnector());
        return tomcat;
    }
}
```

---

## Testing

### Security Testing

```java
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    @WithMockUser(roles = "USER")
    void testAuthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
            .andExpect(status().isOk());
    }
    
    @Test
    void testUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
            .andExpect(status().isUnauthorized());
    }
    
    @Test
    @WithMockUser(roles = "USER")
    void testInsufficientPermissions() throws Exception {
        mockMvc.perform(delete("/api/v1/products/1"))
            .andExpect(status().isForbidden());
    }
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void testAdminAccess() throws Exception {
        mockMvc.perform(delete("/api/v1/products/1"))
            .andExpect(status().isOk());
    }
}
```

---

## Version History

### Version 1.0.0 (Current)
- ✅ Project structure initialized
- ⏳ JWT token management (planned)
- ⏳ Security configurations (planned)
- ⏳ RBAC implementation (planned)

### Planned Features (v1.1.0)
- JWT token service implementation
- OAuth2 integration
- Two-factor authentication
- Rate limiting
- Security audit logging

---

## Related Libraries

- [common-exceptions](./common-exceptions.md) - Security exceptions
- [common-audit](./common-audit.md) - Security audit trails
- [common-api](./common-api.md) - Secure API responses

---

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0

---

**Last Updated:** October 19, 2025  
**Maintainer:** Danukaji Hansanath

