import { useRef, useState } from 'react';
import { useSacola } from '../context/SacolaContext';
import { dinheiro } from '../lib/formato';
import { IconeCedula, IconeGelo, IconeMoto } from './icones';

/**
 * Faixa de avisos da loja no topo, de arrastar para o lado (no computador ficam os três lado a lado).
 * Não troca sozinha: quem decide a hora de ver o próximo é a pessoa. Os tracinhos embaixo mostram
 * em qual cartão ela está.
 * Só fala de coisas que o app cumpre de verdade: a regra de entrega, o gelo do catálogo, o pagamento na entrega.
 */
export default function Vitrine({ irPara }) {
  const { subtotal, entregaGratis, faltaParaGratis } = useSacola();
  const trilho = useRef(null);
  const [atual, setAtual] = useState(0);

  const situacaoEntrega =
    subtotal === 0
      ? 'Abaixo disso, a entrega custa R$\u00a020.'
      : entregaGratis
        ? 'Sua sacola já garantiu a entrega grátis.'
        : `Faltam ${dinheiro(faltaParaGratis)} na sua sacola.`;

  const cartoes = [
    {
      chave: 'entrega',
      fundo: 'bg-piche text-piche-texto',
      titulo: 'Entrega grátis a partir de R$\u00a0150',
      texto: situacaoEntrega,
      Icone: IconeMoto,
      corIcone: 'text-laranja',
    },
    {
      chave: 'gelo',
      fundo: 'bg-laranja text-[#171513]',
      titulo: 'Gelo em cubo e em barra',
      texto: 'Saco de 5 kg e barra inteira, junto com a bebida.',
      Icone: IconeGelo,
      corIcone: 'text-[#171513]',
      acao: { texto: 'Ver gelo', fazer: () => irPara('gelo') },
    },
    {
      chave: 'pagamento',
      fundo: 'border-2 border-linha bg-papel text-tinta',
      titulo: 'Paga só quando chegar',
      texto: 'Pix, cartão ou dinheiro na hora da entrega.',
      Icone: IconeCedula,
      corIcone: 'text-laranja-texto',
    },
  ];

  function aoRolar() {
    const el = trilho.current;
    if (!el || !el.firstElementChild) return;
    const passo = el.firstElementChild.getBoundingClientRect().width + 12; // largura + gap-3
    setAtual(Math.round(el.scrollLeft / passo));
  }

  return (
    <section aria-label="Avisos da loja" className="mt-5">
      <div
        ref={trilho}
        onScroll={aoRolar}
        className="rolagem-lateral -mx-4 flex scroll-px-4 gap-3 px-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0"
      >
        {cartoes.map(({ chave, fundo, titulo, texto, Icone, corIcone, acao }) => (
          <article
            key={chave}
            className={`relative flex min-h-[128px] w-[84%] shrink-0 snap-start flex-col overflow-hidden rounded-[14px] p-4 sm:w-[46%] lg:w-auto ${fundo}`}
          >
            <Icone className={`absolute -bottom-3 -right-3 size-24 opacity-90 lg:-bottom-2 lg:-right-2 lg:size-16 ${corIcone}`} />
            <h2 className="max-w-[75%] text-lg font-bold leading-tight lg:max-w-none">{titulo}</h2>
            <p className="mt-1.5 max-w-[70%] text-[15px] leading-snug opacity-90 lg:max-w-[78%]">{texto}</p>
            {acao && (
              <button
                type="button"
                onClick={acao.fazer}
                className="relative mt-auto w-fit rounded-full bg-[#171513] px-4 py-1.5 text-sm font-bold text-laranja transition-transform active:scale-95"
              >
                {acao.texto}
              </button>
            )}
          </article>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5 lg:hidden" aria-hidden="true">
        {cartoes.map(({ chave }, i) => (
          <span
            key={chave}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === atual ? 'w-5 bg-laranja' : 'w-1.5 bg-linha'}`}
          />
        ))}
      </div>
    </section>
  );
}
