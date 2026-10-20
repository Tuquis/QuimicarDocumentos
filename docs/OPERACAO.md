# Operação do site — QUIMICAR ENEM

Guia para quem mantém o site. Nada aqui exige mexer em componentes: todo o conteúdo comercial fica em `src/content/`.

## 1. Rodar e publicar

```bash
npm install          # usa .npmrc (legacy-peer-deps) por causa de um bug do npm 10
npm run assets       # só quando trocar PDFs/logo em assets-originais/
npm run dev          # http://localhost:4321
npm run check        # astro check + testes
npm run build        # gera dist/ (falha se um produto "publicado" estiver incompleto)
```

Node 20.3+ (Astro 5). Na Netlify, o `netlify.toml` já define build, Node e cabeçalhos de segurança. Cada push no repositório publica automaticamente.

O primeiro build leva ~2 min (geração de AVIF/WebP/JPEG de todas as prévias); os seguintes usam cache.

## 2. Editar conteúdo

| O que | Onde |
|---|---|
| Preço, parcelamento, link de checkout, status | `src/content/produtos/{conecta,aplica,completo}.yaml` |
| Contatos, CNPJ, redes, autoria, IDs de pixel, Brevo | `src/content/site.yaml` |
| Perguntas frequentes | `src/content/faq/*.yaml` (`exibir_na_lp: true` para mostrar) |
| Termos, privacidade, reembolso | `src/content/paginas-legais/*.md` (mude `rascunho` para `false` e preencha `atualizado_em`) |
| Depoimentos reais autorizados | `src/content/depoimentos/*.yaml` (ver LEIA-ME na pasta) |
| Desafio interativo, método na prática, legendas das páginas | `src/content/amostras/*.yaml` |

### Colocar um produto à venda
1. Preencha `preco`, `parcelamento` (texto exato do checkout), `checkout_url`, `prazo_entrega` e `duracao_acesso`.
2. Mude `status: rascunho` para `status: publicado`.
3. `npm run build`: se faltar algo, o build falha dizendo qual campo.
4. Confira que o preço do site é **igual** ao do checkout.

A frase "Separadas, as coleções somam R$ X…" aparece sozinha quando os três produtos estão publicados e o COMPLETO custa menos que a soma.

`status: indisponivel` mostra "Indisponível no momento" sem botão de compra.

## 3. Checkout (Hotmart ou Kiwify)
- `plataforma_checkout` em `site.yaml`.
- Os botões repassam `utm_*` da visita e mapeiam `utm_source → src` e `utm_campaign → sck`.
- Configure `https://SEU-DOMINIO/obrigada` como página de obrigado/retorno na plataforma.
- **Compras (`Purchase`) não são enviadas pelo site.** Ative a integração nativa de pixel (Meta/TikTok/GA4) dentro da Hotmart/Kiwify, ou um webhook. Isso evita contagem duplicada.

## 4. Formulário de amostra + Brevo
Variáveis de ambiente na Netlify (Site settings → Environment variables), nunca no código:
- `BREVO_API_KEY`
- `TURNSTILE_SECRET_KEY` (opcional, mas recomendado)

No Brevo:
1. Crie os atributos de contato: `FIRSTNAME` (texto), `AMOSTRA_SOLICITADA` (texto), `DATA_SOLICITACAO` (data/texto), `ORIGEM` (texto), `MARKETING_OPTIN` (booleano), `MARKETING_OPTIN_DATA` (texto), `MARKETING_OPTIN_TEXTO_VERSAO` (texto).
2. Crie as listas "Amostra solicitada" e "Marketing"; anote os IDs em `site.yaml` → `brevo`.
3. E-mail: ou crie um template transacional (parâmetros `NOME`, `AMOSTRA`, `LINKS` [lista com `titulo` e `url`], `LINK_COLECOES`, `SUPORTE`) e informe `template_amostra_id`, ou só informe `remetente_email` para usar o e-mail padrão embutido.
4. **Autentique o domínio** em Brevo → Senders & Domains: adicione no DNS os registros SPF, DKIM (e o código Brevo) e um DMARC, por exemplo `_dmarc  TXT  "v=DMARC1; p=none; rua=mailto:SEU-EMAIL"`. Teste no Gmail e no Outlook.
5. Confira o limite diário de envios do plano gratuito na documentação atual do Brevo.

Regras já implementadas: a amostra é enviada sempre; a lista Marketing só recebe quem marcou a caixa; limite de 3 envios por e-mail/24 h e 10 por IP/hora (Netlify Blobs); e-mails mascarados nos logs.

**Em produção o formulário fica bloqueado enquanto a Política de Privacidade estiver em rascunho** (exigência do briefing).

## 5. Pixels e cookies
Preencha `ga4_id`, `meta_pixel_id`, `tiktok_pixel_id` em `site.yaml`. Nenhum script carrega antes do consentimento (Consent Mode v2 em `denied`). Para forçar nova escolha de todos os visitantes, mude `versao_politica_cookies`.

Teste: GA4 DebugView, Meta Events Manager → Test Events, TikTok Events Manager. Eventos: `page_view`, `ver_colecao`, `abrir_amostra`, `desafio_respondido`, `clique_checkout`, `lead_amostra`.

## 6. Domínio
Netlify → Domain management → adicionar domínio → apontar DNS. HTTPS é automático. Depois preencha `dominio` em `site.yaml` (URLs canônicas, sitemap e Open Graph).

## 7. Backup e restauração
O repositório Git **é** o backup (conteúdo, código, imagens). Para restaurar uma versão: Netlify → Deploys → escolher um deploy antigo → "Publish deploy". Contatos ficam no Brevo (exportação CSV em Contacts).

## 8. Custos recorrentes (lançamento)
| Item | Custo |
|---|---|
| Netlify (plano gratuito) | R$ 0 |
| Brevo (plano gratuito) | R$ 0 (limite diário de envios) |
| Cloudflare Turnstile | R$ 0 |
| Domínio .com.br | ~R$ 40/ano (Registro.br) |
| Taxas da plataforma de checkout | % por venda |

## 9. Fase 2 (painel sem código)
Os schemas em `src/content.config.ts` já usam os nomes de campo do briefing; o Decap/Sveltia CMS em `/admin` pode ser adicionado por cima, sem migração.
