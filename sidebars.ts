import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/prerequisites',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/project-structure',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/microservices',
        'architecture/data-flow',
        'architecture/security',
        'architecture/messaging',
        'architecture/caching',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/setup',
        'development/coding-standards',
        'development/testing',
        'development/debugging',
        'development/contributing',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/overview',
        'deployment/docker',
        'deployment/kubernetes',
        'deployment/ci-cd',
        'deployment/monitoring',
      ],
    },
  ],

  // Services sidebar
  servicesSidebar: [
    'services/overview',
    {
      type: 'category',
      label: 'Core Services',
      items: [
        'services/auth-service',
        'services/user-service',
        'services/gateway-service',
        'services/discovery-service',
      ],
    },
    {
      type: 'category',
      label: 'Product & Catalog',
      items: [
        'services/product-service',
        'services/catalog-service',
        'services/inventory-service',
        'services/search-service',
      ],
    },
    {
      type: 'category',
      label: 'Order & Payment',
      items: [
        'services/cart-service',
        'services/order-service',
        'services/payment-service',
        'services/billing-service',
      ],
    },
    {
      type: 'category',
      label: 'Fulfillment & Logistics',
      items: [
        'services/shipping-service',
      ],
    },
    {
      type: 'category',
      label: 'Customer Engagement',
      items: [
        'services/review-service',
        'services/promotion-service',
        'services/loyalty-service',
        'services/recommendation-service',
        'services/notification-service',
      ],
    },
    {
      type: 'category',
      label: 'Support & Management',
      items: [
        'services/support-service',
        'services/admin-service',
        'services/file-service',
        'services/analytic-service',
      ],
    },
  ],

  // Libraries sidebar
  libsSidebar: [
    'libraries/overview',
    {
      type: 'category',
      label: 'API & Response',
      items: [
        'libraries/common-api',
        'libraries/common-api-usage-guide',
      ],
    },
    {
      type: 'category',
      label: 'Auditing & Logging',
      items: [
        'libraries/common-audit',
        'libraries/common-audit-usage-guide',
        'libraries/common-logging',
        'libraries/common-logging-usage-guide',
      ],
    },
    {
      type: 'category',
      label: 'Configuration & Properties',
      items: [
        'libraries/common-config',
        'libraries/common-config-usage-guide',
      ],
    },
    {
      type: 'category',
      label: 'Events & Messaging',
      items: [
        'libraries/common-events',
        'libraries/common-events-usage-guide',
        'libraries/common-messaging',
        'libraries/common-messaging-usage-guide',
        'libraries/message-library-v1.2.0',
        {
          type: 'link',
          label: '📚 Message Library v1.2.0 Docs →',
          href: '/docs/message-lib/',
        },
      ],
    },
    {
      type: 'category',
      label: 'Error Handling',
      items: [
        'libraries/common-exceptions',
        'libraries/common-exceptions-usage-guide',
      ],
    },
    {
      type: 'category',
      label: 'Security & Authentication',
      items: [
        'libraries/common-security',
        'libraries/common-security-usage-guide',
      ],
    },
    {
      type: 'category',
      label: 'Testing & Quality',
      items: [
        'libraries/common-test',
        'libraries/common-test-usage-guide',
      ],
    },
    {
      type: 'category',
      label: 'Other Libraries',
      items: [
        'libraries/common-cache',
        'libraries/common-dto',
        'libraries/common-models',
        'libraries/common-utils',
        'libraries/common-validation',
      ],
    },
  ],

  // Common Messaging Library v1.2.0 - Dedicated sidebar
  messagingLibSidebar: [
    {
      type: 'doc',
      id: 'message-lib/index',
      label: 'Overview',
    },
    {
      type: 'category',
      label: '🚀 Getting Started',
      items: [
        'message-lib/common-messaging-v1.2.0-quick-reference',
        'message-lib/rabbitmq-config-files-fixed',
      ],
    },
    {
      type: 'category',
      label: '📚 Complete Documentation',
      items: [
        'message-lib/common-messaging-v1.2.0-complete-guide',
        'message-lib/complete-rabbitmq-messaging-implementation',
      ],
    },
    {
      type: 'category',
      label: '🎨 Visual Documentation',
      items: [
        'message-lib/common-messaging-v1.2.0-diagrams',
      ],
    },
    {
      type: 'category',
      label: '🔧 Implementation Guides',
      items: [
        'message-lib/common-messaging-v1.2.0-implementation-complete',
      ],
    },
  ],

  // API Reference sidebar
  apiSidebar: [
    'api/overview',
    {
      type: 'category',
      label: 'REST APIs',
      items: [
        'api/authentication',
        'api/users',
        'api/products',
        'api/orders',
        'api/payments',
        'api/reviews',
      ],
    },
    {
      type: 'category',
      label: 'Events',
      items: [
        'api/event-overview',
        'api/event-schemas',
      ],
    },
  ],
};

export default sidebars;
