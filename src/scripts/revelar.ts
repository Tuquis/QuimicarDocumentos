// Entrada discreta das seções e o evento ver_colecao (uma vez por coleção).
import { track } from '@/lib/track';

export function iniciarRevelar() {
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll<HTMLElement>('.revelar');
  if (reduzir || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('visivel'));
  } else {
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add('visivel');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    // Rede de segurança: rolagem rápida, âncoras e navegadores internos
    // às vezes pulam o callback; nada pode ficar invisível.
    const conferir = () => {
      const limite = innerHeight * 1.1;
      els.forEach((el) => {
        if (!el.classList.contains('visivel') && el.getBoundingClientRect().top < limite) el.classList.add('visivel');
      });
    };
    addEventListener('scroll', conferir, { passive: true });
    addEventListener('hashchange', conferir);
    setTimeout(conferir, 300);
  }

  const vistas = new Set<string>();
  const ioColecao = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        const id = (e.target as HTMLElement).dataset.verColecao;
        if (e.isIntersecting && id && !vistas.has(id) && !(e.target as HTMLElement).hidden) {
          vistas.add(id);
          track('ver_colecao', { content_name: id });
        }
      }
    },
    { threshold: 0.5 },
  );
  document.querySelectorAll('[data-ver-colecao]').forEach((el) => ioColecao.observe(el));
}
