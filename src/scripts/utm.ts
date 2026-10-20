// Guarda os utm_* da URL de entrada e os repassa aos links de checkout
// (seção 9.1). Na Hotmart, utm_source → src e utm_campaign → sck.
import { track } from '@/lib/track';

const CHAVE = 'quimicar-utm';
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

function lerSalvos(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE) || '{}');
  } catch {
    return {};
  }
}

export function utmsDaSessao(): Record<string, string> {
  const atuais = new URLSearchParams(location.search);
  const salvos = lerSalvos();
  const novos: Record<string, string> = {};
  for (const k of UTM) {
    const v = atuais.get(k);
    if (v) novos[k] = v.slice(0, 120);
  }
  const final = Object.keys(novos).length ? novos : salvos;
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(final));
  } catch {
    /* sem armazenamento: usa só a URL atual */
  }
  return final;
}

export function iniciarUtm(plataforma: 'hotmart' | 'kiwify') {
  const utms = utmsDaSessao();
  document.querySelectorAll<HTMLAnchorElement>('a[data-checkout]').forEach((a) => {
    try {
      const url = new URL(a.href);
      for (const [k, v] of Object.entries(utms)) url.searchParams.set(k, v);
      // Parâmetros de rastreamento aceitos pelas plataformas (src/sck).
      if (utms.utm_source) url.searchParams.set('src', utms.utm_source);
      if (utms.utm_campaign) url.searchParams.set('sck', utms.utm_campaign);
      if (plataforma === 'kiwify' && utms.utm_source) url.searchParams.set('utm_source', utms.utm_source);
      a.href = url.toString();
    } catch {
      /* href inválido: mantém */
    }
    a.addEventListener('click', () => {
      const valor = Number(a.dataset.valor);
      track('clique_checkout', {
        content_name: a.dataset.checkout,
        value: Number.isFinite(valor) && valor > 0 ? valor : undefined,
        currency: 'BRL',
      });
    });
  });
}
