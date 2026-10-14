import { Link } from 'react-router-dom';
import { usePedidoAtivo } from '../context/PedidoAtivoContext';
import { ETAPAS } from '../lib/catalogo';
import { PontoAoVivo } from './ui';
import { IconeSeta } from './icones';

/** Cartão "seu pedido está a caminho" no topo da loja, enquanto houver pedido em andamento. */
export default function PedidoAoVivo() {
  const { ativo } = usePedidoAtivo();
  if (!ativo) return null;
  const etapa = ETAPAS[ativo.status];

  return (
    <Link
      to={'/pedido/' + ativo.id}
      className="mb-4 flex animate-subir items-center gap-3 rounded-[16px] bg-laranja p-3.5 text-[#171513] transition-transform active:scale-[0.98]"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#171513]">
        <PontoAoVivo anel="ring-[#171513]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">
          Pedido Nº {ativo.id}: {etapa?.nome.toLowerCase()}
        </span>
        <span className="block truncate text-sm">{etapa?.detalhe}</span>
      </span>
      <IconeSeta className="size-5 shrink-0" />
    </Link>
  );
}
