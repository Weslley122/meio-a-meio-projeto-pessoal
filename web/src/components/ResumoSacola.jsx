import { useNavigate } from 'react-router-dom';
import { useSacola } from '../context/SacolaContext';
import { dinheiro } from '../lib/formato';
import MedidorEntrega from './MedidorEntrega';
import ProdutoArte from './ProdutoArte';
import { Botao, Contador } from './ui';
import { IconeSacolinha } from './icones';

export function Totais({ subtotal, taxaEntrega, total, className = '' }) {
  return (
    <dl className={`space-y-1.5 text-[15px] ${className}`}>
      <div className="flex justify-between">
        <dt className="text-poeira">Produtos</dt>
        <dd className="num">{dinheiro(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-poeira">Entrega</dt>
        <dd className="num">{Number(taxaEntrega) === 0 ? <span className="font-bold text-verde">Grátis</span> : dinheiro(taxaEntrega)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-linha pt-2.5">
        <dt className="font-bold">Total</dt>
        <dd className="num font-letreiro text-xl">{dinheiro(total)}</dd>
      </div>
    </dl>
  );
}

export function LinhaItem({ produto, quantidade }) {
  const { adicionar, tirarUm } = useSacola();
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="size-14 shrink-0 rounded-[10px] bg-vitrine p-1.5">
        <ProdutoArte produto={produto} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[15px] font-bold leading-tight">{produto.nome}</p>
        <p className="num mt-0.5 text-sm text-poeira">
          {quantidade} × {dinheiro(produto.preco)}
        </p>
      </div>
      <Contador
        compacto
        quantidade={quantidade}
        nome={produto.nome}
        onMenos={() => tirarUm(produto.id)}
        onMais={() => adicionar(produto)}
      />
    </li>
  );
}

/** A sacola inteira. Usada na tela da sacola e na coluna da direita da loja no computador. */
export default function ResumoSacola({ naLateral = false }) {
  const navigate = useNavigate();
  const sacola = useSacola();

  if (sacola.lista.length === 0) {
    return (
      <div className={naLateral ? 'pt-2' : 'py-14 text-center'}>
        {naLateral && <h2 className="mb-6 text-xl font-bold">Sacola</h2>}
        <IconeSacolinha className={naLateral ? 'size-10 text-poeira' : 'mx-auto mb-4 size-12 text-poeira'} />
        <p className={`mt-3 font-bold ${naLateral ? '' : 'text-xl'}`}>Sua sacola está vazia.</p>
        <p className="mt-1 text-poeira">
          {naLateral ? 'Toque em Adicionar nos produtos.' : 'Escolha os produtos na loja para montar o pedido.'}
        </p>
        {!naLateral && (
          <div className="mx-auto mt-6 max-w-60">
            <Botao onClick={() => navigate('/home')}>Ir para a loja</Botao>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {naLateral && (
        <h2 className="mb-2 flex items-baseline justify-between text-xl font-bold">
          Sacola
          <span className="num text-sm font-normal text-poeira">
            {sacola.quantidade} {sacola.quantidade === 1 ? 'item' : 'itens'}
          </span>
        </h2>
      )}

      <ul className="divide-y divide-linha">
        {sacola.lista.map(({ produto, quantidade }) => (
          <LinhaItem key={produto.id} produto={produto} quantidade={quantidade} />
        ))}
      </ul>

      <div className="mt-4 rounded-[14px] border border-linha bg-chao/60 p-4">
        <MedidorEntrega />
        <Totais
          className="mt-4"
          subtotal={sacola.subtotal}
          taxaEntrega={sacola.taxaEntrega}
          total={sacola.total}
        />
      </div>

      <Botao className="mt-4" onClick={() => navigate('/checkout')}>
        Escolher pagamento
      </Botao>
      {!naLateral && (
        <button
          type="button"
          onClick={sacola.esvaziar}
          className="mx-auto mt-4 block text-[15px] font-bold text-poeira underline decoration-2 underline-offset-4 hover:text-erro"
        >
          Esvaziar sacola
        </button>
      )}
    </div>
  );
}
