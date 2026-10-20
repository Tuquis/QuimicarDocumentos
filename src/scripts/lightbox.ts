// Lightbox acessível com PhotoSwipe v5: zoom por pinça e por botão, setas,
// teclado, swipe, Esc fecha e o foco volta ao elemento que abriu.
import { track } from '@/lib/track';

export async function iniciarLightbox() {
  const galerias = document.querySelectorAll<HTMLElement>('[data-galeria]');
  if (!galerias.length) return;
  const [{ default: PhotoSwipeLightbox }] = await Promise.all([import('photoswipe/lightbox'), import('photoswipe/style.css')]);

  galerias.forEach((galeria) => {
    const lb = new PhotoSwipeLightbox({
      gallery: galeria,
      children: 'a[data-galeria-item]',
      pswpModule: () => import('photoswipe'),
      bgOpacity: 0.94,
      wheelToZoom: true,
      initialZoomLevel: 'fit',
      // Segundo toque/botão: página na largura da tela (leitura no celular).
      secondaryZoomLevel: (z) => (z.elementSize && z.panAreaSize ? Math.max(1, z.panAreaSize.x / z.elementSize.x) : 1),
      maxZoomLevel: 3,
      closeTitle: 'Fechar (Esc)',
      zoomTitle: 'Ampliar ou reduzir',
      arrowPrevTitle: 'Página anterior',
      arrowNextTitle: 'Próxima página',
      errorMsg: 'Não foi possível carregar a imagem.',
      indexIndicatorSep: ' de ',
      returnFocus: true,
    });

    lb.on('uiRegister', () => {
      lb.pswp?.ui?.registerElement({
        name: 'legenda',
        order: 9,
        isButton: false,
        appendTo: 'root',
        className: 'pswp__legenda',
        onInit: (el, pswp) => {
          el.setAttribute('aria-live', 'polite');
          pswp.on('change', () => {
            const a = pswp.currSlide?.data.element as HTMLElement | undefined;
            el.textContent = a?.dataset.legenda ?? '';
          });
        },
      });
    });
    lb.on('afterInit', () => {
      const el = lb.pswp?.element;
      if (!el) return;
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Visualização ampliada das páginas');
      const a = lb.pswp?.currSlide?.data.element as HTMLElement | undefined;
      track('abrir_amostra', { content_type: 'pagina_amostra', item_id: a?.dataset.legenda ?? '' });
    });
    lb.init();
  });
}
