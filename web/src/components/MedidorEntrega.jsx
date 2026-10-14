import { useSacola } from '../context/SacolaContext';
import { ENTREGA_GRATIS_A_PARTIR } from '../lib/catalogo';
import { dinheiro } from '../lib/formato';

/**
 * Quanto falta para a entrega grátis (R$ 150). É a promessa principal da loja,
 * então aparece na sacola e na barra do carrinho, não só no checkout.
 * "escuro" = sobre a barra preta.
 */
export default function MedidorEntrega({ escuro = false }) {
  const { subtotal, entregaGratis, faltaParaGratis, progresso } = useSacola();
  if (subtotal === 0) return null;

  return (
    <div>
      <p className={`text-sm font-bold ${escuro ? 'text-piche-texto' : 'text-tinta'}`}>
        {entregaGratis ? (
          'Entrega grátis neste pedido.'
        ) : (
          <>
            Faltam <span className="num">{dinheiro(faltaParaGratis)}</span> para a entrega grátis
          </>
        )}
      </p>
      <div
        className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${escuro ? 'bg-white/15' : 'bg-linha'}`}
        role="progressbar"
        aria-label={`Progresso até ${dinheiro(ENTREGA_GRATIS_A_PARTIR)}`}
        aria-valuemin={0}
        aria-valuemax={ENTREGA_GRATIS_A_PARTIR}
        aria-valuenow={Math.min(subtotal, ENTREGA_GRATIS_A_PARTIR)}
      >
        <div
          className={`encher h-full rounded-full ${entregaGratis ? 'bg-verde' : 'bg-laranja'}`}
          style={{ width: `${progresso * 100}%` }}
        />
      </div>
    </div>
  );
}
