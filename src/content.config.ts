// Schemas do conteúdo (seção 4.2 do briefing). Os nomes de campo são os
// mesmos que o CMS da Fase 2 (Decap/Sveltia) vai editar.
import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';
import yaml from 'js-yaml';
import { CAMPOS_OBRIGATORIOS_PUBLICADO, camposPendentes } from './lib/produtos';

const opcional = <T extends z.ZodTypeAny>(s: T) => s.nullable().optional().transform((v) => v ?? null);
const texto = opcional(z.string().trim().min(1));

const produtos = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/produtos' }),
  schema: ({ image }) =>
    z
      .object({
        id: z.enum(['conecta', 'aplica', 'completo']),
        ordem: z.number().int(),
        nome: z.string(),
        status: z.enum(['rascunho', 'publicado', 'indisponivel']),
        subtitulo: z.string(),
        proposta: texto,
        descricao_curta: z.string(),
        descricao: texto,
        composicao: z.array(z.object({ item: z.string(), quantidade: z.number().int().positive() })).min(1),
        indicacao: texto,
        sequencia_de_uso: z.array(z.string()).default([]),
        temas: z.array(z.string()).default([]),
        distribuicao_por_ano: opcional(z.record(z.string(), z.number().int().nonnegative())),
        total_pdfs: opcional(z.number().int().positive()),
        total_paginas: opcional(z.number().int().positive()),
        preco: opcional(z.number().positive()),
        parcelamento: texto,
        checkout_url: opcional(z.string().url()),
        prazo_entrega: texto,
        duracao_acesso: texto,
        atualizacoes: texto,
        capa: opcional(image()),
        // Páginas reais exibidas no card da LP até a capa oficial chegar (caminhos em src/assets/).
        imagens_card: z.array(z.string()).default([]),
        galeria: z.array(z.object({ imagem: image(), legenda: z.string(), alt: z.string() })).default([]),
        selo: texto,
        cta_label: z.string(),
        ancora_demonstracao: z.string(),
        pagina_publicada: z.boolean().default(false),
      })
      .superRefine((p, ctx) => {
        // Build falha se um produto publicado estiver incompleto (seção 4.2).
        if (p.status !== 'publicado') return;
        for (const campo of camposPendentes(p)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [campo],
            message: `Produto "${p.id}" está "publicado" mas o campo "${campo}" está vazio. Preencha ou volte para "rascunho". Obrigatórios: ${CAMPOS_OBRIGATORIOS_PUBLICADO.join(', ')}.`,
          });
        }
      }),
});

const pagina = z.object({ imagem: z.string(), legenda: z.string(), alt: z.string() });

const amostras = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/amostras' }),
  schema: z.object({
    colecao: z.enum(['conecta', 'aplica']),
    titulo: z.string(),
    identificacao: z.string(),
    entrega_descricao: z.string(),
    pdfs: z.array(z.object({ arquivo: z.string(), titulo: z.string() })).min(1),
    paginas: z.array(pagina).default([]),
    etapas: z
      .array(
        z.object({
          numero: z.number(),
          nome: z.string(),
          lema: z.string(),
          descricao: z.string(),
          selo: texto,
          paginas: z.array(pagina).min(1),
        }),
      )
      .default([]),
    // Só APLICA: questão-base oficial e desafio autoral.
    questao_base: z
      .object({
        identificacao: z.string(),
        texto_resumido: z.string(),
        fonte: z.string(),
        pergunta: z.string(),
        alternativas: z.array(z.object({ letra: z.string(), texto: z.string() })),
        metodo: z.array(z.object({ etapa: z.string(), texto: z.string() })).length(5),
        nao_confunda: z.string(),
      })
      .optional(),
    desafio: z
      .object({
        selo: z.string(),
        enunciado: z.array(z.string()).min(1),
        equacao: z.string(),
        pergunta: z.string(),
        alternativas: z.array(z.object({ letra: z.string(), texto: z.string(), feedback: z.string(), hipotese: texto })).length(5),
        gabarito: z.string(),
        feedback_correta: z.string(),
        resolucao: z.array(z.object({ etapa: z.string(), texto: z.string() })).length(5),
        nao_confunda: z.object({ titulo: z.string(), texto: z.string() }),
      })
      .optional(),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/faq' }),
  schema: z.object({
    pergunta: z.string(),
    resposta: texto,
    ordem: z.number(),
    exibir_na_lp: z.boolean(),
  }),
});

const depoimentos = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/depoimentos' }),
  schema: z.object({
    nome: z.string(),
    texto: z.string(),
    contexto: texto,
    autorizado: z.literal(true),
    data_autorizacao: z.coerce.date(),
  }),
});

const paginasLegais = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/paginas-legais' }),
  schema: z.object({
    titulo: z.string(),
    rascunho: z.boolean().default(true),
    atualizado_em: z.coerce.date().optional(),
  }),
});

const opt = opcional;
const site = defineCollection({
  loader: file('./src/content/site.yaml', { parser: (t) => [{ id: 'site', ...(yaml.load(t) as object) }] }),
  schema: z.object({
    nome: z.string(),
    dominio: texto,
    plataforma_checkout: z.enum(['hotmart', 'kiwify']),
    fornecedor: z.object({ razao_social: texto, cnpj: texto, endereco: texto }),
    contato: z.object({
      email_suporte: opt(z.string().email()),
      whatsapp: opt(z.string().regex(/^\d{12,13}$/, 'Use só números, com DDI e DDD: 5511999998888')),
      instagram: texto,
      tiktok: texto,
    }),
    autoria: z.object({ nome: texto, foto: texto, bio: texto }),
    rastreamento: z.object({ ga4_id: texto, meta_pixel_id: texto, tiktok_pixel_id: texto }),
    turnstile_site_key: texto,
    brevo: z.object({
      lista_amostra_id: opt(z.number().int()),
      lista_marketing_id: opt(z.number().int()),
      template_amostra_id: opt(z.number().int()),
      remetente_email: opt(z.string().email()),
    }),
    versao_texto_consentimento: z.string(),
    versao_politica_cookies: z.string(),
  }),
});

export const collections = { produtos, amostras, faq, depoimentos, 'paginas-legais': paginasLegais, site };
