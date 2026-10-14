import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Estrutura from '../components/Estrutura';
import Situacao from '../components/Situacao';
import { Botao, Erro, Esqueleto, Vazio } from '../components/ui';
import { IconeComanda, IconeSeta } from '../components/icones';
import { meusPedidos } from '../api/pedidos';
import { useRepetir } from '../lib/useRepetir';
import { ULTIMA_ETAPA } from '../lib/catalogo';
import { dataHora, dinheiro } from '../lib/formato';

export function resumoItens(itens) {
  const [primeiro, ...resto] = itens;
  if (!primeiro) return '';
  const texto = `${primeiro.quantidade}× ${primeiro.nome}`;
  return resto.length ? `${texto} e mais ${resto.length} ${resto.length === 1 ? 'item' : 'itens'}` : texto;
}

export default function Pedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState(null);
  const [erro, setErro] = useState('');

  // Enquanto houver pedido em andamento, a lista se atualiza sozinha.
  const emAndamento = pedidos?.some((p) => p.status < ULTIMA_ETAPA) ?? true;
  useRepetir(
    () =>
      meusPedidos()
        .then((lista) => {
          setPedidos([...lista].sort((a, b) => b.id - a.id));
          setErro('');
        })
        .catch((e) => setErro(e.message)),
    15000,
    emAndamento,
  );

  return (
    <Estrutura titulo="Seus pedidos" largura="estreita">
      <Erro>{erro}</Erro>

      {!pedidos && !erro && (
        <div className="space-y-3">
          <Esqueleto className="h-32" />
          <Esqueleto className="h-32" />
        </div>
      )}

      {pedidos?.length === 0 && (
        <Vazio
          Icone={IconeComanda}
          titulo="Você ainda não fez nenhum pedido."
          acao={<Botao onClick={() => navigate('/home')}>Ir para a loja</Botao>}
        >
          Quando fizer, ele aparece aqui com a etapa da entrega.
        </Vazio>
      )}

      {pedidos?.length > 0 && (
        <ul className="space-y-3">
          {pedidos.map((p) => (
            <li key={p.id}>
              <Link
                to={'/pedido/' + p.id}
                className="flex items-center gap-3 rounded-[14px] border border-linha bg-papel p-4 hover:border-tinta"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="num font-letreiro text-lg">Nº {p.id}</span>
                    <Situacao status={p.status} />
                  </div>
                  <p className="mt-2 truncate text-[15px]">{resumoItens(p.itens)}</p>
                  <p className="mt-1 flex justify-between text-sm text-poeira">
                    <span>{dataHora(p.criadoEm)}</span>
                    <span className="num font-bold text-tinta">{dinheiro(p.total)}</span>
                  </p>
                </div>
                <IconeSeta className="size-5 shrink-0 text-poeira" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Estrutura>
  );
}
