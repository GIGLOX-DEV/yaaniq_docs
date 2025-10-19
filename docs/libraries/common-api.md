# common-api

The `common-api` library provides base classes, utilities, and standardized patterns for building REST APIs across all YaniQ microservices.

## Version & Dependencies

- **Version:** 1.0.0
- **Java:** 21
- **Group ID:** com.yaniq
- **Artifact ID:** common-api

### Dependencies
- Lombok (provided scope)
- Jackson Annotations
- Swagger Models Jakarta (2.2.15)

## Installation

Add to your service's `pom.xml`:

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-api</artifactId>
    <version>1.0.0</version>
</dependency>
```

Or use the project version property:

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-api</artifactId>
    <version>${yaniq.version}</version>
</dependency>
```

## Features

- ✅ Standardized API response wrapper (ApiResponse)
- ✅ Response factory for common patterns
- ✅ Pagination support (PageMetadata & ApiPagination)
- ✅ HATEOAS links support
- ✅ Multiple response styles (REST, GraphQL, Simple, etc.)
- ✅ Structured error handling
- ✅ Request/Response metadata (traceId, requestId, timestamp)
- ✅ OpenAPI/Swagger integration

## Quick Start

### Basic Success Response

```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> getProduct(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        return ApiResponse.success(product);
    }
    
    @PostMapping
    public ApiResponse<ProductDTO> createProduct(@RequestBody @Valid ProductRequest request) {
        ProductDTO product = productService.create(request);
        return ApiResponseFactory.success(product, "Product created successfully");
    }
}
```

**Response Structure:**
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

## Response Wrapper

### Success Response

```java
// Simple success
ApiResponse<ProductDTO> response = ApiResponse.success(product);

// Success with message
ApiResponse<ProductDTO> response = ApiResponseFactory.success(
    product, 
    "Product retrieved successfully"
);

// Success with custom status code
ApiResponse<ProductDTO> response = ApiResponseFactory.success(
    product, 
    "Resource created", 
    201
);
```

### Error Response

```java
// Single error
ApiError error = ApiError.of("NOT_FOUND", "Product not found");
ApiResponse<Object> response = ApiResponse.error(error);

// Multiple errors
List<ApiError> errors = List.of(
    ApiError.of("VALIDATION_ERROR", "Invalid name"),
    ApiError.of("VALIDATION_ERROR", "Invalid price")
);
ApiResponse<Object> response = ApiResponse.error(errors);

// Simple error messages
ApiResponse<Object> response = ApiResponseFactory.error(
    "Validation failed",
    400,
    List.of("name: must not be blank", "price: must be positive")
);
```

## Pagination

### Using PageMetadata (Recommended)

```java
@GetMapping
public ApiResponse<List<ProductDTO>> getProducts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {
    
    Page<ProductDTO> productsPage = productService.findAll(page, size);
    
    PageMetadata metadata = PageMetadata.of(
        page, 
        size, 
        productsPage.getTotalElements()
    );
    
    return ApiResponseFactory.paginated(
        productsPage.getContent(), 
        metadata
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
  "statusCode": 200
}
```

### Legacy ApiPagination (Still Supported)

```java
@GetMapping("/legacy")
public ApiResponse<List<ProductDTO>> getProducts(Pageable pageable) {
    Page<ProductDTO> productsPage = productService.findAll(pageable);
    
    ApiPagination pagination = new ApiPagination.Builder()
        .currentPage(pageable.getPageNumber())
        .pageSize(pageable.getPageSize())
        .totalPages(productsPage.getTotalPages())
        .totalRecords(productsPage.getTotalElements())
        .build();
    
    return ApiResponse.success(productsPage.getContent(), pagination);
}
```

## HATEOAS Links

Add hypermedia links to your responses:

```java
@GetMapping("/{id}")
public ApiResponse<ProductDTO> getProduct(@PathVariable Long id) {
    ProductDTO product = productService.findById(id);
    
    // Create links
    Links links = Links.self("/api/v1/products/" + id)
        .links(Map.of(
            "update", Link.builder()
                .url("/api/v1/products/" + id)
                .method("PUT")
                .build(),
            "delete", Link.builder()
                .url("/api/v1/products/" + id)
                .method("DELETE")
                .build(),
            "reviews", Link.builder()
                .url("/api/v1/products/" + id + "/reviews")
                .method("GET")
                .build()
        ))
        .build();
    
    return ApiResponseFactory.custom(
        product,
        "Product retrieved successfully",
        200,
        ApiMeta.create(),
        links,
        null, null,
        ResponseStyle.REST_ENVELOPE,
        "1.0"
    );
}
```

## Response Styles

The library supports multiple response styles via the `ResponseStyle` enum:

```java
public enum ResponseStyle {
    REST_ENVELOPE,      // Standard REST with full metadata
    GRAPHQL_ENVELOPE,   // GraphQL-style responses
    SIMPLE,             // Just the data payload
    PAGINATED,          // For paginated responses
    STREAMING,          // For streaming APIs
    NONE                // Raw data, no wrapper
}
```

Example:
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

## API Versioning

Include version information in your responses:

```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductControllerV1 {
    
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> get(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        return ApiResponse.<ProductDTO>builder()
            .data(product)
            .version("1.0")
            .statusCode(200)
            .build();
    }
}

@RestController
@RequestMapping("/api/v2/products")
public class ProductControllerV2 {
    
    @GetMapping("/{id}")
    public ApiResponse<ProductDTOV2> get(@PathVariable Long id) {
        ProductDTOV2 product = productService.findByIdV2(id);
        return ApiResponse.<ProductDTOV2>builder()
            .data(product)
            .version("2.0")
            .statusCode(200)
            .build();
    }
}
```

## Exception Handling

Global exception handler example:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFound(
        ResourceNotFoundException ex) {
        
        ApiError error = ApiError.of("RESOURCE_NOT_FOUND", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(error));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(
        ValidationException ex) {
        
        List<ApiError> errors = ex.getErrors().stream()
            .map(e -> ApiError.of("VALIDATION_ERROR", e.getMessage()))
            .toList();
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(errors));
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

## Core Components

### ApiResponse&lt;T&gt;
Main response wrapper with metadata, status, data, and error information.

### ApiResponseFactory
Factory class providing static methods for creating common response types:
- `success(T data, String message)`
- `error(String message, int statusCode, List<String> errors)`
- `paginated(List<T> items, PageMetadata page)`
- `custom(...)` for fully customized responses

### ApiError
Structured error representation with code, message, and optional details.

### ApiMeta
Response metadata including timestamp, traceId, and requestId for tracking.

### PageMetadata (Record)
Modern pagination metadata with page, size, total, totalPages, first, and last flags.

### Links & Link
HATEOAS hypermedia links for RESTful navigation.

## OpenAPI/Swagger Integration

Automatic API documentation support:

```java
@Tag(name = "Products", description = "Product management APIs")
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    
    @Operation(summary = "Get product by ID", description = "Retrieves a product by its unique identifier")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Product found successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "Product not found"
        )
    })
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> getProduct(
        @Parameter(description = "Product ID") @PathVariable Long id) {
        return ApiResponse.success(productService.findById(id));
    }
}
```

## Complete Controller Example

```java
@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    public ApiResponse<List<ProductDTO>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        
        Page<ProductDTO> productsPage = productService.findAll(page, size);
        PageMetadata metadata = PageMetadata.of(page, size, productsPage.getTotalElements());
        
        return ApiResponseFactory.paginated(productsPage.getContent(), metadata);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> get(@PathVariable Long id) {
        return ApiResponse.success(productService.findById(id));
    }
    
    @PostMapping
    public ApiResponse<ProductDTO> create(@RequestBody @Valid ProductRequest request) {
        ProductDTO product = productService.create(request);
        return ApiResponseFactory.success(product, "Product created successfully", 201);
    }
    
    @PutMapping("/{id}")
    public ApiResponse<ProductDTO> update(
        @PathVariable Long id,
        @RequestBody @Valid ProductRequest request) {
        
        ProductDTO product = productService.update(id, request);
        return ApiResponseFactory.success(product, "Product updated successfully");
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponseFactory.success(null, "Product deleted successfully", 204);
    }
}
```

## Best Practices

1. **Use ApiResponseFactory** for common scenarios instead of builder pattern
2. **Consistent error codes** - Use structured error codes (e.g., `RESOURCE_NOT_FOUND`, `VALIDATION_ERROR`)
3. **Include trace IDs** - Automatically included via ApiMeta for debugging
4. **Use PageMetadata** for new pagination implementations
5. **Version your APIs** - Include version in responses for API evolution
6. **Add HATEOAS links** for discoverable APIs
7. **Global exception handling** - Centralize error response creation

## Documentation

For complete usage guide, examples, and advanced features, see:
- **[Common-API Usage Guide](./common-api-usage-guide.md)** - Comprehensive documentation with all features and examples

## Related Libraries

- [common-security](./common-security.md) - Authentication and authorization
- [common-validation](./common-validation.md) - Request validation
- [common-exceptions](./common-exceptions.md) - Exception handling
- [common-logging](./common-logging.md) - Logging utilities

## Support

- **Version:** 1.0.0
- **GitHub:** https://github.com/yaniq/yaniq-monorepo
- **Maintainer:** Danukaji Hansanath
- **License:** Apache License 2.0
