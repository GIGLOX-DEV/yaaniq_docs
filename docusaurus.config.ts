import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'YaniQ E-Commerce',
  tagline: 'Comprehensive Microservices E-Commerce Platform Documentation',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://yaniq.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/yaaniq_docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'yaniq', // Usually your GitHub org/user name.
  projectName: 'yaaniq_docs', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
markdown: {
    mermaid: true,
  },

  // ✅ Add Mermaid theme
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/yaniq/yaniq-monorepo/tree/main/documentation/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
// ✅ Optional: Mermaid color themes
    mermaid: {
      theme: { light: 'default', dark: 'dark' },
    },
    navbar: {
      title: '',
      logo: {
        alt: 'YaniQ Logo',
        src: 'img/yaniq-logo.svg',
        srcDark: 'img/yaniq-logo-white.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'servicesSidebar',
          position: 'left',
          label: 'Services',
        },
        {
          type: 'docSidebar',
          sidebarId: 'libsSidebar',
          position: 'left',
          label: 'Libraries',
        },
        {
          type: 'docSidebar',
          sidebarId: 'messagingLibSidebar',
          position: 'left',
          label: 'Message Library v1.2.0',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          type: 'custom-apiVersionSelector',
          position: 'right',
        },
        {
          href: 'https://github.com/GIGLOX-DEV',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Architecture',
              to: '/docs/architecture/overview',
            },
            {
              label: 'Services',
              to: '/docs/services/overview',
            },
            {
              label: 'Libraries',
              to: '/docs/libraries/overview',
            },
            {
              label: 'Message Library v1.2.0',
              to: '/docs/message-lib/',
            },
          ],
        },
        {
          title: 'Development',
          items: [
            {
              label: 'Setup Guide',
              to: '/docs/development/setup',
            },
            {
              label: 'Deployment',
              to: '/docs/deployment/overview',
            },
            {
              label: 'API Reference',
              to: '/docs/api/overview',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/yaniq/yaniq-monorepo',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} YaniQ. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'yaml', 'bash', 'docker', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
