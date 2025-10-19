# common-api

The `common-api` library provides base classes, utilities, and standardized patterns for building REST APIs across all YaniQ microservices.

## Installation

Add to your service's `pom.xml`:

```xml
<dependency>
    <groupId>com.yaniq</groupId>
    <artifactId>common-api</artifactId>
    <version>${yaniq.version}</version>
</dependency>
```

## Features

- ✅ Base REST controllers
- ✅ Standardized response wrappers
- ✅ Pagination support
- ✅ API versioning
- ✅ Request/Response logging
- ✅ CORS configuration
- ✅ OpenAPI/Swagger integration

## Base Controller

Extend `BaseController` for common functionality:

```java
@RestController
@RequestMapping("/api/products")
public class ProductController extends BaseController {
    
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> getProduct(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        return success(product);
    }
    
    @PostMapping
    public ApiResponse<ProductDTO> createProduct(@RequestBody @Valid ProductRequest request) {
        ProductDTO product = productService.create(request);
        return created(product);
    }
}
```

## Response Wrapper

### Success Response

```java
public ApiResponse<T> success(T data) {
    return ApiResponse.<T>builder()
        .data(data)
        .success(true)
        .timestamp(Instant.now())
        .build();
}
```

### Error Response

```java
public ApiResponse<Void> error(String message, HttpStatus status) {
    return ApiResponse.<Void>builder()
        .success(false)
        .error(message)
        .status(status.value())
        .timestamp(Instant.now())
        .build();
}
```

## Pagination

### Using Pageable

```java
@GetMapping
public ApiResponse<Page<ProductDTO>> getProducts(Pageable pageable) {
    Page<ProductDTO> products = productService.findAll(pageable);
    return success(products);
}
```

### Custom Pagination

```java
@GetMapping
public ApiResponse<PagedResponse<ProductDTO>> getProducts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {
    
    PagedResponse<ProductDTO> response = productService.findAll(page, size);
    return success(response);
}
```

## API Versioning

```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductControllerV1 extends BaseController {
    // Version 1 implementation
}

@RestController
@RequestMapping("/api/v2/products")
public class ProductControllerV2 extends BaseController {
    // Version 2 implementation
}
```

## Request Validation

```java
@PostMapping
public ApiResponse<ProductDTO> createProduct(
    @RequestBody @Valid ProductRequest request) {
    
    // Validation happens automatically
    ProductDTO product = productService.create(request);
    return created(product);
}
```

## Exception Handling

Built-in exception handlers:

```java
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ErrorResponse> handleNotFound(
    ResourceNotFoundException ex) {
    return ResponseEntity
        .status(HttpStatus.NOT_FOUND)
        .body(ErrorResponse.of(ex.getMessage()));
}
```

## CORS Configuration

Enable CORS in application.yml:

```yaml
yaniq:
  common:
    api:
      cors:
        enabled: true
        allowed-origins: 
          - http://localhost:3000
          - https://www.yaniq.com
        allowed-methods: GET,POST,PUT,DELETE,PATCH
        allowed-headers: "*"
        max-age: 3600
```

## OpenAPI/Swagger

Automatic API documentation:

```java
@Tag(name = "Products", description = "Product management APIs")
@RestController
@RequestMapping("/api/products")
public class ProductController extends BaseController {
    
    @Operation(summary = "Get product by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> getProduct(@PathVariable Long id) {
        return success(productService.findById(id));
    }
}
```

## Usage Examples

### Complete Controller Example

```java
@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products")
public class ProductController extends BaseController {
    
    private final ProductService productService;
    
    @GetMapping
    public ApiResponse<Page<ProductDTO>> list(Pageable pageable) {
        return success(productService.findAll(pageable));
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> get(@PathVariable Long id) {
        return success(productService.findById(id));
    }
    
    @PostMapping
    public ApiResponse<ProductDTO> create(@RequestBody @Valid ProductRequest request) {
        return created(productService.create(request));
    }
    
    @PutMapping("/{id}")
    public ApiResponse<ProductDTO> update(
        @PathVariable Long id,
        @RequestBody @Valid ProductRequest request) {
        return success(productService.update(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return noContent();
    }
}
```

## Configuration

```yaml
yaniq:
  common:
    api:
      enabled: true
      base-path: /api
      default-page-size: 20
      max-page-size: 100
      logging:
        enabled: true
        include-payload: true
```

## Next Steps

- [common-security](/docs/libraries/common-security)
- [common-validation](/docs/libraries/common-validation)
- [Services Overview](/docs/services/overview)

