import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Estrutura from '../components/Estrutura';
import { Totais } from '../components/ResumoSacola';
import { Erro, Esqueleto } from '../components/ui';
import { IconeCerto } from '../components/icones';
import { buscarPedido } from '../api/pedidos';
import { useRepetir } from '../lib/useRepetir';
import { ETAPAS, ULTIMA_ETAPA } from '../lib/catalogo';
import { dataHora, dinheiro, pagamento } from '../lib/formato';

/** Linha do tempo das 4 etapas. Aqui a numeração faz sentido: é uma sequência de verdade. */
function LinhaDoTempo({ status }) {
  return (
    <ol className="relative">
      {ETAPAS.map((etapa, i) => {
        const feita = i < status || status === ULTIMA_ETAPA;
        const agora = i === status && status !== ULTIMA_ETAPA;
        const ultima = i === ETAPAS.length - 1;
        return (
          <li key={etapa.nome} className="relative flex gap-4 pb-6 last:pb-0" aria-current={agora ? 'step' : undefined}>
            {!ultima && (
              <span
                aria-hidden="true"
                className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${i < status ? 'bg-tinta' : 'bg-linha'}`}
              />
            )}
            <span className="relative z-10 size-8 shrink-0">
              {agora && <span aria-hidden="true" className="absolute inset-0 animate-aceso-caixa rounded-[8px] bg-laranja" />}
              <span
                key={feita ? 'feita' : 'aberta'}
                className={`num relative grid size-8 place-items-center rounded-[8px] text-[15px] font-bold ${
                  feita ? 'animate-pulo bg-tinta text-chao' : agora ? 'bg-laranja text-[#171513]' : 'border-2 border-linha bg-papel text-poeira'
                }`}
              >
                {feita ? <IconeCerto className="size-4" /> : i + 1}
              </span>
            </span>
            <div className="pt-1">
              <p className={`font-bold ${!feita && !agora ? 'text-poeira' : ''}`}>{etapa.nome}</p>
              {(agora || (ultima && feita)) && <p className="mt-0.5 text-[15px] text-poeira">{etapa.detalhe}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function Acompanhar() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState('');
  const [conferidoEm, setConferidoEm] = useState(null);

  // Consulta a cada 5 s e para sozinho quando o pedido é entregue.
  const terminou = pedido?.status >= ULTIMA_ETAPA;
  useRepetir(
    () =>
      buscarPedido(id)
        .then((p) => {
          setPedido(p);
          setErro('');
          setConferidoEm(new Date());
        })
        .catch((e) => setErro(e.message)),
    5000,
    !terminou,
  );

  return (
    <Estrutura titulo={`Pedido Nº ${id}`} voltar="/pedidos" largura="estreita">
      <Erro>{erro}</Erro>

      {!pedido && !erro && <Esqueleto className="h-72" />}

      {pedido && (
        <div className="space-y-4">
          <section className="rounded-[14px] border border-linha bg-papel p-5">
            <LinhaDoTempo status={pedido.status} />
            {!terminou && conferidoEm && (
              <p className="mt-5 border-t border-linha pt-3 text-sm text-poeira" aria-live="polite">
                Atualiza sozinho. Última conferida às{' '}
                {conferidoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.
              </p>
            )}
          </section>

          <section className="rounded-[14px] border border-linha bg-papel p-5">
            <h2 className="mb-3 text-lg font-bold">Itens</h2>
            <ul className="mb-4 space-y-2 text-[15px]">
              {pedido.itens.map((it) => (
                <li key={it.produtoId} className="flex justify-between gap-4">
                  <span>
                    <span className="num font-bold">{it.quantidade}×</span> {it.nome}
                  </span>
                  <span className="num shrink-0">{dinheiro(it.precoUnitario * it.quantidade)}</span>
                </li>
              ))}
            </ul>
            <Totais subtotal={pedido.subtotal} taxaEntrega={pedido.taxaEntrega} total={pedido.total} />
          </section>

          <section className="rounded-[14px] border border-linha bg-papel p-5 text-[15px]">
            <dl className="space-y-3">
              <div>
                <dt className="text-poeira">Feito em</dt>
                <dd className="font-bold">{dataHora(pedido.criadoEm)}</dd>
              </div>
              <div>
                <dt className="text-poeira">Pagamento</dt>
                <dd className="font-bold">{pagamento(pedido.formaPagamento)}</dd>
              </div>
              <div>
                <dt className="text-poeira">Entregar em</dt>
                <dd className="font-bold">{pedido.clienteEndereco}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </Estrutura>
  );
}
