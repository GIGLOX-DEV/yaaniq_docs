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
      label: 'Common Libraries',
      items: [
        'libraries/common-api',
        'libraries/common-audit',
        'libraries/common-cache',
        'libraries/common-config',
        'libraries/common-dto',
        'libraries/common-events',
        'libraries/common-exceptions',
        'libraries/common-logging',
        'libraries/common-messaging',
        'libraries/common-models',
        'libraries/common-security',
        'libraries/common-test',
        'libraries/common-utils',
        'libraries/common-validation',
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
