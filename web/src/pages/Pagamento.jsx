import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Estrutura from '../components/Estrutura';
import { Totais } from '../components/ResumoSacola';
import { Botao, Erro, Vazio } from '../components/ui';
import { IconeCartao, IconeCedula, IconePino, IconeQrCode, IconeSacolinha } from '../components/icones';
import { criarPedido } from '../api/pedidos';
import { useAuth } from '../context/AuthContext';
import { useSacola } from '../context/SacolaContext';
import { usePedidoAtivo } from '../context/PedidoAtivoContext';
import { dinheiro } from '../lib/formato';

const FORMAS = [
  { id: 'pix', nome: 'Pix', detalhe: 'Pague por Pix na hora da entrega.', Icone: IconeQrCode },
  { id: 'cartao', nome: 'Cartão na entrega', detalhe: 'Débito ou crédito na maquininha.', Icone: IconeCartao },
  { id: 'dinheiro', nome: 'Dinheiro', detalhe: 'Pague em espécie ao receber.', Icone: IconeCedula },
];

function Bloco({ titulo, children, acao }) {
  return (
    <section className="rounded-[14px] border border-linha bg-papel p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

export default function Pagamento() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const sacola = useSacola();
  const { atualizar: atualizarPedidoAtivo } = usePedidoAtivo();
  const [forma, setForma] = useState('pix');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function fazerPedido() {
    setErro('');
    setEnviando(true);
    try {
      const itens = sacola.lista.map(({ produto, quantidade }) => ({ produtoId: produto.id, quantidade }));
      const pedido = await criarPedido({ itens, formaPagamento: forma });
      sacola.esvaziar();
      atualizarPedidoAtivo(); // a aba Pedidos já ganha o ponto "ao vivo"
      navigate('/confirmacao/' + pedido.id, { replace: true });
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  if (sacola.lista.length === 0) {
    return (
      <Estrutura titulo="Pagamento" voltar largura="estreita" semAbas>
        <Vazio
          Icone={IconeSacolinha}
          titulo="Sua sacola está vazia."
          acao={<Botao onClick={() => navigate('/home')}>Ir para a loja</Botao>}
        >
          Adicione produtos antes de escolher o pagamento.
        </Vazio>
      </Estrutura>
    );
  }

  return (
    <Estrutura titulo="Pagamento" voltar largura="estreita" semAbas>
      <div className="space-y-4">
        <Bloco
          titulo="Entregar em"
          acao={
            <Link to="/perfil/editar" className="text-[15px] font-bold text-laranja-texto underline decoration-2 underline-offset-4">
              Alterar
            </Link>
          }
        >
          <p className="flex items-start gap-2.5">
            <IconePino className="mt-0.5 size-5 shrink-0 text-laranja-texto" />
            {usuario?.endereco}
          </p>
        </Bloco>

        <Bloco titulo="Como você vai pagar">
          <fieldset>
            <legend className="sr-only">Forma de pagamento</legend>
            <div className="space-y-2">
              {FORMAS.map(({ id, nome, detalhe, Icone }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-3 rounded-[10px] border-2 border-linha p-3 has-[:checked]:border-tinta has-[:checked]:bg-chao/60"
                >
                  <input
                    type="radio"
                    name="pagamento"
                    value={id}
                    checked={forma === id}
                    onChange={() => setForma(id)}
                    className="peer sr-only"
                  />
                  <Icone className="size-6 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{nome}</span>
                    <span className="block text-sm text-poeira">{detalhe}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-linha peer-checked:border-tinta peer-checked:bg-tinta peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-laranja"
                  >
                    <span className="size-2 rounded-full bg-chao" />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Bloco>

        <Bloco
          titulo="Resumo"
          acao={
            <Link to="/carrinho" className="text-[15px] font-bold text-laranja-texto underline decoration-2 underline-offset-4">
              Ver itens ({sacola.quantidade})
            </Link>
          }
        >
          <Totais subtotal={sacola.subtotal} taxaEntrega={sacola.taxaEntrega} total={sacola.total} />
          {!sacola.entregaGratis && (
            <p className="mt-3 text-sm text-poeira">
              Mais <span className="num font-bold text-tinta">{dinheiro(sacola.faltaParaGratis)}</span> em produtos e a
              entrega sai de graça.
            </p>
          )}
        </Bloco>

        <Erro>{erro}</Erro>

        <Botao onClick={fazerPedido} disabled={enviando}>
          {enviando ? 'Enviando pedido...' : <span>Fazer pedido de <span className="num">{dinheiro(sacola.total)}</span></span>}
        </Botao>
      </div>
    </Estrutura>
  );
}
