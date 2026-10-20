// Gera as imagens de prévia, hero, logos, favicons, OG e PDFs gratuitos
// a partir de assets-originais/. Requer pdftoppm (poppler) e gs (Ghostscript).
// Uso: npm run assets
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';

const ORIG = 'assets-originais';
const OUT_AMOSTRAS = 'src/assets/amostras';
const OUT_MARCA = 'src/assets/marca';
const OUT_PUBLIC = 'public';
const TMP = join(tmpdir(), `quimicar-assets-${process.pid}`);

// Cada PDF de amostra vira um conjunto de páginas. Os nomes das saídas
// são usados por src/content/amostras/*.yaml.
const PDFS = [
  { pdf: 'conecta-acidos-e-bases-mapa.pdf', out: 'conecta-acidos-e-bases', nomes: ['mapa'] },
  { pdf: 'conecta-acidos-e-bases-questao-comentada.pdf', out: 'conecta-acidos-e-bases', nomes: ['questao'] },
  { pdf: 'aplica-q100-enem2025-raio-x-e-ciencia.pdf', out: 'aplica-q100-enem2025', nomes: ['raio-x-1', 'raio-x-2', 'ciencia-1', 'ciencia-2'] },
  { pdf: 'aplica-q100-enem2025-desafio-e-resolucao.pdf', out: 'aplica-q100-enem2025', nomes: ['desafio', 'resolucao-1', 'resolucao-2'] },
];

// Larguras de 480 e 1200px (com AVIF/WebP/JPEG) são geradas pelo <Picture>
// do Astro a partir destas matrizes de alta resolução.
const LARGURA_MATRIZ = 1600;

function sh(cmd, args) {
  execFileSync(cmd, args, { stdio: ['ignore', 'ignore', 'inherit'] });
}

async function rasterizarAmostras() {
  for (const { pdf, out, nomes } of PDFS) {
    const dir = join(TMP, pdf.replace('.pdf', ''));
    mkdirSync(dir, { recursive: true });
    sh('pdftoppm', ['-r', '200', '-png', join(ORIG, 'amostras', pdf), join(dir, 'p')]);
    const paginas = readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
    if (paginas.length !== nomes.length) {
      throw new Error(`${pdf}: esperava ${nomes.length} páginas, encontrou ${paginas.length}`);
    }
    mkdirSync(join(OUT_AMOSTRAS, out), { recursive: true });
    for (const [i, arquivo] of paginas.entries()) {
      const destino = join(OUT_AMOSTRAS, out, `${nomes[i]}.webp`);
      await sharp(join(dir, arquivo))
        .trim({ background: '#ffffff', threshold: 8 })
        .resize({ width: LARGURA_MATRIZ, withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(destino);
      console.log('✓', destino);
    }
  }
}

// Remove o fundo branco ("color to alpha"): preserva bordas suavizadas.
async function brancoParaTransparente(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    if (a < 0.04) {
      data[i + 3] = 0;
      continue;
    }
    data[i] = Math.round(255 - (255 - r) / a);
    data[i + 1] = Math.round(255 - (255 - g) / a);
    data[i + 2] = Math.round(255 - (255 - b) / a);
    data[i + 3] = Math.round(a * 255);
  }
  return sharp(data, { raw: info });
}

async function gerarMarca() {
  mkdirSync(OUT_MARCA, { recursive: true });
  const original = join(ORIG, 'marca', 'logo-quimicar-original.png');

  // Logo completa com fundo transparente.
  const completa = await (await brancoParaTransparente(original)).png().toBuffer();
  await sharp(completa).trim().png({ compressionLevel: 9 }).toFile(join(OUT_MARCA, 'logo-completa.png'));

  // Faixas medidas na logo original (1701×925): símbolo, nome, "ENEM", slogan.
  // O sharp aplica trim() antes de extract(); por isso, dois passos.
  const recortar = async (area) => sharp(await sharp(completa).extract(area).png().toBuffer()).trim().png().toBuffer();
  const simbolo = await recortar({ left: 490, top: 40, width: 710, height: 490 });
  const nomeEnem = await recortar({ left: 250, top: 525, width: 1200, height: 285 });
  await sharp(simbolo).png().toFile(join(OUT_MARCA, 'simbolo-q.png'));

  // Assinatura reduzida (manual, item 8): símbolo à esquerda + nome/ENEM à direita.
  const simH = 300;
  const simR = await sharp(simbolo).resize({ height: simH }).png().toBuffer();
  const simMeta = await sharp(simR).metadata();
  const nomeR = await sharp(nomeEnem).resize({ height: Math.round(simH * 0.62) }).png().toBuffer();
  const nomeMeta = await sharp(nomeR).metadata();
  const gap = 28;
  await sharp({
    create: { width: simMeta.width + gap + nomeMeta.width, height: simH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: simR, left: 0, top: 0 },
      { input: nomeR, left: simMeta.width + gap, top: Math.round((simH - nomeMeta.height) / 2) + 10 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(join(OUT_MARCA, 'logo-reduzida.png'));
  console.log('✓ logos');

  // Favicons: símbolo "Q" isolado.
  for (const s of [32, 180, 512]) {
    const nome = s === 180 ? 'apple-touch-icon.png' : `favicon-${s}.png`;
    const fundo = s === 180 ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 };
    const pad = Math.round(s * 0.08);
    await sharp(simbolo)
      .resize({ width: s - pad * 2, height: s - pad * 2, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: fundo })
      .flatten(s === 180 ? { background: '#ffffff' } : false)
      .png()
      .toFile(join(OUT_PUBLIC, nome));
  }
  console.log('✓ favicons');
}

// Página com sombra suave e cantos levemente arredondados, para composições.
async function cartaoPagina(arquivo, largura, rotacao) {
  const img = await sharp(arquivo).resize({ width: largura }).png().toBuffer();
  const { height } = await sharp(img).metadata();
  const r = 10;
  const mascara = Buffer.from(`<svg width="${largura}" height="${height}"><rect width="100%" height="100%" rx="${r}" ry="${r}"/></svg>`);
  const arredondada = await sharp(img).composite([{ input: mascara, blend: 'dest-in' }]).png().toBuffer();
  const sombraPad = 40;
  const sombra = await sharp({
    create: { width: largura + sombraPad * 2, height: height + sombraPad * 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{
      input: Buffer.from(`<svg width="${largura}" height="${height}"><rect width="100%" height="100%" rx="${r}" fill="#0B2342" fill-opacity="0.28"/></svg>`),
      left: sombraPad, top: sombraPad + 14,
    }])
    .blur(16)
    .png()
    .toBuffer();
  const comSombra = await sharp(sombra).composite([{ input: arredondada, left: sombraPad, top: sombraPad }]).png().toBuffer();
  return sharp(comSombra).rotate(rotacao, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

// Desenha em uma tela com margem e recorta o centro, para que páginas
// rotacionadas possam encostar nas bordas sem erro de composição.
async function compor(largura, altura, camadas) {
  const M = 800;
  const composicao = [];
  for (const c of camadas) {
    const buf = await cartaoPagina(c.arquivo, c.largura, c.rotacao);
    const m = await sharp(buf).metadata();
    composicao.push({ input: buf, left: M + Math.round(c.cx * largura - m.width / 2), top: M + Math.round(c.cy * altura - m.height / 2) });
  }
  const tela = await sharp({ create: { width: largura + 2 * M, height: altura + 2 * M, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composicao)
    .png()
    .toBuffer();
  return sharp(tela).extract({ left: M, top: M, width: largura, height: altura });
}

async function gerarHero() {
  const A = (n) => join(OUT_AMOSTRAS, 'aplica-q100-enem2025', `${n}.webp`);
  const C = (n) => join(OUT_AMOSTRAS, 'conecta-acidos-e-bases', `${n}.webp`);
  // 16:10 (computador): Raio-X atrás à esquerda, questão comentada atrás à direita, mapa à frente.
  await (await compor(1600, 1000, [
    { arquivo: A('raio-x-1'), largura: 580, rotacao: -7, cx: 0.255, cy: 0.585 },
    { arquivo: A('desafio'), largura: 580, rotacao: 6, cx: 0.745, cy: 0.585 },
    { arquivo: C('mapa'), largura: 620, rotacao: 0, cx: 0.5, cy: 0.53 },
  ])).webp({ quality: 85 }).toFile(join(OUT_AMOSTRAS, 'hero-16x10.webp'));
  // 4:5 (celular).
  await (await compor(1200, 1500, [
    { arquivo: A('raio-x-1'), largura: 680, rotacao: -6, cx: 0.32, cy: 0.5 },
    { arquivo: C('mapa'), largura: 780, rotacao: 3, cx: 0.6, cy: 0.5 },
  ])).webp({ quality: 85 }).toFile(join(OUT_AMOSTRAS, 'hero-4x5.webp'));
  console.log('✓ hero');
}

async function gerarOG() {
  const pag = await compor(700, 630, [
    { arquivo: join(OUT_AMOSTRAS, 'aplica-q100-enem2025', 'raio-x-1.webp'), largura: 340, rotacao: -6, cx: 0.36, cy: 0.56 },
    { arquivo: join(OUT_AMOSTRAS, 'conecta-acidos-e-bases', 'mapa.webp'), largura: 330, rotacao: 4, cx: 0.64, cy: 0.5 },
  ]);
  const logo = await sharp(join(OUT_MARCA, 'logo-completa.png')).resize({ width: 440 }).png().toBuffer();
  const logoM = await sharp(logo).metadata();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#ffffff' } })
    .composite([
      { input: Buffer.from('<svg width="1200" height="630"><rect x="560" y="0" width="640" height="630" fill="#E8EDF2"/></svg>'), left: 0, top: 0 },
      { input: logo, left: 60, top: Math.round((630 - logoM.height) / 2) },
      { input: await pag.png().toBuffer(), left: 520, top: 0 },
    ])
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(join(OUT_PUBLIC, 'og-image.jpg'));
  console.log('✓ og-image');
}

// PDFs gratuitos (amostra por e-mail), comprimidos sem perder legibilidade.
function comprimirPdfsGratuitos() {
  const destino = join(OUT_PUBLIC, 'amostras');
  mkdirSync(destino, { recursive: true });
  for (const { pdf } of PDFS) {
    const entrada = join(ORIG, 'amostras', pdf);
    const saida = join(destino, pdf);
    sh('gs', ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.5', '-dPDFSETTINGS=/ebook',
      '-dColorImageResolution=200', '-dGrayImageResolution=200',
      '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${saida}`, entrada]);
    // Mantém o original quando a compressão não ajuda.
    if (statSync(saida).size >= statSync(entrada).size) copyFileSync(entrada, saida);
    console.log('✓', saida, `${(statSync(saida).size / 1e6).toFixed(2)} MB`);
  }
}

if (!existsSync(ORIG)) throw new Error('Pasta assets-originais/ não encontrada.');
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT_PUBLIC, { recursive: true });
try {
  await rasterizarAmostras();
  await gerarMarca();
  await gerarHero();
  await gerarOG();
  comprimirPdfsGratuitos();
} finally {
  rmSync(TMP, { recursive: true, force: true });
}
