// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Crop Track - Modulo XV',
  tagline: 'Monitoramento de Culturas Perenes com Drones e IA',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://inteli-college.github.io',
  baseUrl: '/2025-2A-T21-G112-INTERNO/',

  organizationName: 'inteli-college',
  projectName: '2025-2A-T21-G112-INTERNO',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/inteli-college/2025-2A-T21-G112-INTERNO/tree/main/Modulo XV/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Crop Track - Modulo XV',
        logo: {
          alt: 'Crop Track Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentacao',
          },
          {
            href: 'https://github.com/inteli-college/2025-2A-T21-G112-INTERNO',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentacao',
            items: [
              {
                label: 'Inicio',
                to: '/docs/',
              },
            ],
          },
          {
            title: 'Projeto',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/inteli-college/2025-2A-T21-G112-INTERNO',
              },
            ],
          },
        ],
        copyright: `Copyright ${new Date().getFullYear()} Crop Track - Inteli College. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
