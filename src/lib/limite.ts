// Limite de envios do formulário: 3 por e-mail a cada 24 h e 10 por IP por hora.
// Usa Netlify Blobs em produção; em desenvolvimento, memória local.
// As chaves são hashes: o e-mail e o IP não ficam gravados em texto.
import { createHash } from 'node:crypto';

const REGRAS = {
  email: { max: 3, janelaMs: 24 * 60 * 60 * 1000 },
  ip: { max: 10, janelaMs: 60 * 60 * 1000 },
} as const;

interface Armazem {
  get(chave: string): Promise<number[] | null>;
  set(chave: string, valor: number[]): Promise<void>;
}

const memoria = new Map<string, number[]>();
const armazemMemoria: Armazem = {
  get: async (k) => memoria.get(k) ?? null,
  set: async (k, v) => void memoria.set(k, v),
};

let armazem: Armazem | null = null;
async function obterArmazem(): Promise<Armazem> {
  if (armazem) return armazem;
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'limite-amostra', consistency: 'strong' });
    armazem = {
      get: async (k) => ((await store.get(k, { type: 'json' })) as number[] | null) ?? null,
      set: async (k, v) => void (await store.setJSON(k, v)),
    };
    await armazem.get('teste'); // falha cedo fora do ambiente Netlify
  } catch {
    armazem = armazemMemoria;
  }
  return armazem;
}

const hash = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32);

export async function verificarLimite(email: string, ip: string): Promise<{ ok: boolean }> {
  const a = await obterArmazem();
  const agora = Date.now();
  const alvos = [
    { chave: `email-${hash(email.toLowerCase())}`, ...REGRAS.email },
    ...(ip ? [{ chave: `ip-${hash(ip)}`, ...REGRAS.ip }] : []),
  ];
  const registros = await Promise.all(alvos.map(async (t) => ((await a.get(t.chave)) ?? []).filter((ts) => agora - ts < t.janelaMs)));
  if (alvos.some((t, i) => registros[i].length >= t.max)) return { ok: false };
  await Promise.all(alvos.map((t, i) => a.set(t.chave, [...registros[i], agora])));
  return { ok: true };
}
