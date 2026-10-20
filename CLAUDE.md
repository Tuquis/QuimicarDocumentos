# QUIMICAR ENEM — Landing page

Landing page (e, em fase posterior, site de catálogo) para vender materiais digitais em PDF de Química para o ENEM: **QUIMICAR CONECTA**, **QUIMICAR APLICA** e o combo **QUIMICAR COMPLETO**. Proprietária: Shirlei Marques.

**Especificação completa:** `docs/BRIEFING-LP.md`. Leia o arquivo inteiro antes de qualquer tarefa e siga a ordem de execução da seção 16.

## Regras que nunca podem ser quebradas

1. **Nada de dados inventados.** Preços, links de checkout, prazos, totais de PDFs/páginas, biografia, CNPJ, contatos e IDs de pixel vêm só de `src/content/`. Campo vazio = bloco oculto no site + item em `docs/PENDENCIAS.md`. Nunca exiba "R$ XX", "Lorem ipsum" ou números provisórios ao visitante.
2. **Sem depoimentos fictícios, descontos artificiais, contadores de urgência falsos ou promessa de aprovação.**
3. **O produto é PDF.** Nunca escreva "aulas", "curso", "videoaula", "ao vivo", "IA", "correção individual" ou "garantia de acerto".
4. **APLICA = 50 questões oficiais analisadas + 50 desafios autorais.** Nunca "200 questões".
5. Questões oficiais sempre identificadas (ano, aplicação, caderno, número). Questões didáticas e desafios sempre identificados como **autorais QUIMICAR**.
6. "Economia" do combo só aparece se os três preços estiverem cadastrados e o combo for menor que a soma.
7. PDFs pagos nunca entram no repositório nem no site. Só imagens de prévia e o PDF gratuito da amostra.
8. Pixels e analytics só carregam depois do consentimento de cookies (LGPD).
9. Mobile first: o tráfego vem de anúncios no Instagram e no TikTok.
10. Texto em laranja `#FF9000` ou turquesa `#00B8D9` sobre fundo branco é proibido (contraste insuficiente). Veja os tokens na seção 6 do briefing.

## Stack

Astro + TypeScript + Tailwind CSS. Conteúdo em Astro Content Collections (YAML/Markdown) validado com Zod. Formulário via endpoint serverless + Brevo. Deploy em Netlify ou Cloudflare Pages, na conta da proprietária.

## Comandos

- `npm run dev`: servidor local
- `npm run build`: build de produção (deve falhar se um produto `publicado` estiver incompleto)
- `npm run assets`: gera as imagens de prévia a partir de `assets-originais/` (script em `scripts/`)
- `npm run check`: `astro check` + lint

## Estilo de código

- Componentes `.astro` sem framework de UI; JavaScript mínimo, só onde houver interação (menu, lightbox, abas, quiz, formulário, consentimento).
- Todo texto visível ao usuário em português do Brasil, com acentuação correta.
- Commits pequenos, um por etapa da seção 16.
