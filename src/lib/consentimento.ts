// Consentimento de cookies (LGPD) — seção 10.1. Nenhum script de terceiros
// carrega antes de uma escolha que o autorize.

export type Categoria = 'analise' | 'marketing';
export interface Escolha {
  analise: boolean;
  marketing: boolean;
  versao: string;
  data: string;
}

const CHAVE = 'quimicar-consentimento';
export const EVENTO_MUDOU = 'quimicar:consentimento';

export function lerEscolha(versaoAtual: string): Escolha | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const e = JSON.parse(bruto) as Escolha;
    // Nova versão da política exige nova escolha.
    return e.versao === versaoAtual ? e : null;
  } catch {
    return null;
  }
}

export function salvarEscolha(e: Omit<Escolha, 'data'>): Escolha {
  const completa = { ...e, data: new Date().toISOString() };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(completa));
  } catch {
    /* navegação privada: vale só para esta página */
  }
  window.dispatchEvent(new CustomEvent<Escolha>(EVENTO_MUDOU, { detail: completa }));
  return completa;
}
