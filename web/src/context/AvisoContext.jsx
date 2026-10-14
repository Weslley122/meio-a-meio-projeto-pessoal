import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { IconeAlerta, IconeCerto } from '../components/icones';

const AvisoContext = createContext(null);

/**
 * Aviso curto no rodapé da tela.
 *   avisar('Endereço salvo.')            -> confirmação
 *   avisar('Sem conexão.', 'erro')       -> erro (fica mais tempo na tela)
 */
export function AvisoProvider({ children }) {
  const [aviso, setAviso] = useState(null);
  const timer = useRef(null);

  const avisar = useCallback((texto, tipo = 'ok') => {
    clearTimeout(timer.current);
    setAviso({ texto, tipo, chave: Date.now() });
    timer.current = setTimeout(() => setAviso(null), tipo === 'erro' ? 4000 : 2200);
  }, []);

  const erro = aviso?.tipo === 'erro';

  return (
    <AvisoContext.Provider value={avisar}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-40 z-50 flex justify-center px-4 lg:bottom-8"
      >
        {aviso && (
          <div
            key={aviso.chave}
            className="flex max-w-sm animate-subir items-start gap-2.5 rounded-[10px] bg-tinta px-4 py-3 text-[15px] font-bold text-chao shadow-[0_8px_24px_rgb(0_0_0/0.25)]"
          >
            {erro ? (
              <IconeAlerta className="mt-px size-5 shrink-0 text-laranja" />
            ) : (
              <IconeCerto className="mt-px size-5 shrink-0 text-laranja" />
            )}
            <span>{aviso.texto}</span>
          </div>
        )}
      </div>
    </AvisoContext.Provider>
  );
}

export function useAviso() {
  const ctx = useContext(AvisoContext);
  if (!ctx) throw new Error('useAviso precisa estar dentro de <AvisoProvider>');
  return ctx;
}
