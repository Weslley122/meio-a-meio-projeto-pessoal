import { createContext, useCallback, useContext, useState } from 'react';
import { meusPedidos } from '../api/pedidos';
import { useAuth } from './AuthContext';
import { useRepetir } from '../lib/useRepetir';
import { ULTIMA_ETAPA } from '../lib/catalogo';

const PedidoAtivoContext = createContext({ ativo: null, atualizar: () => {} });

/**
 * O pedido do cliente que ainda não foi entregue (o mais recente).
 * Fica num lugar só para a aba "Pedidos" ganhar o pontinho e a loja mostrar
 * "seu pedido está a caminho" sem cada tela buscar de novo.
 * Consulta a cada 20 s, pausando com a aba escondida (ver useRepetir).
 */
export function PedidoAtivoProvider({ children }) {
  const { logado, isAdmin } = useAuth();
  const [ativo, setAtivo] = useState(null);

  const atualizar = useCallback(
    () =>
      meusPedidos()
        .then((lista) => {
          const emAndamento = lista.filter((p) => p.status < ULTIMA_ETAPA).sort((a, b) => b.id - a.id);
          setAtivo(emAndamento[0] || null);
        })
        .catch(() => {
          /* sem rede: mantém o que já sabia */
        }),
    [],
  );

  // O dono não faz pedido para si mesmo; ele acompanha tudo pelo Painel.
  const ligado = logado && !isAdmin;
  useRepetir(atualizar, 20000, ligado);

  return (
    <PedidoAtivoContext.Provider value={{ ativo: ligado ? ativo : null, atualizar }}>
      {children}
    </PedidoAtivoContext.Provider>
  );
}

export function usePedidoAtivo() {
  return useContext(PedidoAtivoContext);
}
