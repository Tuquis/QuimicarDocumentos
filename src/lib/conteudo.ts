// Acesso único ao conteúdo: os componentes nunca têm texto comercial fixo.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { calcularEconomia, vendavel } from './produtos';

export type Produto = CollectionEntry<'produtos'>['data'];
export type Site = CollectionEntry<'site'>['data'];
export type Amostra = CollectionEntry<'amostras'>['data'];

const imagens = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{webp,png,jpg,jpeg,avif}', { eager: true });

/** Resolve "amostras/x/y.webp" (relativo a src/assets) para a imagem importada. */
export function imagem(caminho: string): ImageMetadata {
  const img = imagens[`/src/assets/${caminho}`];
  if (!img) throw new Error(`Imagem não encontrada em src/assets/: ${caminho}. Rode "npm run assets".`);
  return img.default;
}

export async function getSite(): Promise<Site> {
  const s = await getEntry('site', 'site');
  if (!s) throw new Error('src/content/site.yaml ausente');
  return s.data;
}

export async function getProdutos() {
  const lista = (await getCollection('produtos')).map((p) => p.data).sort((a, b) => a.ordem - b.ordem);
  const porId = Object.fromEntries(lista.map((p) => [p.id, p])) as Record<Produto['id'], Produto>;
  const economia = calcularEconomia(porId.conecta, porId.aplica, porId.completo);
  return { lista, porId, economia };
}

export { vendavel };

export async function getAmostra(id: 'conecta-acidos-e-bases' | 'aplica-q100-enem2025'): Promise<Amostra> {
  const a = await getEntry('amostras', id);
  if (!a) throw new Error(`Amostra ${id} ausente`);
  return a.data;
}

/** Duração do acesso só entra no texto se for a mesma nas três ofertas. */
export function fraseDuracaoAcesso(produtos: Produto[]): string {
  const valores = new Set(produtos.map((p) => p.duracao_acesso));
  const [unico] = [...valores];
  return valores.size === 1 && unico ? `O acesso aos materiais dura ${unico}.` : '';
}

export async function getFaqLp(produtos: Produto[]) {
  const duracao = fraseDuracaoAcesso(produtos);
  return (await getCollection('faq'))
    .map((f) => f.data)
    .filter((f) => f.exibir_na_lp && f.resposta)
    .sort((a, b) => a.ordem - b.ordem)
    .map((f) => ({ pergunta: f.pergunta, resposta: f.resposta!.replace('{{duracao_acesso}}', duracao).replace(/\s{2,}/g, ' ').trim() }));
}

export async function getPaginasLegaisPublicadas() {
  return (await getCollection('paginas-legais')).filter((p) => !p.data.rascunho);
}

export async function linkLegal(slug: 'termos-de-uso' | 'politica-de-privacidade' | 'politica-de-reembolso'): Promise<string | null> {
  const p = await getEntry('paginas-legais', slug);
  return p && !p.data.rascunho ? `/${slug}` : null;
}

export async function getDepoimentos() {
  return (await getCollection('depoimentos')).map((d) => d.data);
}

export function linkWhatsapp(numero: string | null): string | null {
  return numero ? `https://wa.me/${numero}` : null;
}

export function contatoSuporte(site: Site): { rotulo: string; href: string } | null {
  if (site.contato.email_suporte) return { rotulo: site.contato.email_suporte, href: `mailto:${site.contato.email_suporte}` };
  const wa = linkWhatsapp(site.contato.whatsapp);
  return wa ? { rotulo: 'WhatsApp', href: wa } : null;
}
