import { describe, expect, it } from 'vitest';
import { calcularEconomia, camposPendentes, vendavel, type ProdutoBase } from '../src/lib/produtos';

const pub = (id: string, preco: number | null): ProdutoBase => ({
  id,
  status: 'publicado',
  preco,
  checkout_url: 'https://pay.exemplo.com/x',
  composicao: [{ item: 'Mapas', quantidade: 80 }],
  duracao_acesso: '12 meses',
  prazo_entrega: 'após a confirmação do pagamento',
});

describe('calcularEconomia', () => {
  it('não exibe economia sem preços', () => {
    expect(calcularEconomia(pub('conecta', null), pub('aplica', 100), pub('completo', 150))).toBeNull();
    expect(calcularEconomia(pub('conecta', 100), pub('aplica', 100), pub('completo', null))).toBeNull();
  });

  it('não exibe economia quando o combo custa mais ou o mesmo que a soma', () => {
    expect(calcularEconomia(pub('conecta', 100), pub('aplica', 100), pub('completo', 250))).toBeNull();
    expect(calcularEconomia(pub('conecta', 100), pub('aplica', 100), pub('completo', 200))).toBeNull();
  });

  it('exibe economia quando o combo custa menos que a soma', () => {
    expect(calcularEconomia(pub('conecta', 97.9), pub('aplica', 127.9), pub('completo', 177))).toEqual({
      somaSeparadas: 225.8,
      precoCombo: 177,
    });
  });

  it('não exibe economia se algum produto estiver em rascunho', () => {
    const rascunho = { ...pub('aplica', 100), status: 'rascunho' as const };
    expect(calcularEconomia(pub('conecta', 100), rascunho, pub('completo', 150))).toBeNull();
  });
});

describe('validação de produto publicado', () => {
  it('aponta campos obrigatórios vazios', () => {
    const p = { ...pub('conecta', null), checkout_url: null, composicao: [] };
    expect(camposPendentes(p)).toEqual(['preco', 'checkout_url', 'composicao']);
    expect(vendavel(p)).toBe(false);
  });

  it('aceita produto completo', () => {
    expect(camposPendentes(pub('conecta', 50))).toEqual([]);
    expect(vendavel(pub('conecta', 50))).toBe(true);
  });
});

import { mascararEmail } from '../src/lib/email';
describe('mascararEmail', () => {
  it('mascara o usuário e mantém o domínio', () => {
    expect(mascararEmail('joana.silva@gmail.com')).toBe('jo***@gmail.com');
    expect(mascararEmail('a@b.com')).toBe('a***@b.com');
    expect(mascararEmail('invalido')).toBe('***');
  });
});
