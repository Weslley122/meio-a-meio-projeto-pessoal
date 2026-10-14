import { useEffect, useRef } from 'react';

/**
 * Chama `fn` agora e depois a cada `ms`, enquanto `ligado` for true.
 * Pausa quando a aba fica escondida (celular no bolso não gasta dados à toa)
 * e busca de novo assim que a pessoa volta pra aba.
 *
 * É o "tempo real" do projeto: sem WebSocket, o status do pedido é consultado de tempos em tempos.
 */
export function useRepetir(fn, ms, ligado = true) {
  const fnAtual = useRef(fn);
  fnAtual.current = fn;

  useEffect(() => {
    if (!ligado) return undefined;
    let timer;

    const rodar = () => fnAtual.current();
    const agendar = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        if (document.visibilityState === 'visible') rodar();
      }, ms);
    };
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') rodar();
    };

    rodar();
    agendar();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [ms, ligado]);
}
