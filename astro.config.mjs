// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
  site: 'https://docs.linuxlive.com',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'linuxlive docs',
      description: 'How to make a live Linux distro with linuxlive.com: the Workshop, the linuxlive.yaml spec, building, booting and troubleshooting.',
      logo: { src: './src/assets/logo.svg', alt: '' },
      favicon: '/favicon.svg',
      // Self-hosted fonts first, then the theme that uses them. Nothing loads from another site.
      customCss: [
        '@fontsource/ibm-plex-sans/400.css',
        '@fontsource/ibm-plex-sans/600.css',
        '@fontsource/ibm-plex-mono/400.css',
        '@fontsource/ibm-plex-mono/600.css',
        '@fontsource/newsreader/latin-500.css',
        './src/styles/theme.css',
      ],
      components: {
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
        SocialIcons: './src/components/SocialIcons.astro',
      },
      social: [{ icon: 'github', label: 'linuxlive on GitHub', href: 'https://github.com/Eric-Ness/linuxlive' }],
      editLink: { baseUrl: 'https://github.com/Eric-Ness/docs.linuxlive.com/edit/main/' },
      lastUpdated: false,
      plugins: [starlightLinksValidator()],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Overview', slug: 'index' },
            'start/how-it-works',
            'start/first-distro',
            'start/ways-to-build',
          ],
        },
        {
          label: 'The Workshop',
          items: [
            { label: 'Overview', slug: 'workshop' },
            'workshop/base',
            'workshop/desktop',
            'workshop/apps',
            'workshop/look',
            'workshop/settings',
            'workshop/extras',
            'workshop/get-it',
            'workshop/open-and-remix',
          ],
        },
        {
          label: 'Your distros',
          items: [
            'distros/my-distros',
            'distros/build-page',
            'distros/rebuilds-and-updates',
            'distros/library',
          ],
        },
        {
          label: 'Spec reference',
          items: [
            { label: 'Writing linuxlive.yaml', slug: 'spec' },
            'spec/reference',
            'spec/catalog',
            'spec/examples',
            'spec/boot-splash',
            'spec/dock',
            'spec/github-actions',
            'spec/building-locally',
          ],
        },
        {
          label: 'Troubleshooting',
          items: [
            'help/build-checks',
            'help/failed-builds',
            'help/virtualbox',
            'help/usb-stick',
            'help/secure-boot',
            'help/installing',
            'help/known-limits',
          ],
        },
        { label: 'Changelog', slug: 'changelog' },
      ],
    }),
  ],
});
