# Pendências — QUIMICAR ENEM

Atualizado em 20/10/2026. Enquanto um item estiver aberto, o bloco correspondente fica **oculto** no site (nada provisório é exibido).

## Da especificação (seção 14 do briefing)

| ID | Pendência | Responsável | Bloqueia |
|---|---|---|---|
| P-01 | Plataforma de checkout definitiva (Hotmart ou Kiwify) e links de checkout das 3 ofertas | Proprietária | Botões de compra |
| P-02 | Preços e parcelamento das 3 ofertas | Proprietária | Bloco de preço, economia do combo |
| P-03 | Nome, foto e biografia aprovados da autoria | Proprietária | Seção 7.10 |
| P-04 | Lista de temas do CONECTA e do APLICA | Proprietária | Composição detalhada |
| P-05 | Total de arquivos PDF e de páginas por coleção | Proprietária | Composição detalhada |
| P-06 | Distribuição das 50 questões do APLICA por ano (2023/2024/2025) | Proprietária | Página do APLICA |
| P-07 | Duração do acesso e prazo de liberação | Proprietária | Condições, FAQ 6 |
| P-08 | Política de atualizações | Proprietária | Condições |
| P-09 | Canais de suporte (e-mail, WhatsApp) | Proprietária | Rodapé, erros, `/obrigada` |
| P-10 | Razão social, CNPJ e endereço do fornecedor | Proprietária | Rodapé (obrigatório no comércio eletrônico) |
| P-11 | Textos de termos de uso, privacidade (citar público adolescente) e reembolso | Proprietária | Formulário em produção, rodapé |
| P-12 | **Divergência:** a questão comentada do CONECTA (Ácidos e Bases) tem o selo "QUESTÃO ENEM 2016", mas o briefing diz que as questões do CONECTA são autorais, não oficiais. Confirmar se é oficial (então identificar com ano/aplicação/caderno/número e revisar os textos do CONECTA) ou autoral (então corrigir o selo no PDF) | Proprietária | Rótulo na demonstração, FAQ 4 |
| P-13 | Confirmar se as amostras recebidas são o material gratuito oficial enviado por e-mail | Proprietária | Entrega do formulário |
| P-14 | **Professores** como público secundário × licença "uso pessoal, sem redistribuição": definir se haverá licença para uso em sala | Proprietária | Seção 7.7 |
| P-15 | Logo em SVG ou PNG transparente original, e versão para fundo escuro | Proprietária | Qualidade da marca |
| P-16 | Domínio, contas de hospedagem, Brevo, Meta Business, TikTok Ads e GA4 em nome da proprietária, com acesso delegado | Proprietária | Publicação |
| P-17 | **Nomenclatura:** os PDFs dizem "RESPOSTA INTELIGENTE"; o briefing e a apresentação dizem "Resolução Inteligente". Padronizar (o site usa "Resolução Inteligente" até a decisão) | Proprietária | Consistência |
| P-18 | Respostas para as FAQs 9 e 10 | Proprietária | FAQ |
| P-19 | Depoimentos reais com autorização de uso (após uma turma de teste ou as primeiras vendas) | Proprietária | Seção de prova social (futura) |

---

## Encontradas durante o desenvolvimento

| ID | Pendência | Responsável | Bloqueia |
|---|---|---|---|
| P-20 | **Promessa no PDF:** a página 4 de "A Ciência por Trás da Questão" (Q100) tem o título "A nuance científica que *garante o acerto*", o que contraria a regra de não prometer acerto. Sugestão: "A nuance científica que decide a questão". O PDF é enviado como amostra grátis | Proprietária | Amostra por e-mail |
| P-21 | **Cores das etapas nos PDFs** (CONECTE roxo, ACERTE verde) diferem do manual/briefing (CONECTE e ACERTE laranja). O site segue o briefing | Proprietária | Consistência visual |
| P-22 | **Resolução do mapa do CONECTA:** a imagem dentro do PDF tem só 939 px de largura; no zoom do lightbox, os textos pequenos ficam no limite da legibilidade. Pedir o arquivo em resolução maior | Proprietária | Qualidade da prévia |
| P-23 | Logo para **fundo escuro** (P-15): no CTA final a logo aparece sobre uma placa branca até chegar a versão adequada | Proprietária | Seção 7.13 |
| P-24 | FAQ 7 citava "página de contato" (Fase 2). Texto ajustado para "canal de atendimento indicado no rodapé desta página". Confirmar | Proprietária | FAQ |
| P-25 | Seção "Para quem é": o bloco "Não é para" (texto do briefing 7.7) cita "videoaulas ou aulas ao vivo" para negá-las. É a única ocorrência dessas palavras e é intencional | Dev | Checklist de palavras proibidas |
| P-26 | Turnstile: criar o widget no Cloudflare (chave pública em `site.yaml` → `turnstile_site_key`, secreta em `TURNSTILE_SECRET_KEY`). Sem as chaves, o formulário funciona só com honeypot + limite | Proprietária/Dev | Antispam completo |

## Já resolvidas no código

- P-12: até a resposta, a questão do CONECTA é rotulada só como "Questão comentada visualmente" (sem dizer oficial/autoral).
- P-17: o site usa "Resolução Inteligente".
- P-14: bloco de professores com o texto conservador (licença pessoal, sem uso em sala).
- P-13: as amostras recebidas são usadas como material gratuito, comprimidas em `public/amostras/` (0,08–0,79 MB cada).
