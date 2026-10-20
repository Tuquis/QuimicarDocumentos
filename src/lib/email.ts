// Utilidades de e-mail compartilhadas entre o formulário e o endpoint.

// Validação pragmática (o servidor confirma com Zod).
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "joana.silva@gmail.com" → "jo***@gmail.com" (nunca exibir/registrar completo). */
export function mascararEmail(email: string): string {
  const [usuario, dominio] = email.split('@');
  if (!usuario || !dominio) return '***';
  return `${usuario.slice(0, Math.min(2, usuario.length))}***@${dominio}`;
}

export type OpcaoAmostra = 'conecta' | 'aplica' | 'ambas';
