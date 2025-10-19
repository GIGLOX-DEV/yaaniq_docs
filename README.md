# YaniQ Documentation

This directory contains the complete documentation for the YaniQ E-Commerce microservices platform, built with [Docusaurus](https://docusaurus.io/).

## 📚 What's Included

- **Getting Started**: Setup guides and quick start tutorials
- **Architecture**: System design and architectural patterns
- **Services**: Detailed documentation for all 22 microservices
- **Libraries**: Common libraries and shared utilities
- **API Reference**: REST API endpoints and event schemas
- **Development**: Development guidelines and best practices
- **Deployment**: Docker, Kubernetes, and CI/CD guides

## 🚀 Quick Start

### Development Server

Start the documentation site locally:

```bash
cd documentation
npm start
```

The site will open at `http://localhost:3000`.

### Build

Build static site for production:

```bash
npm run build
```

### Serve Built Site

```bash
npm run serve
```

## 📖 Documentation Structure

```
documentation/
├── docs/                          # Documentation content
│   ├── intro.md                   # Introduction
│   ├── getting-started/           # Setup and installation
│   ├── architecture/              # Architecture documentation
│   ├── services/                  # Service-specific docs
│   ├── libraries/                 # Common libraries
│   ├── api/                       # API reference
│   ├── development/               # Development guides
│   └── deployment/                # Deployment guides
├── blog/                          # Blog posts (optional)
├── src/                           # React components
│   ├── components/                # Custom components
│   ├── css/                       # Custom styles
│   └── pages/                     # Custom pages
├── static/                        # Static assets
├── docusaurus.config.ts           # Site configuration
├── sidebars.ts                    # Sidebar structure
└── package.json                   # Dependencies
```

## ✍️ Contributing to Documentation

### Adding New Documentation

1. **Create Markdown File**:
   ```bash
   # Service documentation
   touch docs/services/my-service.md
   
   # Library documentation
   touch docs/libraries/common-my-lib.md
   ```

2. **Add to Sidebar** (`sidebars.ts`):
   ```typescript
   servicesSidebar: [
     // ...existing items
     'services/my-service',
   ]
   ```

3. **Write Content**:
   ```markdown
   ---
   sidebar_position: 1
   ---
   
   # My Service
   
   Description of the service...
   ```

### Markdown Features

#### Code Blocks

````markdown
```java
@Service
public class MyService {
    // code here
}
```
````

#### Admonitions

```markdown
:::tip
This is a helpful tip!
:::

:::warning
Be careful with this!
:::

:::danger
This is dangerous!
:::
```

#### Tabs

```markdown
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="java" label="Java">
    ```java
    // Java code
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    // Kotlin code
    ```
  </TabItem>
</Tabs>
```

## 🎨 Customization

### Theme Configuration

Edit `docusaurus.config.ts`:

```typescript
themeConfig: {
  colorMode: {
    defaultMode: 'light',
    respectPrefersColorScheme: true,
  },
  // ... other config
}
```

### Custom CSS

Edit `src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
  /* ... */
}
```

## 📦 Deployment

### GitHub Pages

```bash
npm run deploy
```

### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `build`

### Vercel

1. Import project
2. Framework preset: Docusaurus
3. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "serve"]
```

Build and run:
```bash
docker build -t yaniq-docs .
docker run -p 3000:3000 yaniq-docs
```

## 🔍 Search

Docusaurus includes built-in search. For production, consider:

- **Algolia DocSearch**: Free for open-source
- **Local Search Plugin**: Self-hosted option

## 📝 Best Practices

### Writing Documentation

- ✅ Use clear, concise language
- ✅ Include code examples
- ✅ Add diagrams where helpful
- ✅ Keep content up-to-date
- ✅ Link to related pages
- ✅ Use proper headings hierarchy

### File Naming

- Use kebab-case: `my-service.md`
- Be descriptive: `auth-service.md` not `as.md`
- Match service names: `product-service.md`

### Internal Links

```markdown
[Link to other doc](/docs/services/auth-service)
[Link with anchor](/docs/services/auth-service#api-endpoints)
```

## 🛠️ Maintenance

### Update Dependencies

```bash
npm update
```

### Check for Broken Links

```bash
npm run build
# Docusaurus will warn about broken links
```

### Clear Cache

```bash
npm run clear
```

## 📚 Resources

- [Docusaurus Documentation](https://docusaurus.io/)
- [Markdown Guide](https://www.markdownguide.org/)
- [MDX Documentation](https://mdxjs.com/)

## 🤝 Support

For documentation issues:
1. Check existing documentation
2. Search GitHub issues
3. Create new issue with `documentation` label

## 📄 License

Same as the main YaniQ project - Apache License 2.0

---

**Note**: This documentation is continuously evolving. Contributions are welcome!

