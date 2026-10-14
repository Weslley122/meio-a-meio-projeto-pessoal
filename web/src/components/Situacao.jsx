import { ETAPAS, ULTIMA_ETAPA } from '../lib/catalogo';

/** Etiqueta curta com a etapa do pedido. Entregue em verde; em andamento em laranja. */
export default function Situacao({ status }) {
  const entregue = status >= ULTIMA_ETAPA;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-bold ${
        entregue ? 'bg-verde-claro text-verde' : 'bg-laranja-claro text-laranja-texto'
      }`}
    >
      <span className="relative inline-flex size-2" aria-hidden="true">
        {!entregue && <span className="absolute inset-0 animate-aceso rounded-full bg-laranja" />}
        <span className={`relative size-2 rounded-full ${entregue ? 'bg-verde' : 'bg-laranja'}`} />
      </span>
      {ETAPAS[status]?.nome ?? 'Desconhecido'}
    </span>
  );
}
