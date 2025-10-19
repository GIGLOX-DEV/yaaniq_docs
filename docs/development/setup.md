6. **Merge when approved**

## Useful Commands

### Maven

```bash
# Clean build
mvn clean install

# Skip tests
mvn clean install -DskipTests

# Update dependencies
mvn clean install -U

# Run specific service
cd apps/product-service && mvn spring-boot:run

# Debug service
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### Docker

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d product-service

# View logs
docker-compose logs -f product-service

# Restart service
docker-compose restart product-service

# Stop all
docker-compose down

# Clean up
docker-compose down -v
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Port forward
kubectl port-forward svc/product-service 8083:8080

# View logs
kubectl logs -f deployment/product-service

# Restart deployment
kubectl rollout restart deployment/product-service
```

## Troubleshooting

### Port Already in Use

```bash
# Find process
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Maven Build Fails

```bash
# Clear local repository
rm -rf ~/.m2/repository/com/yaniq

# Rebuild
mvn clean install -U
```

### Service Won't Start

1. Check logs
2. Verify database is running
3. Check port availability
4. Verify environment variables

## Next Steps

- [Coding Standards](/docs/development/coding-standards)
- [Testing Guide](/docs/development/testing)
- [Contributing](/docs/development/contributing)
# Development Setup

This guide will help you set up your development environment for contributing to YaniQ.

## IDE Setup

### IntelliJ IDEA (Recommended)

#### 1. Import Project

1. Open IntelliJ IDEA
2. Select **File → Open**
3. Navigate to the YaniQ root directory
4. Select `pom.xml` and click **Open as Project**
5. Wait for Maven to download dependencies

#### 2. Configure JDK

1. **File → Project Structure → Project**
2. Set **Project SDK**: JDK 17
3. Set **Project language level**: 17

#### 3. Install Plugins

Required plugins:
- **Spring Boot Assistant**
- **Docker**
- **Kubernetes**
- **Database Tools**

Optional but recommended:
- **SonarLint** - Code quality
- **GitToolBox** - Enhanced Git integration
- **Rainbow Brackets** - Bracket colorization
- **Key Promoter X** - Learn shortcuts

#### 4. Code Style

Import code style configuration:
1. **File → Settings → Editor → Code Style**
2. Click gear icon → **Import Scheme**
3. Select `config/intellij-code-style.xml`

#### 5. Run Configurations

Create run configurations for services:

**Discovery Service:**
- Name: `Discovery Service`
- Main class: `com.yaniq.discovery.DiscoveryServiceApplication`
- Working directory: `$MODULE_DIR$`
- Module: `discovery-service`

Repeat for other services.

### Visual Studio Code

#### 1. Install Extensions

```bash
code --install-extension vscjava.vscode-java-pack
code --install-extension pivotal.vscode-spring-boot
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-kubernetes-tools.vscode-kubernetes-tools
```

#### 2. Configure Java

Create `.vscode/settings.json`:

```json
{
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-17",
      "path": "/path/to/jdk-17",
      "default": true
    }
  ],
  "java.home": "/path/to/jdk-17",
  "maven.executable.path": "/path/to/mvn"
}
```

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/yaniq/yaniq-monorepo.git
cd yaniq-monorepo
```

### 2. Configure Environment

```bash
cp example.env .env
```

Edit `.env` with your local configuration.

### 3. Start Infrastructure

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- PostgreSQL
- Redis
- RabbitMQ
- Elasticsearch (optional)

### 4. Build Project

```bash
mvn clean install
```

## Development Workflow

### Working on a Service

1. **Create Feature Branch**
```bash
git checkout -b feature/service-name-feature
```

2. **Make Changes**
```bash
cd apps/product-service
# Edit code
```

3. **Run Tests**
```bash
mvn test
```

4. **Run Service Locally**
```bash
mvn spring-boot:run
```

5. **Test Endpoints**
```bash
curl http://localhost:8083/actuator/health
```

### Working on a Library

1. **Create Branch**
```bash
git checkout -b feature/common-library-feature
```

2. **Make Changes**
```bash
cd libs/common-api
# Edit code
```

3. **Run Tests**
```bash
mvn test
```

4. **Install Locally**
```bash
mvn clean install
```

5. **Test in Service**
```bash
cd ../../apps/product-service
mvn clean spring-boot:run
```

## Debugging

### IntelliJ IDEA

1. Set breakpoints in code
2. Right-click service run configuration
3. Select **Debug 'Service Name'**

### VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Debug Product Service",
      "request": "launch",
      "mainClass": "com.yaniq.product.ProductServiceApplication",
      "projectName": "product-service"
    }
  ]
}
```

### Remote Debugging

For Docker containers:

1. **Update docker-compose.yml**:
```yaml
services:
  product-service:
    environment:
      - JAVA_OPTS=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
    ports:
      - "5005:5005"
```

2. **Connect Debugger**:
- Host: `localhost`
- Port: `5005`

## Database Management

### pgAdmin (PostgreSQL)

Access at: http://localhost:5050

1. **Add Server**:
   - Name: `YaniQ Local`
   - Host: `localhost`
   - Port: `5432`
   - Username: `yaniq_user`
   - Password: (from `.env`)

2. **View Databases**:
   - Expand server → Databases
   - Each service has its own database

### DBeaver (Universal)

1. Create new connection
2. Select PostgreSQL
3. Configure connection details
4. Test connection

## Redis Management

### RedisInsight

Download from: https://redis.com/redis-enterprise/redis-insight/

Connect to: `localhost:6379`

### redis-cli

```bash
docker exec -it yaniq-redis redis-cli

# Common commands
> KEYS *
> GET key_name
> FLUSHALL  # Clear all keys (use carefully!)
```

## Testing

### Unit Tests

```bash
# Test specific service
cd apps/product-service
mvn test

# Test specific class
mvn test -Dtest=ProductServiceTest

# Test specific method
mvn test -Dtest=ProductServiceTest#testCreateProduct
```

### Integration Tests

```bash
mvn verify
```

### Test Coverage

```bash
mvn clean test jacoco:report
```

View report: `target/site/jacoco/index.html`

## Code Quality

### SonarLint (IDE)

Provides real-time code analysis in IDE.

### Maven Checkstyle

```bash
mvn checkstyle:check
```

### SpotBugs

```bash
mvn spotbugs:check
```

## Git Workflow

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Build/tools

Example:
```
feat(product-service): add product search endpoint

Implement full-text search for products using Elasticsearch.
Includes pagination and filtering support.

Closes #123
```

### Pull Requests

1. **Update from main**:
```bash
git fetch origin
git rebase origin/main
```

2. **Push branch**:
```bash
git push origin feature/my-feature
```

3. **Create PR** on GitHub
4. **Request review**
5. **Address feedback**
# Auth Service

The Authentication Service handles user authentication, authorization, JWT token management, and security operations for the YaniQ platform.

## Overview

- **Port**: 8081
- **Database**: PostgreSQL (auth_service)
- **Cache**: Redis
- **Dependencies**: User Service

## Responsibilities

- User authentication (login/logout)
- JWT token generation and validation
- Password management (reset, change)
- Session management
- OAuth2 integration
- Role and permission management
- API key management

## Key Features

### 🔐 Authentication Methods

- **Username/Password**: Traditional authentication
- **Email/Password**: Email-based login
- **OAuth2**: Social login (Google, Facebook, GitHub)
- **API Keys**: For service-to-service communication
- **SSO**: Single Sign-On support

### 🎫 Token Management

- **Access Tokens**: Short-lived JWT tokens (15 minutes)
- **Refresh Tokens**: Long-lived tokens for renewal (7 days)
- **Token Revocation**: Blacklist compromised tokens
- **Token Rotation**: Automatic rotation on refresh

### 🛡️ Security Features

- **Password Hashing**: BCrypt with salt
- **Rate Limiting**: Prevent brute force attacks
- **Account Lockout**: After failed login attempts
- **2FA Support**: Two-factor authentication (optional)
- **Audit Logging**: Track all auth events

## API Endpoints

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "john.doe",
  "email": "john@example.com",
  "createdAt": "2025-10-19T10:00:00Z"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_token",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### Refresh Token

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### Logout

```bash
POST /api/auth/logout
Authorization: Bearer {token}
```

### Password Reset Request

```bash
POST /api/auth/password/reset-request
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Password Reset

```bash
POST /api/auth/password/reset
Content-Type: application/json

{
  "token": "reset_token",
  "newPassword": "NewSecurePass123!"
}
```

## Configuration

```yaml
auth-service:
  jwt:
    secret: ${JWT_SECRET}
    access-token-expiration: 900000    # 15 minutes
    refresh-token-expiration: 604800000 # 7 days
  security:
    max-login-attempts: 5
    lockout-duration: 900000  # 15 minutes
    password-policy:
      min-length: 8
      require-uppercase: true
      require-lowercase: true
      require-digit: true
      require-special: true
```

## Database Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE login_attempts (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    success BOOLEAN,
    attempted_at TIMESTAMP DEFAULT NOW()
);
```

## Events Published

- `user.registered` - When a new user registers
- `user.logged_in` - Successful login
- `user.logged_out` - User logout
- `password.reset_requested` - Password reset initiated
- `password.changed` - Password successfully changed
- `account.locked` - Account locked due to failed attempts

## Monitoring

### Health Check

```bash
GET /actuator/health
```

### Metrics

- `auth.login.total` - Total login attempts
- `auth.login.success` - Successful logins
- `auth.login.failed` - Failed logins
- `auth.token.issued` - Tokens issued
- `auth.token.refreshed` - Tokens refreshed

## Development

### Run Locally

```bash
cd apps/auth-service
mvn spring-boot:run
```

### Run Tests

```bash
mvn test
```

### Docker

```bash
docker-compose up -d auth-service
```

## Next Steps

- [User Service](/docs/services/user-service)
- [Security Architecture](/docs/architecture/security)
- [API Reference](/docs/api/authentication)

