# QUIMICAR ENEM — Especificação de desenvolvimento da landing page

> Documento de execução para o Claude Code. Versão 1.0, 20/10/2026.
> Fontes: briefing da proprietária v5 (`docs/referencias/briefing-cliente-v5.pdf`), apresentação institucional (`docs/referencias/apresentacao-institucional.md`), manual de identidade visual (`docs/referencias/manual-identidade-visual.png`), reunião de briefing com o cliente e amostras reais em `assets-originais/amostras/`.
> Em caso de conflito entre este documento e as referências, **este documento prevalece**. Se encontrar um conflito que este documento não resolve, registre em `docs/PENDENCIAS.md` e siga a opção mais conservadora.

---

## 1. Contexto

**Produto.** QUIMICAR ENEM vende materiais digitais em PDF de Química para o ENEM, para leitura e impressão pessoal. Não são aulas nem cursos.

**Ofertas do lançamento**

| Oferta | Composição | Função |
|---|---|---|
| **QUIMICAR CONECTA** | 80 mapas visuais + 80 questões didáticas autorais comentadas visualmente, em pares (um mapa + uma questão por tema) | Construir a compreensão, estudar e revisar |
| **QUIMICAR APLICA** | 50 conjuntos com 4 materiais cada, todos ligados à mesma questão oficial do ENEM (2023, 2024 e 2025): 50 Raio-X da Questão, 50 A Ciência por Trás da Questão, 50 Desafios de Aplicação (autorais) e 50 Resoluções Inteligentes | Aprender a analisar uma questão real e aplicar o raciocínio em uma situação nova |
| **QUIMICAR COMPLETO** | CONECTA + APLICA integrais (360 materiais) | As duas coleções em uma única compra |

**Método (assinatura da marca):** VISUALIZE → ENTENDA → CONECTE → APLIQUE → ACERTE.

**Percurso do APLICA:** Raio-X (aprenda a interpretar) → Ciência (compreenda e justifique) → Desafio (aplique sozinho) → Resolução (compare, revise e evolua).

**Diferencial central.** O material não só resolve a questão. Faz o "raio-X": o comando, as pistas do enunciado, o erro mental mais comum, as conexões necessárias e o caminho decisivo até o acerto. Depois, o aluno tenta uma questão nova e compara o próprio raciocínio.

**Público**
- **Principal:** estudantes de 16 a 20 anos que vão fazer o ENEM, em todo o Brasil, com dificuldade em Química e sem saber como começar a resolver uma questão.
- **Secundário:** professores de Química (ver pendência P-14 sobre licença de uso).

**Tráfego:** anúncios pagos no Instagram e no TikTok. Quase todo o acesso será pelo celular, com atenção curta e muitas vezes visitante frio (nunca ouviu falar da marca).

**Conversões**
1. **Primária, compra:** botão que leva ao checkout da plataforma (Hotmart citada na reunião; o briefing da proprietária diz "Hotmart ou Kiwify, a definir". Ver P-01). Não há sistema de pagamento próprio.
2. **Secundária, lead:** formulário de e-mail para receber o material gratuito completo (amostra). É a principal porta de entrada para o tráfego frio.

**Métricas de sucesso:** taxa de clique no checkout, taxa de envio do formulário de amostra, custo por lead e vendas confirmadas pela plataforma.

---

## 2. Regras de conteúdo e conformidade (inegociáveis)

1. **Sem depoimentos fictícios.** A seção de prova social só existe quando houver depoimentos reais autorizados, cadastrados em `src/content/depoimentos/`. Sem registros, a seção não é renderizada. Prova no lançamento = páginas reais do material + demonstração interativa.
2. **Sem descontos artificiais, preço "de/por" inventado, cronômetros ou "últimas vagas".**
3. **Sem promessas de aprovação, nota ou acerto garantido.** "ACERTE" é etapa do método, não promessa. Evite "garanta sua aprovação" e expressões parecidas.
4. **Vocabulário proibido:** aula, curso, videoaula, ao vivo, plataforma de ensino, inteligência artificial, correção individual, 200 questões.
5. **Questões oficiais:** sempre com ano, aplicação, caderno e número (ex.: "Questão 100 · ENEM 2025 · Caderno Amarelo"). **Questões autorais:** selo "Questão autoral QUIMICAR".
6. **Quantidades:** mostrar a lista explícita dos materiais (nunca "unidades de aprendizagem" ou "componentes"). Totais de arquivos PDF e de páginas só depois de confirmados (P-05).
7. **Resolução Inteligente:** sempre descrita como "correção previamente elaborada"; nunca como avaliação individual.
8. **Nada pendente visível:** campo vazio no conteúdo = bloco não exibido.
9. **Aviso fixo** perto dos CTAs de compra: "Materiais digitais em PDF para leitura e impressão pessoal."

---

## 3. Escopo e fases

O briefing da proprietária descreve um **site completo com painel administrativo**. O pedido atual é a **landing page**. Por isso, o projeto é feito em fases, já com a arquitetura de conteúdo do site completo, para que a LP vire a página inicial do site depois, sem retrabalho.

### Fase 1: landing page (escopo deste ciclo)
- `/`: landing page longa (seção 7)
- `/amostras`: página enxuta de captura de lead, destino das campanhas de amostra grátis (seção 8.1)
- `/obrigada`: orientação após o checkout (seção 8.2)
- `/amostra-enviada`: confirmação após o formulário (seção 8.3)
- `/termos-de-uso`, `/politica-de-privacidade`, `/politica-de-reembolso`: páginas legais com conteúdo editável (textos fornecidos pela proprietária, P-11)
- `404`
- Formulário de amostra integrado ao Brevo, com envio automático
- Consentimento de cookies, GA4, Pixel da Meta e Pixel do TikTok
- SEO básico, sitemap e Open Graph

### Fase 2: site completo (fora deste ciclo, mas a arquitetura já deve prever)
- `/materiais`, `/materiais/quimicar-conecta`, `/materiais/quimicar-aplica`, `/materiais/quimicar-completo`
- `/como-funciona`, `/perguntas-frequentes`, `/contato`
- Painel administrativo sem código (seção 4.3), busca e filtros por coleção e tema
- Produtos temáticos e novos combos

Na Fase 1, os botões "Conhecer" dos cards levam a âncoras dentro da própria LP. Quando a Fase 2 existir, passam a apontar para as páginas de produto (controlado por um campo `pagina_publicada` no conteúdo).

---

## 4. Stack técnica

### 4.1 Base
- **Astro** (versão estável atual) + **TypeScript** + **Tailwind CSS**. Site estático, com um endpoint serverless para o formulário.
- **Hospedagem:** Netlify ou Cloudflare Pages (plano gratuito atende ao lançamento). Use o adapter oficial correspondente. A conta, o domínio e todas as ferramentas ficam **no nome da proprietária**; o desenvolvedor trabalha com acesso delegado.
- **Domínio:** a contratar (`.com.br` sugerido). HTTPS obrigatório.
- **E-mail:** Brevo (API de contatos + e-mail transacional). Confira os limites do plano gratuito na documentação atual antes de configurar.
- **Antispam:** Cloudflare Turnstile + campo honeypot + limite de envios por IP/e-mail.
- **Fontes:** Montserrat (700, 800) e Poppins (400, 500, 600), auto-hospedadas via `@fontsource`, com `font-display: swap` e subset latin.

### 4.2 Conteúdo como dados
Todo texto comercial, preço, link e configuração fica em `src/content/`, validado com Zod. Os componentes só leem desses arquivos. Estrutura mínima:

```
src/content/
  config.ts               # schemas Zod
  produtos/
    conecta.yaml
    aplica.yaml
    completo.yaml
  amostras/
    conecta-acidos-e-bases.yaml
    aplica-q100-enem2025.yaml
  faq/
    *.yaml                # pergunta, resposta, ordem, exibir_na_lp
  depoimentos/            # vazio no lançamento
  paginas-legais/
    termos-de-uso.md
    politica-de-privacidade.md
    politica-de-reembolso.md
  site.yaml               # dados globais (abaixo)
```

**Schema de produto (`produtos/*.yaml`)**

```yaml
id: conecta                       # conecta | aplica | completo
nome: QUIMICAR CONECTA
status: rascunho                  # rascunho | publicado | indisponivel
subtitulo: 80 mapas visuais de Química com 80 questões comentadas visualmente.
proposta: Entenda o conteúdo. Enxergue as conexões. Aprenda a aplicar.
descricao_curta: ...
descricao: ...                    # markdown
composicao:                       # lista explícita, nunca um total genérico
  - item: Mapas visuais
    quantidade: 80
  - item: Questões didáticas autorais comentadas visualmente
    quantidade: 80
indicacao: ...                    # para quem é
sequencia_de_uso: [...]
temas: []                         # lista de temas (P-04)
distribuicao_por_ano: null        # só APLICA: {2023: n, 2024: n, 2025: n} (P-06)
total_pdfs: null                  # P-05
total_paginas: null               # P-05
preco: null                       # número em reais (P-02)
parcelamento: null                # ex.: "em até 12x" — texto exato do checkout
checkout_url: null                # P-01
prazo_entrega: null               # ex.: "acesso liberado após a confirmação do pagamento"
duracao_acesso: null              # P-07
atualizacoes: null                # P-08
capa: null                        # caminho da imagem
galeria: []                       # {imagem, legenda, alt}
cta_label: Quero o QUIMICAR CONECTA
pagina_publicada: false           # Fase 2
```

**Validação obrigatória (build falha):** se `status: publicado`, os campos `preco`, `checkout_url`, `composicao`, `duracao_acesso` e `prazo_entrega` precisam estar preenchidos. Se `status: rascunho`, o produto aparece na LP só como apresentação: sem preço e com o CTA trocado por "Receber amostra grátis". Se `status: indisponivel`, mostra "Indisponível no momento" sem botão de compra.

**Economia do combo:** calcule em tempo de build. Só exiba se `conecta.preco`, `aplica.preco` e `completo.preco` existirem e `completo.preco < conecta.preco + aplica.preco`. Texto: "Separadas, as coleções somam R$ X. No COMPLETO, você paga R$ Y." Sem porcentagem de desconto chamativa e sem preço riscado inventado.

**`site.yaml`**

```yaml
nome: QUIMICAR ENEM
dominio: null
plataforma_checkout: hotmart       # hotmart | kiwify (P-01)
fornecedor:                        # P-10
  razao_social: null
  cnpj: null
  endereco: null
contato:
  email_suporte: null              # P-09
  whatsapp: null                   # só número; link wa.me gerado no código
  instagram: null
  tiktok: null
autoria:                           # P-03
  nome: null
  foto: null
  bio: null
rastreamento:
  ga4_id: null
  meta_pixel_id: null
  tiktok_pixel_id: null
brevo:
  lista_amostra_id: null
  lista_marketing_id: null
  template_amostra_id: null
versao_texto_consentimento: "2026-10-v1"
```

Segredos (chave da API do Brevo, chave secreta do Turnstile) ficam **somente** em variáveis de ambiente da hospedagem. Crie um `.env.example` sem valores.

### 4.3 Painel administrativo (preparar na Fase 1, implementar na Fase 2)
Requisito da proprietária: editar produtos, textos, preços, imagens, amostras e links sem tocar em código, com estados rascunho/publicado/indisponível.

Recomendação: CMS baseado em Git sobre as mesmas coleções (Decap CMS ou Sveltia CMS, que usa a mesma configuração), em `/admin`. Antes de implementar, verifique na documentação atual qual método de autenticação está disponível para a hospedagem escolhida e documente o custo recorrente (deve ser zero ou próximo disso). A Fase 1 já deve gerar os nomes de campo e os schemas compatíveis, para o CMS ser só uma camada por cima.

---

## 5. Ativos fornecidos e processamento

```
assets-originais/
  marca/logo-quimicar-original.png                      # 1701×925, fundo branco, PNG
  amostras/conecta-acidos-e-bases-mapa.pdf              # 1 pág. — mapa visual "Ácidos e Bases"
  amostras/conecta-acidos-e-bases-questao-comentada.pdf # 1 pág. — questão comentada (ver P-12)
  amostras/aplica-q100-enem2025-raio-x-e-ciencia.pdf    # 4 pág. — Raio-X (p.1–2) + Ciência por Trás (p.3–4)
  amostras/aplica-q100-enem2025-desafio-e-resolucao.pdf # 3 pág. — Desafio (p.1) + Resolução Inteligente (p.2–3)
docs/referencias/manual-identidade-visual.png            # referência de cores/tipografia (raster)
```

Essas amostras formam **um par completo do CONECTA** (Ácidos e Bases: mapa + questão) e **um conjunto completo do APLICA** (Questão 100, ENEM 2025, Caderno Amarelo: Raio-X + Ciência + Desafio + Resolução). Use-as na demonstração da LP e, até a confirmação da proprietária (P-13), como o material gratuito enviado por e-mail.

### 5.1 Script `npm run assets` (Node + `sharp`, ou `pdftoppm` se disponível)
1. Rasterize cada página dos PDFs em alta resolução (≈200 dpi).
2. Gere, para cada página:
   - **miniatura** com 480px de largura (cards e carrosséis)
   - **visualização** com 1200px de largura (lightbox, legível no celular com zoom)
   - formatos AVIF + WebP, com JPEG de fallback; qualidade em torno de 75
3. Salve em `src/assets/amostras/<amostra>/<pagina>-<tamanho>.<ext>` e use `<Image>`/`<Picture>` do Astro com `srcset`.
4. Gere uma **imagem de hero** compondo 2–3 páginas reais sobrepostas e levemente rotacionadas (mapa "Ácidos e Bases" em primeiro plano, página 1 do Raio-X atrás). Versões 4:5 para celular e 16:10 para computador. Não use mockups de celular ou tablet com conteúdo falso.
5. **Logo:** o arquivo é PNG com fundo branco. Gere uma versão com fundo transparente para uso no cabeçalho, uma versão reduzida (símbolo "Q" + nome), o favicon (símbolo "Q" isolado, 32/180/512px) e a imagem Open Graph 1200×630. Registre a pendência P-15 (pedir a logo em SVG/PNG transparente original). Nunca distorça, recolora ou aplique sombra na logo (regras do manual).
6. Os PDFs gratuitos que serão enviados por e-mail vão para `public/amostras/` (comprimidos com Ghostscript, `/ebook`, sem perda de legibilidade). O PDF da questão comentada tem 10,5 MB; reduza para menos de 3 MB se a legibilidade se mantiver.
7. Nunca coloque PDFs pagos no repositório.

### 5.2 Textos alternativos (alt) e legendas
Cada página de amostra precisa de `alt` descritivo e legenda visível. Exemplos:
- "Mapa visual Ácidos e Bases: conceitos, escala de pH, ácidos e bases no cotidiano, neutralização e indicadores." Legenda: "CONECTA · Mapa visual"
- "Página 1 do Raio-X da Questão 100 do ENEM 2025: enunciado original, alternativas e a pista do enunciado." Legenda: "APLICA · 1. Raio-X da Questão"

---

## 6. Identidade visual

Fonte: manual de identidade visual v1.0. O manual é uma imagem raster com pequenas imperfeições de texto; use-o como referência de cores, tipografia e tom, não como pixel-perfect.

### 6.1 Cores (tokens no `tailwind.config` e em CSS custom properties)

| Token | Hex | Uso no manual | Uso no site |
|---|---|---|---|
| `petroleo` | `#0B2342` | Institucional | Títulos, texto forte, fundos escuros, rodapé |
| `turquesa` | `#00B8D9` | Destaques | Ícones, detalhes, palavras-chave **sobre fundo escuro** |
| `verde-agua` | `#18C7B5` | Apoio visual | Detalhes, etapas do método |
| `laranja` | `#FF9000` | Ação/resultado | **Fundo** dos botões de compra |
| `dourado` | `#FFB800` | Detalhes premium | Selo do COMPLETO, destaques pontuais |
| `branco` | `#FFFFFF` | Fundo | Fundo principal |
| `cinza-claro` | `#E8EDF2` | Quadros/tabelas | Fundos alternados de seção, cards |
| `cinza-escuro` | `#333333` | Texto | Texto corrido |
| `cinza-medio` | `#687280` | Observações | Legendas, textos secundários |
| `roxo` | `#7E57C2` | Apoio (Orgânica) | Detalhes pontuais (pedido da proprietária) |
| `vermelho` | `#E53935` | Atenção/erro | Mensagens de erro, "Não confunda" |
| `verde` | `#43A047` | Acerto/dicas | Feedback correto no quiz |

**Tokens derivados para texto acessível sobre branco** (crie-os, porque laranja e turquesa puros não passam):
- `turquesa-texto` `#00788F` (contraste 5,1:1 sobre branco)
- `laranja-texto` `#B85C00` (contraste 4,6:1 sobre branco)

**Contraste verificado (WCAG AA):**
- Botão primário: fundo `laranja` + texto `petroleo` = **6,9:1** ✅ (não use texto branco sobre laranja: 2,3:1 ❌)
- Texto `turquesa`, `verde-agua`, `laranja` ou `dourado` sobre `petroleo` ≥ 6,6:1 ✅
- `turquesa`/`laranja` como texto sobre branco ≈ 2,3:1 ❌. Use os tokens derivados.
- `cinza-medio` sobre branco 4,9:1 ✅; sobre `petroleo` 3,2:1 ❌

### 6.2 Tipografia

| Papel | Fonte | Celular | Computador |
|---|---|---|---|
| Título de seção (H2) | Montserrat ExtraBold, caixa alta opcional | 28/34 | 40/48 |
| Título do hero (H1) | Montserrat ExtraBold | 32/38 | 52/60 |
| Subtítulo | Montserrat Bold | 18/26 | 22/30 |
| Rótulo/tópico | Poppins SemiBold, caixa alta, espaçamento 0,06em | 13/18 | 14/20 |
| Texto | Poppins Regular | 16/26 | 18/28 |
| Palavra-chave | Montserrat SemiBold | — | — |
| Observação | Poppins Italic | 14/22 | 15/24 |

Texto corrido nunca abaixo de 16px no celular.

### 6.3 Linguagem visual
- **Tom:** educacional, moderno, leve, organizado e confiante; próximo do estudante de 16–20 anos sem infantilizar. Frases curtas. Fale com "você".
- **Elementos recorrentes:** a trilha de 5 etapas como fio condutor (ícones: olho/cérebro → livro → conexão → alvo → troféu), numeração circular (01, 02…) como nos materiais, selos de identificação ("ENEM 2025 · Questão 100", "Questão autoral QUIMICAR"), caixas "Pista do enunciado" e "Não confunda" no estilo dos PDFs.
- **Cores por etapa do método:** VISUALIZE `petroleo`, ENTENDA `turquesa`, CONECTE `laranja`, APLIQUE `turquesa`, ACERTE `laranja` (igual à faixa da logo).
- **Cantos:** 12–16px em cards; botões em formato pílula.
- **Movimento:** discreto (fade/slide de 150–250ms ao entrar na tela). Respeite `prefers-reduced-motion`.
- **Evitar:** visual de "curso milagroso", vermelho agressivo, fundos sem contraste sob a logo, excesso de gradientes, banco de imagens genérico de estudantes sorrindo.

---

## 7. A landing page (`/`) — seção por seção

Ordem baseada no briefing da proprietária, ajustada para tráfego frio de redes sociais. Cada seção tem um `id` para âncoras. Textos entre aspas são a copy aprovada, retirada dos documentos da proprietária; ajustes de tamanho só para caber no celular, sem mudar o sentido.

### 7.0 Cabeçalho (fixo)
- Logo reduzida à esquerda (link para o topo).
- Computador: Coleções · Como funciona · Amostras · Dúvidas + botão "Ver coleções" (`laranja`).
- Celular: logo + botão de menu (painel acessível, fecha com Esc e ao clicar em link).
- Fica compacto ao rolar a página.
- **Barra de CTA fixa no rodapé da tela, só no celular**, que aparece depois do hero: "Receber amostra grátis" (secundário) + "Ver coleções" (primário). Esconde quando o formulário ou o rodapé estiverem visíveis.

### 7.1 Hero — `#inicio`
- Selo acima do título: "QUÍMICA PARA O ENEM · MATERIAIS EM PDF"
- **H1:** "Química para o ENEM que você consegue visualizar, entender e aplicar."
- **Subtítulo:** "Estude com mapas e questões comentadas visualmente. Explore questões reais do ENEM e pratique em desafios autorais com correção explicada."
- **Botões:** "Conhecer as coleções" (primário, âncora `#colecoes`) · "Ver amostras gratuitas" (secundário, âncora `#amostra`)
- **Aviso:** "Materiais digitais em PDF para leitura e impressão pessoal."
- **Imagem:** composição de páginas reais (seção 5.1, item 4). É o elemento LCP: `fetchpriority="high"`, sem lazy-load, com dimensões explícitas.
- Faixa logo abaixo: VISUALIZE • ENTENDA • CONECTE • APLIQUE • ACERTE, nas cores da seção 6.3.
- No celular, título + subtítulo + 2 botões precisam caber na primeira tela (390×844) com a imagem logo abaixo.

### 7.2 Identificação — `#por-que`
- **H2:** "Você não precisa só de mais conteúdo. Precisa saber o que fazer com ele na hora da prova."
- Três cartões curtos com as dores do aluno (copy nova, no tom da marca):
  1. "Você estuda, mas trava quando a questão aparece."
  2. "Lê o enunciado e não sabe por onde começar."
  3. "Erra e não sabe o que revisar."
- Ponte: "O QUIMICAR transforma o estudo de Química para o ENEM em uma experiência visual, organizada, conectada e prática."
- Três capacidades (da apresentação institucional), com ícone de check:
  - **Entendi a questão:** consigo identificar o que o problema exige.
  - **Sei justificar minha resposta:** compreendo os conceitos e as evidências que sustentam minha escolha.
  - **Sei o que estudar para melhorar:** reconheço minhas dificuldades e tenho um caminho para avançar.

### 7.3 As coleções — `#colecoes`
- **H2:** "Conheça as coleções QUIMICAR"
- **Intro:** "Duas coleções complementares, para diferentes momentos da sua preparação: da construção dos conhecimentos à aplicação do raciocínio em questões do ENEM."
- Três cards (carrossel com scroll-snap no celular, três colunas no computador), gerados de `produtos/*.yaml`:
  - **CONECTA:** capa/página real; "80 mapas visuais + 80 questões comentadas para compreender e revisar."
  - **APLICA:** "Método visual com análise de 50 questões de Química do ENEM de 2023, 2024 e 2025 e 50 desafios autorais com resolução."
  - **COMPLETO** (destacado, selo `dourado` "As duas coleções"): "CONECTA + APLICA em uma única compra."
- Cada card mostra: composição em lista, preço e parcelamento (se cadastrados), botão de compra (se `publicado`) e o link "Ver o que vem" (âncora para a demonstração da coleção).

### 7.4 O método — `#metodo`
- **H2:** "Um método visual em cinco etapas"
- **Texto:** "O Método Visual QUIMICAR orienta você a observar as informações relevantes, compreender o problema, conectar conhecimentos, aplicar os conceitos e chegar a uma resposta fundamentada."
- **Componente interativo "Método na prática"**, usando a Questão 100 do ENEM 2025 (conteúdo da página 2 do Raio-X):
  - Mostra o enunciado resumido e a pergunta: "Qual ação mitigadora auxilia na remoção desse gás presente na atmosfera, reduzindo seus níveis?"
  - Cinco etapas clicáveis (abas no computador, acordeão ou stepper no celular):
    1. **VISUALIZE:** Encontre "remoção desse gás".
    2. **ENTENDA:** O alvo é o CO₂ que já está no ar.
    3. **CONECTE:** A fotossíntese fixa carbono na biomassa.
    4. **APLIQUE:** Separe remoção de emissões evitadas.
    5. **ACERTE:** Plantar árvores: alternativa A.
  - Caixa "Não confunda": "Eólica, solar e redução do uso de fósseis ajudam principalmente a evitar emissões; isso não é a mesma função solicitada."
  - Selo: "Questão 100 · ENEM 2025 · Caderno Amarelo"
  - Funciona sem JavaScript (todas as etapas visíveis em lista); o JS só melhora a navegação.

### 7.5 Demonstração com páginas reais — `#por-dentro`
- **H2:** "Veja por dentro"
- Abas: **CONECTA** | **APLICA**
- **Aba CONECTA:** as duas páginas lado a lado (empilhadas no celular), com uma seta ou conexão entre elas.
  - "O mapa ajuda você a compreender o conceito. A questão comentada mostra como utilizá-lo. Você aprende a Química e descobre como ela pode ser cobrada."
  - Legendas: "Mapa visual · Ácidos e Bases" / "Questão comentada visualmente" (ver P-12 antes de rotular a questão).
- **Aba APLICA:** percurso horizontal de 4 etapas (scroll-snap no celular), cada uma com a página real correspondente:
  1. **Raio-X da Questão:** "Aprenda a interpretar." Analisa o comando, as pistas do enunciado e as conexões necessárias.
  2. **A Ciência por Trás da Questão:** "Compreenda e justifique." Aprofunda os conceitos e explica por que cada alternativa está certa ou errada.
  3. **Desafio de Aplicação:** "Aplique sozinho." Questão autoral QUIMICAR em uma situação nova.
  4. **Resolução Inteligente:** "Compare, revise e evolua." Gabarito e caminho completo; correção previamente elaborada.
  - Frase de fechamento: "O aprendizado não termina quando você descobre a alternativa correta. Ele continua quando você consegue explicar sua escolha e aplicar o mesmo raciocínio em uma nova questão."
- **Lightbox acessível** para todas as páginas: abre em tela cheia, permite zoom por pinça e por botão, navega com setas/teclado/swipe, fecha com Esc, devolve o foco ao elemento que abriu, `role="dialog"` + `aria-modal`. Pode ser implementação própria leve ou uma biblioteca pequena (PhotoSwipe v5, por exemplo).

### 7.6 Desafio interativo — `#desafio`
Elemento de engajamento para tráfego frio: o visitante experimenta o método antes de comprar.
- **H2:** "Agora é com você"
- Selo: "Questão autoral QUIMICAR · inspirada na Questão 100 do ENEM 2025"
- Enunciado completo do Desafio de Aplicação (PDF do desafio, p.1), com a equação `Ca(OH)₂(s) + CO₂(g) → CaCO₃(s) + H₂O(l)` em texto (não imagem), usando subscritos Unicode ou `<sub>`.
- Cinco alternativas como botões de opção acessíveis (fieldset + legend).
- Ao responder:
  - **Correta (B):** feedback `verde`, "Isso! O carbono do CO₂ passa a integrar o CaCO₃ sólido.", e as 5 etapas da Resolução Inteligente (PDF p.2).
  - **Incorreta:** feedback neutro (não vermelho agressivo), com a explicação específica daquela alternativa, retirada de "Marcou uma dessas alternativas?" (PDF p.3), e o botão "Ver a resolução completa".
- CTA após o feedback: "Quer 50 desafios como este, com Resolução Inteligente?" → "Conhecer o APLICA" + "Receber o conjunto completo grátis".
- Dispara o evento `desafio_respondido` (com `correta: true/false`).
- Conteúdo em `src/content/amostras/aplica-q100-enem2025.yaml` (enunciado, alternativas, gabarito, feedbacks), não fixo no componente.

### 7.7 Para quem é — `#para-quem`
- **Para estudantes** (bloco principal): quem vai fazer o ENEM e tem dificuldade em Química; quem estuda, mas não consegue transformar teoria em resposta; quem quer revisar com material visual e organizado.
- **Para professores** (bloco menor): depende da resposta da P-14. Se a licença for só pessoal, escrever "Para professores que querem estudar a abordagem e se inspirar", sem sugerir uso em sala ou reprodução. Se a proprietária liberar uma licença para professores, criar o texto a partir dessa definição.
- **Não é para** (curto, gera confiança): quem procura videoaulas ou aulas ao vivo; quem procura correção individual.

### 7.8 Combo em destaque — `#completo`
- **H2:** "QUIMICAR COMPLETO: duas coleções, uma jornada"
- **Texto:** "Da compreensão dos conteúdos à autonomia para resolver questões. No CONECTA, você constrói sua base, visualiza os conceitos e compreende suas aplicações. No APLICA, aprende a investigar questões oficiais do ENEM, aprofundar a ciência envolvida, enfrentar desafios inéditos e avaliar seu próprio raciocínio."
- Composição completa em lista: 80 mapas visuais · 80 questões didáticas comentadas · 50 Raio-X da Questão · 50 A Ciência por Trás da Questão · 50 Desafios de Aplicação · 50 Resoluções Inteligentes.
- Preço, parcelamento e economia conforme a seção 4.2. Sem preço cadastrado = sem bloco de preço, e o CTA vira "Receber amostra grátis".
- **Botão:** "Quero o QUIMICAR COMPLETO"
- Linha de confiança sob o botão: pagamento processado pela plataforma de checkout · acesso após a confirmação do pagamento · link para a política de reembolso.

### 7.9 Amostra grátis (formulário) — `#amostra`
- **H2:** "Experimente a Química visual da QUIMICAR"
- **Texto:** "Veja uma prévia ou receba gratuitamente um conjunto completo para estudar e conhecer a proposta."
- Escolha do material (cards selecionáveis, `radio`), dizendo exatamente o que cada opção entrega:
  - **CONECTA:** "1 mapa visual + 1 questão comentada (Ácidos e Bases)"
  - **APLICA:** "1 conjunto completo: Raio-X + Ciência por Trás + Desafio + Resolução (Questão 100 · ENEM 2025)"
  - **As duas** (opção padrão)
- Formulário e regras na seção 9.2. **Botão:** "Receber meu material gratuito".

### 7.10 Quem está por trás — `#autoria`
Foto e biografia aprovadas pela proprietária (P-03). Sem dados = seção oculta. Layout: foto circular com aro em gradiente turquesa→laranja, nome, 3–4 linhas de biografia e o propósito da marca: "Transformar a forma de aprender Química."

### 7.11 Condições — `#condicoes`
Grade de 4–6 itens com ícone, usando os campos do conteúdo (itens sem dado ficam ocultos): formato (PDF) · como recebe (após a aprovação do pagamento, pela plataforma) · por quanto tempo acessa · impressão pessoal permitida · atualizações · suporte e reembolso (link).

### 7.12 Perguntas frequentes — `#duvidas`
Acordeão com `<details>/<summary>` (acessível sem JS). Perguntas do briefing (texto da proprietária):
1. **O material é digital?** Sim. Os materiais são PDFs; não há envio de produto impresso.
2. **Posso imprimir?** Sim, para uso pessoal. A impressão é por conta do comprador. Não é permitida a redistribuição ou revenda dos arquivos.
3. **Qual coleção escolher?** O CONECTA organiza conceitos com mapas e demonstra sua aplicação em questões comentadas. O APLICA é um método de estudo que analisa questões reais do ENEM, aprofunda os conceitos e orienta a prática em desafios autorais com resolução explicada. O COMPLETO reúne as duas coleções.
4. **Todas as questões são oficiais?** Não. O CONECTA contém questões didáticas. O APLICA reúne análises de questões oficiais e desafios autorais, identificados separadamente.
5. **Minha resposta será corrigida individualmente?** A Resolução Inteligente é uma correção previamente elaborada para comparar seu raciocínio. Não inclui atendimento individual.
6. **Como recebo e por quanto tempo acesso?** Após a aprovação do pagamento, você recebe instruções de acesso à coleção comprada. *(Inserir aqui a frase gerada de `duracao_acesso`; sem esse dado, omitir a frase.)* O material gratuito solicitado é enviado por e-mail, independentemente de compra.
7. **Como peço suporte ou reembolso?** Para solicitar suporte ou reembolso, utilize o canal indicado na página de contato e consulte a política de reembolso.

Perguntas sugeridas para o público de anúncios (exibir quando a proprietária aprovar a resposta; cadastrar com `exibir_na_lp: false` até lá):
8. **São aulas ou videoaulas?** Não. São materiais em PDF para estudar no seu ritmo.
9. **Serve para quem tem base fraca em Química?** (resposta da proprietária)
10. **Consigo estudar pelo celular?** (resposta da proprietária, considerando a legibilidade dos PDFs no celular)

Gere o JSON-LD `FAQPage` só com as perguntas exibidas.

### 7.13 CTA final — `#comecar`
- Fundo `petroleo`, logo em versão para fundo escuro (ver regras do manual).
- **Frase:** "Não estude apenas para encontrar respostas. Aprenda a construir o raciocínio que leva até elas."
- Botões: "Ver coleções" (primário) + "Receber amostra grátis" (secundário, contorno).

### 7.14 Rodapé
Logo, links das seções, páginas legais, "Gerenciar cookies", e-mail/WhatsApp de suporte, redes sociais, razão social e CNPJ (P-10) e a linha "Materiais digitais em PDF para estudo, revisão e impressão pessoal." Tudo condicionado aos dados existentes.

---

## 8. Páginas auxiliares

### 8.1 `/amostras` (destino das campanhas de lead)
Versão curta da LP para tráfego frio vindo de anúncios de "material grátis":
hero com o formulário acima da dobra no celular → miniaturas das páginas que a pessoa vai receber → bloco curto do método → desafio interativo (7.6) → link discreto para as coleções. Sem menu completo (só logo + "Ver coleções"), para reduzir distrações. `noindex` opcional (decidir com P-16).

### 8.2 `/obrigada` (retorno do checkout)
Texto da proprietária: "Confira seu e-mail para acompanhar o pagamento e as instruções de acesso. A liberação dos materiais depende da confirmação do pagamento."
- Não confirma a compra, não dispara o evento `Purchase` e não contém links de PDF.
- Mostra o canal de suporte e um link de volta. `noindex`.
- Configure essa URL como página de obrigado ou retorno na plataforma de checkout, se ela permitir.

### 8.3 `/amostra-enviada`
"Pronto! Enviamos o material para [e-mail mascarado, ex.: jo***@gmail.com]. Confira também as pastas Spam e Promoções." + o que vem a seguir + CTA "Conhecer as coleções" + suporte. `noindex`. Pode ser renderizada como estado do próprio formulário (sem recarregar a página); nesse caso, mantenha a rota como fallback para envios sem JS.

### 8.4 Páginas legais
Renderizadas a partir de `src/content/paginas-legais/*.md`, com data de atualização. Use os textos fornecidos pela proprietária (P-11). Se ainda não chegaram, crie arquivos com `rascunho: true`; enquanto estiverem assim, a página não é publicada e o link não aparece no rodapé. A política de privacidade é obrigatória antes de ativar o formulário em produção.

---

## 9. Conversão

### 9.1 Botões de compra
- `href` = `checkout_url` do produto, com os parâmetros UTM da sessão repassados (salve os `utm_*` da URL de entrada em `sessionStorage` e acrescente-os ao link). Confirme na documentação da plataforma quais parâmetros de rastreamento ela aceita (na Hotmart, por exemplo, `src` e `sck`) e mapeie `utm_source`/`utm_campaign` para eles.
- Abrir na mesma aba (melhor no navegador interno do Instagram e do TikTok).
- Ao clicar: evento `InitiateCheckout` (seção 10) com `content_name` e `value`.
- Rótulos fixos: "Quero o QUIMICAR CONECTA" · "Quero o QUIMICAR APLICA" · "Quero o QUIMICAR COMPLETO".
- Preço exibido = preço do checkout. Divergência é bug crítico.
- Cupons ficam a cargo da plataforma de checkout. O site não implementa cupom.

### 9.2 Formulário de amostra
**Campos**
- `email`: obrigatório, `type="email"`, `autocomplete="email"`, validação no cliente e no servidor
- `nome`: primeiro nome, opcional, `autocomplete="given-name"`
- `amostra`: `conecta` | `aplica` | `ambas` (obrigatório quando houver mais de uma opção)
- `marketing_optin`: checkbox **desmarcado por padrão** e opcional: "Quero receber novidades e ofertas da QUIMICAR por e-mail."
- Texto abaixo do botão: "Ao enviar, você recebe o material solicitado por e-mail. Veja a [Política de Privacidade]."
- Turnstile (modo não intrusivo) + honeypot oculto

**A entrega da amostra nunca depende do opt-in de marketing.**

**Endpoint `POST /api/amostra` (serverless)**
1. Valida o payload (Zod), o honeypot e o token do Turnstile.
2. Limita a taxa: no máximo 3 envios por e-mail a cada 24h e 10 por IP por hora. Use o KV/Blobs da hospedagem, ou deduplique via atributo do contato no Brevo.
3. Brevo, criar ou atualizar o contato:
   - Atributos: `FIRSTNAME`, `AMOSTRA_SOLICITADA`, `DATA_SOLICITACAO`, `ORIGEM` (utm_source/utm_campaign), `MARKETING_OPTIN` (bool), `MARKETING_OPTIN_DATA`, `MARKETING_OPTIN_TEXTO_VERSAO`
   - Lista "Amostra solicitada": sempre
   - Lista "Marketing": **só** se `marketing_optin = true`
4. Brevo, enviar o e-mail transacional (template) com: saudação, identificação da amostra, link para o PDF gratuito (`/amostras/*.pdf` no próprio domínio), orientação de uso ("Comece pelo Raio-X, tente o Desafio antes de olhar a Resolução…"), link para as coleções e o canal de suporte. O e-mail transacional não leva conteúdo promocional para quem não deu opt-in, além de um único link para as coleções.
5. Responde `200` com a confirmação; em falha, `4xx/5xx` com mensagem amigável: "Não conseguimos enviar agora. Tente de novo em alguns minutos ou fale com a gente em [suporte]."
6. Nunca registra o e-mail completo em logs.

**Estados da interface:** padrão → enviando (botão desabilitado, spinner, `aria-busy`) → sucesso (mensagem com foco e `aria-live`) → erro (mensagem no campo, `aria-invalid`, `aria-describedby`).

**E-mail remetente:** domínio próprio, com SPF, DKIM e DMARC configurados conforme o Brevo. Documente o passo a passo em `docs/OPERACAO.md`. Teste o recebimento no Gmail e no Outlook (caixa de entrada vs. spam).

**Público adolescente (16–17 anos):** coleta mínima (e-mail e primeiro nome), linguagem clara, nenhum dado sensível e opt-in de marketing separado e desmarcado. Mencionar na política de privacidade (P-11).

---

## 10. Rastreamento, cookies e LGPD

### 10.1 Consentimento
- Banner próprio e leve (sem biblioteca pesada), com "Aceitar", "Recusar" e "Preferências" (categorias: necessários [sempre ativos], análise, marketing). Botão "Recusar" com o mesmo destaque de "Aceitar".
- Antes do consentimento: **nenhum** script de GA4, Meta ou TikTok é carregado. Use o Google Consent Mode v2 com padrão `denied`.
- Escolha salva em `localStorage` (com try/catch) + versão da política; link "Gerenciar cookies" no rodapé reabre as preferências.

### 10.2 Camada de eventos
Crie `src/lib/track.ts` com `track(evento, params)`, que despacha para cada ferramenta consentida:

| Evento interno | Quando | GA4 | Meta | TikTok |
|---|---|---|---|---|
| `page_view` | carga | `page_view` | `PageView` | `page` |
| `ver_colecao` | card/aba de coleção entra na tela (1x) | `view_item` | `ViewContent` | `ViewContent` |
| `abrir_amostra` | abre o lightbox | `select_content` | — | `ClickButton` |
| `desafio_respondido` | responde o quiz | `desafio_respondido` | — | — |
| `clique_checkout` | clique no botão de compra | `begin_checkout` | `InitiateCheckout` | `InitiateCheckout` |
| `lead_amostra` | sucesso do formulário | `generate_lead` | `Lead` | `SubmitForm` |

- **`Purchase` nunca é disparado pelo site.** Venda só é contada pela integração nativa de pixel da plataforma de checkout ou por webhook confirmado (documentar em `docs/OPERACAO.md`). Isso evita contagem duplicada ou falsa.
- Em desenvolvimento, `track` só faz `console.debug`.
- IDs vêm de `site.yaml`; sem ID = ferramenta desativada.

---

## 11. SEO e compartilhamento
- `<title>`: "QUIMICAR ENEM | Química visual para o ENEM em PDF" (≤ 60 caracteres)
- Meta description: "Mapas visuais, questões comentadas e Raio-X de questões reais do ENEM 2023–2025. Materiais em PDF para entender e aplicar Química. Baixe uma amostra grátis." (≤ 160 caracteres)
- Open Graph e Twitter Card com a imagem 1200×630 (logo + páginas reais)
- `lang="pt-BR"`, URL canônica, `sitemap.xml` (@astrojs/sitemap), `robots.txt`
- JSON-LD: `Organization` (com logo), `Product` por coleção **só** quando houver preço publicado, e `FAQPage`
- Um único H1 por página; hierarquia de títulos correta
- Páginas `noindex`: `/obrigada`, `/amostra-enviada`

---

## 12. Performance e acessibilidade

### 12.1 Metas (Lighthouse mobile, 4G simulado)
- Performance ≥ 90 · Acessibilidade ≥ 95 · Boas práticas ≥ 95 · SEO ≥ 95
- LCP < 2,5s · CLS < 0,05 · INP < 200ms
- Primeira carga (sem consentimento) < 600 KB transferidos
- Nenhum PDF embutido na página (`<iframe>`/`<embed>`); prévias só como imagem
- Imagens abaixo da dobra com `loading="lazy"` e `decoding="async"`; dimensões sempre declaradas
- JavaScript por ilha/componente, carregado só onde há interação

### 12.2 Acessibilidade (WCAG 2.1 AA)
- Navegação completa por teclado; foco visível (anel `turquesa` de 3px com offset sobre fundo claro e `dourado` sobre fundo escuro)
- Link "Pular para o conteúdo"
- Rótulos visíveis em todos os campos; erros anunciados
- Contraste conforme a seção 6.1
- Alvos de toque ≥ 44×44px
- Lightbox, abas, acordeões e quiz com ARIA correto e testados com leitor de tela (VoiceOver no iOS, TalkBack no Android)
- Equações químicas em texto real, com subscritos

### 12.3 Navegadores e dispositivos de teste
Navegador interno do Instagram e do TikTok (iOS e Android), Safari iOS, Chrome Android, Chrome/Edge/Firefox no computador. Larguras: 360, 390, 430, 768, 1024, 1280 e 1440px.

---

## 13. Segurança
- HTTPS forçado e cabeçalhos de segurança (CSP compatível com os pixels e o Turnstile, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`)
- Segredos só em variáveis de ambiente; `.env` no `.gitignore`
- Repositório privado na conta da proprietária (ou transferido a ela na entrega)
- Nenhum PDF pago no site ou no repositório
- Dependências mínimas; rodar `npm audit` antes da entrega

---

## 14. Pendências (manter em `docs/PENDENCIAS.md`, atualizado a cada etapa)

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

## 15. Critérios de aceite

- [ ] LP publicada no domínio definido, com HTTPS
- [ ] Layout de celular e de computador **aprovado pela proprietária antes** da implementação final (entregar primeiro um protótipo navegável das seções 7.0–7.5 com conteúdo real)
- [ ] Nenhum dado pendente visível; produtos sem dados completos permanecem `rascunho`
- [ ] Build falha se um produto `publicado` estiver incompleto (teste automatizado)
- [ ] Economia do combo só aparece com os 3 preços válidos (teste unitário dos casos: sem preço, combo maior, combo menor)
- [ ] Botões de compra levam ao checkout correto das 3 ofertas, com UTMs repassadas; preços iguais aos do checkout
- [ ] Teste de pagamento aprovado, pendente e recusado na plataforma; `/obrigada` não libera nada
- [ ] Formulário testado: dados válidos; e-mail inválido; envio repetido (limite); falha do Brevo (mensagem de erro); recebimento do link correto para cada opção de amostra; opt-in de marketing registrado separadamente e ausente quando desmarcado
- [ ] E-mail chega à caixa de entrada (Gmail e Outlook) com SPF, DKIM e DMARC válidos
- [ ] Prévias acessíveis sem cadastro; nenhum PDF pago exposto
- [ ] Nenhum script de rastreamento carregado antes do consentimento (verificado na aba Network)
- [ ] Eventos da tabela 10.2 verificados no GA4 DebugView, no Meta Events Manager (Test Events) e no TikTok Events Manager
- [ ] Lighthouse mobile dentro das metas da seção 12.1 (anexar relatório)
- [ ] Teclado, leitor de tela e contraste verificados; zero erros no axe DevTools
- [ ] Testado nos navegadores e larguras da seção 12.3, inclusive nos navegadores internos do Instagram e do TikTok
- [ ] Busca no código por palavras proibidas (seção 2.4) sem ocorrências em texto visível
- [ ] `docs/OPERACAO.md` com: como editar conteúdo, trocar preço/link, adicionar FAQ, publicar, configurar pixels, DNS do e-mail, backup/restauração e custos recorrentes
- [ ] Acessos e repositório sob titularidade da proprietária

---

## 16. Ordem de execução

Trabalhe uma etapa por vez. Ao fim de cada etapa: rode `npm run build` e `npm run check`, atualize `docs/PENDENCIAS.md`, faça um commit e resuma o que foi feito em até 5 linhas.

1. **Setup:** projeto Astro + TS + Tailwind, fontes, tokens de cor e tipografia (seção 6), estrutura de pastas, `.env.example`, `docs/PENDENCIAS.md` (copiar a seção 14).
2. **Conteúdo:** schemas Zod e arquivos YAML com toda a copy deste documento; produtos em `rascunho`; validação do build e testes da regra de economia.
3. **Ativos:** script `npm run assets` (seção 5.1); conferir a legibilidade das prévias em 390px.
4. **Componentes base:** botões, selo, card, título de seção, faixa do método, cabeçalho, menu mobile, barra fixa de CTA, rodapé.
5. **Protótipo para aprovação:** seções 7.1–7.5 com conteúdo e imagens reais, no celular e no computador. **Pare e peça aprovação da proprietária antes de seguir.**
6. **Seções restantes:** 7.6–7.14.
7. **Lightbox e interações:** abas, acordeão, quiz, percurso APLICA; acessibilidade completa.
8. **Formulário + Brevo + Turnstile + `/amostra-enviada`,** com todos os testes da seção 15.
9. **Páginas auxiliares:** `/amostras`, `/obrigada`, páginas legais, 404.
10. **Consentimento + `track.ts` + pixels;** verificar que nada carrega antes do aceite.
11. **SEO:** metatags, OG, JSON-LD, sitemap, robots.
12. **Performance e auditoria:** Lighthouse, axe, testes em dispositivos e navegadores internos.
13. **Deploy:** hospedagem, domínio, variáveis de ambiente, DNS do e-mail, cabeçalhos de segurança.
14. **Documentação de entrega:** `docs/OPERACAO.md` e checklist da seção 15 preenchido.

Quando uma etapa depender de uma pendência, implemente com o campo vazio (bloco oculto), registre a pendência e siga em frente.
