import { useNavigate, useParams } from 'react-router-dom';
import { Botao } from '../components/ui';
import { IconeCerto, IconeRelogio } from '../components/icones';

/** O único momento centralizado do app: o pedido foi feito. */
export default function Confirmacao() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <main className="grid min-h-dvh place-items-center bg-piche px-6 py-10 text-piche-texto">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-[18px] bg-laranja text-[#171513]">
          <IconeCerto className="size-11" />
        </div>
        <p className="mt-7 text-lg text-piche-poeira">Pedido feito</p>
        <h1 className="num mt-1 font-letreiro text-5xl">Nº {id}</h1>
        <p className="mx-auto mt-5 max-w-72 text-[17px]">
          O Carlinho já recebeu. Você acompanha cada etapa na tela do pedido.
        </p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold">
          <IconeRelogio className="size-5 text-laranja" />
          Chega em 35 a 50 minutos
        </p>
        <div className="mt-10 space-y-3">
          <Botao onClick={() => navigate('/pedido/' + id, { replace: true })}>Acompanhar pedido</Botao>
          <button
            type="button"
            onClick={() => navigate('/home', { replace: true })}
            className="w-full py-3 font-bold text-piche-texto underline decoration-2 underline-offset-4"
          >
            Voltar para a loja
          </button>
        </div>
      </div>
    </main>
  );
}
