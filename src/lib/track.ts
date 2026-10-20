// Camada de eventos (seção 10.2). Despacha só para as ferramentas consentidas
// e configuradas. "Purchase" NUNCA é disparado pelo site: a venda é contada
// pela integração da plataforma de checkout.
import { EVENTO_MUDOU, lerEscolha, type Escolha } from './consentimento';

export type Evento = 'page_view' | 'ver_colecao' | 'abrir_amostra' | 'desafio_respondido' | 'clique_checkout' | 'lead_amostra';
type Params = Record<string, string | number | boolean | undefined>;

interface Config {
  ga4: string | null;
  meta: string | null;
  tiktok: string | null;
  versao: string;
  dev: boolean;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
    ttq?: { load: (id: string) => void; page: () => void; track: (e: string, p?: object) => void; [k: string]: unknown };
    TiktokAnalyticsObject?: string;
    __quimicarTrack?: { config: Config };
  }
}

const MAPA: Record<Evento, { ga4?: string; meta?: string; tiktok?: string }> = {
  page_view: { ga4: 'page_view', meta: 'PageView', tiktok: 'page' },
  ver_colecao: { ga4: 'view_item', meta: 'ViewContent', tiktok: 'ViewContent' },
  abrir_amostra: { ga4: 'select_content', tiktok: 'ClickButton' },
  desafio_respondido: { ga4: 'desafio_respondido' },
  clique_checkout: { ga4: 'begin_checkout', meta: 'InitiateCheckout', tiktok: 'InitiateCheckout' },
  lead_amostra: { ga4: 'generate_lead', meta: 'Lead', tiktok: 'SubmitForm' },
};

let cfg: Config | null = null;
let escolha: Escolha | null = null;
const carregados = { ga4: false, meta: false, tiktok: false };

function script(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function carregarGa4(id: string) {
  if (carregados.ga4) return;
  carregados.ga4 = true;
  script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  // page_view é enviado pela camada de eventos, uma vez.
  window.gtag('config', id, { send_page_view: false });
}

function carregarMeta(id: string) {
  if (carregados.meta) return;
  carregados.meta = true;
  /* eslint-disable */
  const n: any = (window.fbq = function (...a: unknown[]) {
    n.callMethod ? n.callMethod(...a) : n.queue.push(a);
  } as any);
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  /* eslint-enable */
  script('https://connect.facebook.net/en_US/fbevents.js');
  window.fbq!('init', id);
}

function carregarTiktok(id: string) {
  if (carregados.tiktok) return;
  carregados.tiktok = true;
  // Fila mínima compatível com o snippet oficial do TikTok Pixel.
  window.TiktokAnalyticsObject = 'ttq';
  const fila: unknown[] = [];
  const ttq: any = (window.ttq = { _i: {}, _t: {}, _o: {}, queue: fila } as any);
  for (const m of ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']) {
    ttq[m] = (...a: unknown[]) => fila.push([m, ...a]);
  }
  ttq.load = (pixel: string) => {
    ttq._i[pixel] = [];
    ttq._t[pixel] = +new Date();
    script(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(pixel)}&lib=ttq`);
  };
  ttq.load(id);
}

function aplicarConsentimento() {
  if (!cfg) return;
  if (escolha?.analise && cfg.ga4) carregarGa4(cfg.ga4);
  if (escolha?.marketing && cfg.meta) carregarMeta(cfg.meta);
  if (escolha?.marketing && cfg.tiktok) carregarTiktok(cfg.tiktok);
  if (escolha?.marketing) window.gtag?.('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
}

export function iniciarTrack(config: Config) {
  cfg = config;
  window.__quimicarTrack = { config };
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  escolha = lerEscolha(config.versao);
  aplicarConsentimento();
  if (escolha) track('page_view');
  window.addEventListener(EVENTO_MUDOU, (e) => {
    const primeira = !escolha;
    escolha = (e as CustomEvent<Escolha>).detail;
    aplicarConsentimento();
    if (primeira) track('page_view');
  });
}

export function track(evento: Evento, params: Params = {}) {
  if (!cfg) return;
  if (cfg.dev) {
    console.debug('[track]', evento, params);
    return;
  }
  const m = MAPA[evento];
  if (m.ga4 && carregados.ga4) window.gtag('event', m.ga4, params);
  if (m.meta && carregados.meta) window.fbq?.('track', m.meta, params.value !== undefined ? { content_name: params.content_name, value: params.value, currency: 'BRL' } : {});
  if (m.tiktok && carregados.tiktok) {
    if (m.tiktok === 'page') window.ttq?.page();
    else window.ttq?.track(m.tiktok, params.value !== undefined ? { content_name: params.content_name, value: params.value, currency: 'BRL' } : {});
  }
}
