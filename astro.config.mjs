// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

// Domínio vem de src/content/site.yaml (P-16). Sem domínio, usa um provisório
// só para gerar URLs absolutas no build; não aparece como texto no site.
const site = /** @type {{ dominio?: string | null }} */ (yaml.load(readFileSync('./src/content/site.yaml', 'utf8')));
const dominio = site.dominio ? `https://${site.dominio.replace(/^https?:\/\//, '')}` : 'https://quimicar.netlify.app';

export default defineConfig({
  site: dominio,
  output: 'static',
  // No `astro dev` o adapter fica desligado: o emulador da Netlify exige Deno
  // (Edge Functions) e não é necessário para a LP. O endpoint /api/amostra
  // funciona igual no servidor de desenvolvimento.
  // imageCDN: false → AVIF/WebP/JPEG gerados no build (sharp), sem depender do CDN.
  adapter: process.argv.includes('dev') ? undefined : netlify({ imageCDN: false }),
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(obrigada|amostra-enviada)$/.test(page.replace(/\/$/, '')),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
