import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ENTREGA_GRATIS_A_PARTIR, TAXA_ENTREGA } from '../lib/catalogo';

const SacolaContext = createContext(null);
const CHAVE = 'mmc_sacola';

/** Lê a sacola salva. Se o navegador bloquear o armazenamento (aba anônima, por exemplo), começa vazia. */
function lerSalva() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? JSON.parse(bruto) : {};
  } catch {
    return {};
  }
}

export function SacolaProvider({ children }) {
  // { [produtoId]: { produto, quantidade } }
  const [itens, setItens] = useState(lerSalva);

  // A sacola sobrevive a um recarregamento da página.
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch {
      /* sem armazenamento: a sacola só vive enquanto a aba estiver aberta */
    }
  }, [itens]);

  const adicionar = useCallback((produto) => {
    setItens((atual) => {
      const qtd = atual[produto.id]?.quantidade || 0;
      return { ...atual, [produto.id]: { produto, quantidade: qtd + 1 } };
    });
  }, []);

  const tirarUm = useCallback((produtoId) => {
    setItens((atual) => {
      const item = atual[produtoId];
      if (!item) return atual;
      if (item.quantidade <= 1) {
        const { [produtoId]: _, ...resto } = atual;
        return resto;
      }
      return { ...atual, [produtoId]: { ...item, quantidade: item.quantidade - 1 } };
    });
  }, []);

  const remover = useCallback((produtoId) => {
    setItens(({ [produtoId]: _, ...resto }) => resto);
  }, []);

  const esvaziar = useCallback(() => setItens({}), []);

  /**
   * Depois de carregar o catálogo, atualiza preço/nome dos itens salvos
   * e tira da sacola o que não existe mais.
   */
  const sincronizar = useCallback((produtos) => {
    const porId = new Map(produtos.map((p) => [p.id, p]));
    setItens((atual) => {
      const nova = {};
      for (const [id, item] of Object.entries(atual)) {
        const fresco = porId.get(Number(id));
        if (fresco) nova[id] = { produto: fresco, quantidade: item.quantidade };
      }
      return nova;
    });
  }, []);

  const valor = useMemo(() => {
    const lista = Object.values(itens);
    const quantidade = lista.reduce((s, i) => s + i.quantidade, 0);
    const subtotal = lista.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0);
    const entregaGratis = subtotal >= ENTREGA_GRATIS_A_PARTIR;
    const taxaEntrega = subtotal === 0 || entregaGratis ? 0 : TAXA_ENTREGA;
    return {
      itens,
      lista,
      quantidade,
      subtotal,
      taxaEntrega,
      total: subtotal + taxaEntrega,
      entregaGratis,
      faltaParaGratis: Math.max(0, ENTREGA_GRATIS_A_PARTIR - subtotal),
      progresso: Math.min(1, subtotal / ENTREGA_GRATIS_A_PARTIR),
      adicionar,
      tirarUm,
      remover,
      esvaziar,
      sincronizar,
    };
  }, [itens, adicionar, tirarUm, remover, esvaziar, sincronizar]);

  return <SacolaContext.Provider value={valor}>{children}</SacolaContext.Provider>;
}

export function useSacola() {
  const ctx = useContext(SacolaContext);
  if (!ctx) throw new Error('useSacola precisa estar dentro de <SacolaProvider>');
  return ctx;
}
