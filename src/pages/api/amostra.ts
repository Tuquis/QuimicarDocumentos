// POST /api/amostra — formulário de amostra grátis (seção 9.2).
// Valida → honeypot → Turnstile → limite de envios → contato no Brevo →
// e-mail transacional com o link do PDF gratuito. Nunca registra o e-mail completo.
import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { getAmostra, getSite, linkLegal, contatoSuporte, type Site } from '@/lib/conteudo';
import { mascararEmail } from '@/lib/email';
import { verificarLimite } from '@/lib/limite';

export const prerender = false;

const Entrada = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  nome: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => (v ? v.split(/\s+/)[0] : '')),
  amostra: z.enum(['conecta', 'aplica', 'ambas']).default('ambas'),
  marketing_optin: z
    .union([z.literal('sim'), z.literal('on'), z.literal(''), z.boolean()])
    .optional()
    .transform((v) => v === 'sim' || v === 'on' || v === true),
  site_url: z.string().optional(), // honeypot
  utm_source: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
  'cf-turnstile-response': z.string().optional(),
});

const BREVO = 'https://api.brevo.com/v3';

export const POST: APIRoute = async ({ request, clientAddress, site: urlSite }) => {
  const querJson = (request.headers.get('accept') ?? '').includes('application/json');
  const site = await getSite();
  const suporte = contatoSuporte(site);
  const falhaGenerica = `Não conseguimos enviar agora. Tente de novo em alguns minutos${suporte ? ` ou fale com a gente em ${suporte.rotulo}` : ''}.`;

  const responder = (status: number, corpo: { ok: boolean; mensagem?: string; campo?: string; para?: string }) => {
    if (querJson) return Response.json(corpo, { status, headers: { 'Cache-Control': 'no-store' } });
    if (corpo.ok) {
      return new Response(null, { status: 303, headers: { Location: `/amostra-enviada?para=${encodeURIComponent(corpo.para ?? '')}` } });
    }
    return new Response(paginaErro(corpo.mensagem ?? falhaGenerica), { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  };

  // Entrada: JSON (com JS) ou formulário (sem JS).
  let bruto: Record<string, unknown>;
  try {
    const tipo = request.headers.get('content-type') ?? '';
    bruto = tipo.includes('application/json') ? await request.json() : Object.fromEntries((await request.formData()).entries());
  } catch {
    return responder(400, { ok: false, mensagem: 'Não entendemos o envio. Recarregue a página e tente de novo.' });
  }

  const dados = Entrada.safeParse(bruto);
  if (!dados.success) {
    const campoEmail = dados.error.issues.some((i) => i.path[0] === 'email');
    return responder(422, campoEmail ? { ok: false, campo: 'email', mensagem: 'Confira o e-mail: parece que falta alguma parte (ex.: nome@gmail.com).' } : { ok: false, mensagem: 'Confira os dados e tente de novo.' });
  }
  const d = dados.data;
  const mascarado = mascararEmail(d.email);

  // Honeypot preenchido: finge sucesso para não ensinar o robô.
  if (d.site_url) return responder(200, { ok: true, para: mascarado });

  const producao = !import.meta.env.DEV;
  // A política de privacidade é obrigatória antes de ativar o formulário em produção.
  if (producao && !(await linkLegal('politica-de-privacidade'))) {
    console.error('[amostra] formulário bloqueado: política de privacidade em rascunho');
    return responder(503, { ok: false, mensagem: falhaGenerica });
  }

  const segredoTurnstile = import.meta.env.TURNSTILE_SECRET_KEY ?? process.env.TURNSTILE_SECRET_KEY;
  if (segredoTurnstile) {
    const ok = await verificarTurnstile(segredoTurnstile, d['cf-turnstile-response'] ?? '', clientAddress);
    if (!ok) return responder(400, { ok: false, mensagem: 'Não conseguimos confirmar que você não é um robô. Recarregue a página e tente de novo.' });
  }

  const limite = await verificarLimite(d.email, clientAddress);
  if (!limite.ok) {
    return responder(429, { ok: false, mensagem: 'Recebemos vários pedidos seguidos. Confira sua caixa de entrada (e as pastas Spam e Promoções) ou tente de novo mais tarde.' });
  }

  const chave = import.meta.env.BREVO_API_KEY ?? process.env.BREVO_API_KEY;
  if (!chave) {
    if (!producao) {
      console.info(`[amostra] (dev, sem BREVO_API_KEY) simulado: ${mascarado} · ${d.amostra} · marketing=${d.marketing_optin}`);
      return responder(200, { ok: true, para: mascarado });
    }
    console.error('[amostra] BREVO_API_KEY ausente');
    return responder(503, { ok: false, mensagem: falhaGenerica });
  }

  try {
    await salvarContato(chave, site, d);
    await enviarEmail(chave, site, d, new URL('/', urlSite ?? request.url).origin);
  } catch (e) {
    console.error(`[amostra] falha no Brevo para ${mascarado}:`, e instanceof Error ? e.message : e);
    return responder(502, { ok: false, mensagem: falhaGenerica });
  }

  console.info(`[amostra] enviada: ${mascarado} · ${d.amostra} · marketing=${d.marketing_optin}`);
  return responder(200, { ok: true, para: mascarado });
};

type Dados = z.infer<typeof Entrada>;

async function verificarTurnstile(segredo: string, token: string, ip: string): Promise<boolean> {
  if (!token) return false;
  try {
    const corpo = new FormData();
    corpo.append('secret', segredo);
    corpo.append('response', token);
    if (ip) corpo.append('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: corpo });
    const j = (await r.json()) as { success?: boolean };
    return !!j.success;
  } catch {
    return false;
  }
}

async function brevo(chave: string, caminho: string, corpo: unknown) {
  const r = await fetch(`${BREVO}${caminho}`, {
    method: 'POST',
    headers: { 'api-key': chave, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(corpo),
  });
  // 201 criado, 204 atualizado
  if (!r.ok) throw new Error(`Brevo ${caminho} → ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function salvarContato(chave: string, site: Site, d: Dados) {
  const agora = new Date().toISOString();
  const attributes: Record<string, string | boolean> = {
    AMOSTRA_SOLICITADA: d.amostra,
    DATA_SOLICITACAO: agora,
    ORIGEM: [d.utm_source, d.utm_campaign].filter(Boolean).join(' / ') || 'direto',
  };
  if (d.nome) attributes.FIRSTNAME = d.nome;
  // Autorização de marketing registrada separadamente, só quando marcada.
  if (d.marketing_optin) {
    attributes.MARKETING_OPTIN = true;
    attributes.MARKETING_OPTIN_DATA = agora;
    attributes.MARKETING_OPTIN_TEXTO_VERSAO = site.versao_texto_consentimento;
  }
  const listIds = [site.brevo.lista_amostra_id, d.marketing_optin ? site.brevo.lista_marketing_id : null].filter((n): n is number => typeof n === 'number');
  await brevo(chave, '/contacts', { email: d.email, attributes, listIds, updateEnabled: true });
}

async function enviarEmail(chave: string, site: Site, d: Dados, origem: string) {
  const ids = d.amostra === 'ambas' ? (['conecta-acidos-e-bases', 'aplica-q100-enem2025'] as const) : d.amostra === 'conecta' ? (['conecta-acidos-e-bases'] as const) : (['aplica-q100-enem2025'] as const);
  const amostras = await Promise.all(ids.map((id) => getAmostra(id)));
  const links = amostras.flatMap((a) => a.pdfs.map((p) => ({ titulo: p.titulo, url: `${origem}${p.arquivo}` })));
  const identificacao = amostras.map((a) => a.entrega_descricao).join(' + ');
  const suporte = contatoSuporte(site);
  const params = {
    NOME: d.nome || '',
    AMOSTRA: identificacao,
    LINKS: links,
    LINK_COLECOES: `${origem}/#colecoes`,
    SUPORTE: suporte?.rotulo ?? '',
  };
  const para = [{ email: d.email, ...(d.nome ? { name: d.nome } : {}) }];

  if (site.brevo.template_amostra_id) {
    await brevo(chave, '/smtp/email', { to: para, templateId: site.brevo.template_amostra_id, params });
    return;
  }
  if (!site.brevo.remetente_email) throw new Error('Sem template_amostra_id nem remetente_email em site.yaml');
  await brevo(chave, '/smtp/email', {
    sender: { name: site.nome, email: site.brevo.remetente_email },
    to: para,
    subject: 'Seu material gratuito QUIMICAR chegou',
    htmlContent: htmlEmail(params, suporte?.href ?? null),
  });
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** E-mail transacional padrão (usado quando não há template no Brevo). Sem conteúdo promocional além de um link para as coleções. */
function htmlEmail(p: { NOME: string; AMOSTRA: string; LINKS: { titulo: string; url: string }[]; LINK_COLECOES: string; SUPORTE: string }, suporteHref: string | null) {
  const botoes = p.LINKS.map(
    (l) => `<tr><td style="padding:6px 0"><a href="${esc(l.url)}" style="display:inline-block;background:#FF9000;color:#0B2342;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:999px">Baixar: ${esc(l.titulo)}</a></td></tr>`,
  ).join('');
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#E8EDF2;font-family:Arial,Helvetica,sans-serif;color:#333">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px" cellpadding="0" cellspacing="0"><tr><td style="padding:28px">
<p style="font-size:13px;letter-spacing:.06em;color:#00788F;font-weight:700;margin:0">QUIMICAR ENEM · MATERIAL GRATUITO</p>
<h1 style="font-size:24px;color:#0B2342;margin:12px 0">${p.NOME ? `Olá, ${esc(p.NOME)}!` : 'Olá!'} Seu material chegou.</h1>
<p style="font-size:16px;line-height:1.6">Você pediu: <strong>${esc(p.AMOSTRA)}</strong>.</p>
<table role="presentation" cellpadding="0" cellspacing="0">${botoes}</table>
<h2 style="font-size:18px;color:#0B2342;margin:24px 0 8px">Como estudar com este material</h2>
<ol style="font-size:15px;line-height:1.6;padding-left:20px;margin:0">
<li>No CONECTA, estude o mapa visual e depois acompanhe a questão comentada.</li>
<li>No APLICA, comece pelo Raio-X e leia A Ciência por Trás da Questão.</li>
<li>Tente o Desafio antes de olhar a Resolução Inteligente.</li>
<li>Compare o seu caminho com a resolução e anote o que revisar.</li>
</ol>
<p style="font-size:15px;line-height:1.6;margin-top:20px">Quer conhecer as coleções completas? <a href="${esc(p.LINK_COLECOES)}" style="color:#00788F">Veja as coleções QUIMICAR</a>.</p>
${p.SUPORTE && suporteHref ? `<p style="font-size:14px;color:#687280">Dúvidas? Fale com a gente: <a href="${esc(suporteHref)}" style="color:#00788F">${esc(p.SUPORTE)}</a></p>` : ''}
<p style="font-size:13px;color:#687280;margin-top:20px">Materiais digitais em PDF para leitura e impressão pessoal.</p>
</td></tr></table></td></tr></table></body></html>`;
}

function paginaErro(mensagem: string) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Não foi possível enviar | QUIMICAR ENEM</title></head>
<body style="font-family:system-ui,sans-serif;max-width:560px;margin:48px auto;padding:0 16px;color:#333;background:#fff"><h1 style="color:#0B2342">Não foi possível enviar</h1><p style="font-size:18px;line-height:1.6">${esc(mensagem)}</p><p><a href="/#amostra" style="color:#00788F;font-weight:700">Voltar ao formulário</a></p></body></html>`;
}
