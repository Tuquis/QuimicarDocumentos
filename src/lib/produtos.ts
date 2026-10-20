// Regras de negócio dos produtos, sem dependência do Astro (testáveis).

export const CAMPOS_OBRIGATORIOS_PUBLICADO = ['preco', 'checkout_url', 'composicao', 'duracao_acesso', 'prazo_entrega'] as const;

type Status = 'rascunho' | 'publicado' | 'indisponivel';

export interface ProdutoBase {
  id: string;
  status: Status;
  preco: number | null;
  checkout_url?: string | null;
  composicao?: { item: string; quantidade: number }[] | null;
  duracao_acesso?: string | null;
  prazo_entrega?: string | null;
}

export function camposPendentes(p: ProdutoBase): string[] {
  return CAMPOS_OBRIGATORIOS_PUBLICADO.filter((c) => {
    const v = p[c];
    if (Array.isArray(v)) return v.length === 0;
    return v === null || v === undefined || v === '';
  });
}

/** Produto pode ser comprado no site: publicado e com todos os dados essenciais. */
export function vendavel(p: ProdutoBase): boolean {
  return p.status === 'publicado' && camposPendentes(p).length === 0;
}

export interface Economia {
  somaSeparadas: number;
  precoCombo: number;
}

/**
 * Economia do combo (seção 4.2): só existe se os três preços estiverem
 * cadastrados, os três produtos estiverem vendáveis e o combo custar menos
 * que a soma das coleções separadas.
 */
export function calcularEconomia(conecta?: ProdutoBase, aplica?: ProdutoBase, completo?: ProdutoBase): Economia | null {
  if (!conecta || !aplica || !completo) return null;
  if (![conecta, aplica, completo].every(vendavel)) return null;
  const [a, b, c] = [conecta.preco, aplica.preco, completo.preco];
  if (!valido(a) || !valido(b) || !valido(c)) return null;
  const soma = Math.round((a + b) * 100) / 100;
  if (!(c < soma)) return null;
  return { somaSeparadas: soma, precoCombo: c };
}

function valido(n: number | null | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarPreco = (v: number) => brl.format(v).replace(/ /g, ' ');
