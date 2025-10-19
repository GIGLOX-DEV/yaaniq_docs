# Common-API Library - Complete Usage Guide

## Overview

The `common-api` library provides standardized API response structures, pagination support, error handling, and hypermedia links for all YaniQ microservices. It ensures consistency across REST APIs and supports multiple response styles including REST envelopes, GraphQL-style responses, and simple data returns.

---

## Version Information

- **Current Version:** `1.0.0`
- **Java Version:** `21`
- **Group ID:** `com.yaniq`
- **Artifact ID:** `common-api`
- **Last Updated:** October 2025

---

## Installation

### Maven Dependency

Add the following dependency to your service's `pom.xml`:

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-api</artifactId>
    <version>1.0.0</version>
</dependency>
```

### For Specific Versions

To use a specific version:

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-api</artifactId>
    <version>${yaniq.version}</version>
</dependency>
```

Where `${yaniq.version}` is defined in your parent POM properties:

```xml
<properties>
    <yaniq.version>1.0.0</yaniq.version>
</properties>
```

---

## Dependencies

The `common-api` library has the following transitive dependencies that will be automatically included:

### Direct Dependencies

| Dependency | Version | Scope | Purpose |
|------------|---------|-------|---------|
| `org.projectlombok:lombok` | Managed by parent | `provided` | Reduces boilerplate code |
| `com.fasterxml.jackson.core:jackson-annotations` | Managed by parent | `compile` | JSON serialization annotations |
| `io.swagger.core.v3:swagger-models-jakarta` | `2.2.15` | `compile` | OpenAPI/Swagger support |

### Transitive Dependencies

These dependencies come from the parent POM and Spring Boot:
- Spring Web (for REST support)
- Spring Boot Starter
- Jackson Core & Databind
- Jakarta Validation API

---

## Core Components

### 1. ApiResponse&lt;T&gt;

The main response wrapper that provides a standardized structure for all API responses.

#### Fields

```java
public class ApiResponse<T> {
    private final ApiMeta meta;           // Metadata (timestamp, traceId, requestId)
    private final ApiStatus status;        // SUCCESS or ERROR
    private final T data;                  // Response payload
    private final List<ApiError> errors;   // List of errors (if any)
    private final String message;          // Response message
    private final int statusCode;          // HTTP status code
    private final long timestamp;          // Response timestamp
    private final String version;          // API version
    private final Links links;             // HATEOAS links
    private final PageMetadata pageMetadata; // Pagination metadata
    private final ResponseStyle style;     // Response style enum
    private final List<String> errorMessages; // Simple error messages
}
```

---

## Usage Examples

### 1. Simple Success Response

```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> getProduct(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        return ApiResponse.success(product);
    }
}
```

**Response:**
```json
{
  "meta": {
    "timestamp": 1729324800000,
    "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "requestId": "req-123456"
  },
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "name": "Product Name",
    "price": 29.99
  },
  "statusCode": 200,
  "timestamp": 1729324800000,
  "version": "1.0"
}
```

### 2. Success Response with Message

```java
@PostMapping
public ApiResponse<ProductDTO> createProduct(@RequestBody @Valid ProductRequest request) {
    ProductDTO product = productService.create(request);
    return ApiResponseFactory.success(product, "Product created successfully");
}
```

**Response:**
```json
{
  "data": {
    "id": 2,
    "name": "New Product"
  },
  "message": "Product created successfully",
  "statusCode": 200,
  "timestamp": 1729324800000
}
```

### 3. Paginated Response

```java
@GetMapping
public ApiResponse<List<ProductDTO>> getProducts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {
    
    Page<ProductDTO> productsPage = productService.findAll(page, size);
    
    PageMetadata pageMetadata = PageMetadata.of(
        page, 
        size, 
        productsPage.getTotalElements()
    );
    
    return ApiResponseFactory.paginated(
        productsPage.getContent(), 
        pageMetadata
    );
}
```

**Response:**
```json
{
  "data": [
    {"id": 1, "name": "Product 1"},
    {"id": 2, "name": "Product 2"}
  ],
  "pageMetadata": {
    "page": 0,
    "size": 20,
    "total": 100,
    "totalPages": 5,
    "first": true,
    "last": false
  },
  "statusCode": 200,
  "timestamp": 1729324800000
}
```

### 4. Response with HATEOAS Links

```java
@GetMapping("/{id}")
public ApiResponse<ProductDTO> getProduct(@PathVariable Long id) {
    ProductDTO product = productService.findById(id);
    
    Links links = Links.self("/api/v1/products/" + id)
        .links(Map.of(
            "update", Link.builder()
                .url("/api/v1/products/" + id)
                .method("PUT")
                .build(),
            "delete", Link.builder()
                .url("/api/v1/products/" + id)
                .method("DELETE")
                .build()
        ))
        .build();
    
    return ApiResponseFactory.custom(
        product,
        "Product retrieved successfully",
        200,
        ApiMeta.create(),
        links,
        null,
        null,
        ResponseStyle.REST_ENVELOPE,
        "1.0"
    );
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Product Name"
  },
  "message": "Product retrieved successfully",
  "statusCode": 200,
  "links": {
    "self": {"url": "/api/v1/products/1"},
    "update": {"url": "/api/v1/products/1", "method": "PUT"},
    "delete": {"url": "/api/v1/products/1", "method": "DELETE"}
  },
  "style": "REST_ENVELOPE",
  "version": "1.0"
}
```

### 5. Error Response

```java
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ApiResponse<Object>> handleNotFound(
    ResourceNotFoundException ex) {
    
    ApiError error = ApiError.of("RESOURCE_NOT_FOUND", ex.getMessage());
    
    return ResponseEntity
        .status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.error(error));
}
```

**Response:**
```json
{
  "meta": {
    "timestamp": 1729324800000,
    "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "requestId": "req-123456"
  },
  "status": "ERROR",
  "errors": [
    {
      "code": "RESOURCE_NOT_FOUND",
      "message": "Product with ID 999 not found"
    }
  ],
  "statusCode": 500,
  "timestamp": 1729324800000
}
```

### 6. Error Response with Multiple Errors

```java
@ExceptionHandler(ValidationException.class)
public ResponseEntity<ApiResponse<Object>> handleValidation(
    ValidationException ex) {
    
    List<String> errorMessages = ex.getErrors().stream()
        .map(err -> err.getField() + ": " + err.getMessage())
        .toList();
    
    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(ApiResponseFactory.error(
            "Validation failed",
            400,
            errorMessages
        ));
}
```

**Response:**
```json
{
  "message": "Validation failed",
  "statusCode": 400,
  "errorMessages": [
    "name: must not be blank",
    "price: must be greater than 0"
  ],
  "timestamp": 1729324800000
}
```

---

## Advanced Usage

### 1. Using ApiPagination (Legacy Style)

```java
@GetMapping("/legacy")
public ApiResponse<List<ProductDTO>> getProductsLegacy(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {
    
    Page<ProductDTO> productsPage = productService.findAll(page, size);
    
    ApiPagination pagination = new ApiPagination.Builder()
        .currentPage(page)
        .pageSize(size)
        .totalPages(productsPage.getTotalPages())
        .totalRecords(productsPage.getTotalElements())
        .build();
    
    return ApiResponse.success(
        productsPage.getContent(),
        pagination
    );
}
```

### 2. Response Styles

The library supports multiple response styles via the `ResponseStyle` enum:

```java
public enum ResponseStyle {
    REST_ENVELOPE,      // Standard REST with metadata
    GRAPHQL_ENVELOPE,   // GraphQL-style responses
    SIMPLE,             // Just the data
    PAGINATED,          // Paginated responses
    STREAMING,          // For streaming APIs
    NONE                // Raw data, no wrapper
}
```

Usage example:

```java
@GetMapping("/simple/{id}")
public ApiResponse<ProductDTO> getProductSimple(@PathVariable Long id) {
    ProductDTO product = productService.findById(id);
    
    return ApiResponse.<ProductDTO>builder()
        .data(product)
        .style(ResponseStyle.SIMPLE)
        .statusCode(200)
        .build();
}
```

### 3. Custom Metadata

```java
@GetMapping("/{id}/detailed")
public ApiResponse<ProductDTO> getProductDetailed(@PathVariable Long id) {
    ProductDTO product = productService.findById(id);
    
    ApiMeta customMeta = ApiMeta.create();
    
    return ApiResponse.<ProductDTO>builder()
        .meta(customMeta)
        .data(product)
        .message("Product retrieved with detailed information")
        .statusCode(200)
        .version("2.0")
        .build();
}
```

---

## API Components Reference

### ApiStatus Enum

```java
public enum ApiStatus {
    SUCCESS,  // Request processed successfully
    ERROR     // Error occurred during processing
}
```

### ApiError

```java
// Simple error
ApiError error = ApiError.of("ERROR_CODE", "Error message");

// Error with details
ApiError detailedError = ApiError.of(
    "VALIDATION_ERROR",
    "Invalid input",
    List.of("Field 'email' is invalid", "Field 'password' is too short")
);
```

### ApiMeta

```java
// Basic metadata
ApiMeta meta = ApiMeta.create();

// Metadata with pagination
ApiPagination pagination = new ApiPagination.Builder()
    .currentPage(0)
    .pageSize(20)
    .totalPages(5)
    .totalRecords(100)
    .build();
    
ApiMeta metaWithPagination = ApiMeta.withPagination(pagination);
```

### PageMetadata (Recommended)

```java
// Create from page info
PageMetadata pageMetadata = PageMetadata.of(page, size, totalElements);

// Using builder
PageMetadata pageMetadata = PageMetadata.builder()
    .page(0)
    .size(20)
    .total(100)
    .totalPages(5)
    .first(true)
    .last(false)
    .build();
```

### Links (HATEOAS)

```java
// Self link only
Links links = Links.self("/api/v1/products/1");

// Single additional link
Links links = Links.single("next", 
    Link.builder().url("/api/v1/products?page=2").build()
);

// Multiple links
Map<String, Link> linkMap = new HashMap<>();
linkMap.put("self", Link.builder().url("/api/v1/products/1").build());
linkMap.put("update", Link.builder().url("/api/v1/products/1").method("PUT").build());
linkMap.put("delete", Link.builder().url("/api/v1/products/1").method("DELETE").build());

Links links = Links.of(linkMap);
```

---

## Best Practices

### 1. Consistent Error Handling

Create a global exception handler:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFound(
        ResourceNotFoundException ex) {
        
        ApiError error = ApiError.of("NOT_FOUND", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(error));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex) {
        ApiError error = ApiError.of("INTERNAL_ERROR", "An unexpected error occurred");
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(error));
    }
}
```

### 2. Use Factory Methods

Prefer `ApiResponseFactory` for common scenarios:

```java
// Good
return ApiResponseFactory.success(data, "Operation successful");

// Also good but more verbose
return ApiResponse.<ProductDTO>builder()
    .data(data)
    .message("Operation successful")
    .statusCode(200)
    .build();
```

### 3. Pagination Standards

Use `PageMetadata` for new implementations:

```java
// Recommended
PageMetadata metadata = PageMetadata.of(page, size, total);
return ApiResponseFactory.paginated(items, metadata);

// Legacy (still supported)
ApiPagination pagination = new ApiPagination.Builder()
    .currentPage(page)
    .pageSize(size)
    .totalRecords(total)
    .build();
return ApiResponse.success(items, pagination);
```

### 4. API Versioning

Include version in responses:

```java
return ApiResponse.<ProductDTO>builder()
    .data(product)
    .version("2.0")  // Indicate API version
    .statusCode(200)
    .build();
```

### 5. Structured Error Codes

Use consistent error code patterns:

```java
// Resource errors
ApiError.of("PRODUCT_NOT_FOUND", "Product with ID " + id + " not found")
ApiError.of("USER_NOT_FOUND", "User with email " + email + " not found")

// Validation errors
ApiError.of("VALIDATION_ERROR", "Invalid input data", validationDetails)

// Business logic errors
ApiError.of("INSUFFICIENT_STOCK", "Not enough stock available")
ApiError.of("PAYMENT_FAILED", "Payment processing failed")

// System errors
ApiError.of("DATABASE_ERROR", "Database connection failed")
ApiError.of("EXTERNAL_SERVICE_ERROR", "External API unavailable")
```

---

## Migration Guide

### From Custom Response to ApiResponse

**Before:**
```java
public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
    ProductDTO product = productService.findById(id);
    return ResponseEntity.ok(product);
}
```

**After:**
```java
public ApiResponse<ProductDTO> getProduct(@PathVariable Long id) {
    ProductDTO product = productService.findById(id);
    return ApiResponse.success(product);
}
```

### From Map-based Response to ApiResponse

**Before:**
```java
public Map<String, Object> getProduct(@PathVariable Long id) {
    ProductDTO product = productService.findById(id);
    return Map.of(
        "success", true,
        "data", product,
        "timestamp", System.currentTimeMillis()
    );
}
```

**After:**
```java
public ApiResponse<ProductDTO> getProduct(@PathVariable Long id) {
    ProductDTO product = productService.findById(id);
    return ApiResponse.success(product);
}
```

---

## Configuration

While `common-api` is primarily a library and doesn't require extensive configuration, you can customize behavior in your service's `application.yml`:

```yaml
# Your service configuration
spring:
  application:
    name: product-service
    
# Custom API configuration (optional)
api:
  version: "1.0"
  response:
    include-trace-id: true
    include-request-id: true
    default-page-size: 20
    max-page-size: 100
```

---

## Testing

### Unit Testing with ApiResponse

```java
@Test
void testSuccessResponse() {
    ProductDTO product = new ProductDTO(1L, "Test Product", 29.99);
    ApiResponse<ProductDTO> response = ApiResponse.success(product);
    
    assertNotNull(response);
    assertEquals(ApiStatus.SUCCESS, response.getStatus());
    assertEquals(product, response.getData());
    assertEquals(200, response.getStatusCode());
}

@Test
void testErrorResponse() {
    ApiError error = ApiError.of("TEST_ERROR", "Test error message");
    ApiResponse<Object> response = ApiResponse.error(error);
    
    assertNotNull(response);
    assertEquals(ApiStatus.ERROR, response.getStatus());
    assertEquals(1, response.getErrors().size());
    assertEquals("TEST_ERROR", response.getErrors().get(0).getCode());
}

@Test
void testPaginatedResponse() {
    List<ProductDTO> products = List.of(
        new ProductDTO(1L, "Product 1", 10.0),
        new ProductDTO(2L, "Product 2", 20.0)
    );
    
    PageMetadata metadata = PageMetadata.of(0, 20, 100);
    ApiResponse<List<ProductDTO>> response = 
        ApiResponseFactory.paginated(products, metadata);
    
    assertNotNull(response);
    assertEquals(2, response.getData().size());
    assertEquals(0, response.getPageMetadata().page());
    assertEquals(5, response.getPageMetadata().totalPages());
}
```

---

## Version History

### Version 1.0.0 (Current)
- ✅ Initial release
- ✅ ApiResponse generic wrapper
- ✅ ApiResponseFactory for common patterns
- ✅ Pagination support (ApiPagination & PageMetadata)
- ✅ HATEOAS links support
- ✅ Multiple response styles
- ✅ Structured error handling
- ✅ OpenAPI/Swagger integration

### Planned Features (v1.1.0)
- ⏳ Response caching annotations
- ⏳ Rate limiting metadata
- ⏳ Enhanced OpenAPI documentation
- ⏳ Response compression hints

---

## Troubleshooting

### Common Issues

#### 1. Jackson Serialization Issues

**Problem:** Fields not serializing in JSON response

**Solution:** Ensure Jackson is properly configured:
```java
@Configuration
public class JacksonConfig {
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        return mapper;
    }
}
```

#### 2. Null Fields in Response

**Problem:** Getting null values in response

**Solution:** `@JsonInclude(JsonInclude.Include.NON_NULL)` is already applied. Check if your DTOs have proper getters.

#### 3. Timestamp Format Issues

**Problem:** Timestamp not in expected format

**Solution:** The library uses epoch milliseconds. If you need ISO-8601:
```java
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ")
private Instant timestamp;
```

---

## Related Libraries

- **[common-security](./common-security.md)** - Authentication and authorization
- **[common-validation](./common-validation.md)** - Request validation
- **[common-exceptions](./common-exceptions.md)** - Exception handling
- **[common-logging](./common-logging.md)** - Logging utilities

---

## Support & Contributing

For issues, questions, or contributions:
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Email:** danukajihansanath0408@gmail.com
- **Organization:** YaniQ

---

## License

This library is licensed under the Apache License 2.0.

---

**Last Updated:** October 19, 2025  
**Version:** 1.0.0  
**Maintainer:** Danukaji Hansanath
