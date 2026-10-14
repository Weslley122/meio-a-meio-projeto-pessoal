import { useSacola } from '../context/SacolaContext';
import ProdutoArte from './ProdutoArte';
import { Contador, Etiqueta } from './ui';
import { IconeMais } from './icones';

/** Um toque curtinho no celular ao colocar na sacola (só Android tem; quem pede menos movimento não sente). */
function vibrar() {
  try {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate?.(8);
  } catch {
    /* navegador sem vibração */
  }
}

/**
 * Card de produto. O preço fica colado na "foto" como etiqueta de maquininha,
 * e o rodapé é sempre um controle de largura total: fácil de acertar com o dedão.
 * Responde ao toque: encolhe um pouco enquanto o botão está apertado e, com o produto na sacola,
 * ganha borda laranja e um selo com a quantidade.
 */
export default function ProdutoCard({ produto, emLinha = false }) {
  const { itens, adicionar, tirarUm } = useSacola();
  const quantidade = itens[produto.id]?.quantidade || 0;

  function colocar() {
    vibrar();
    adicionar(produto);
  }

  return (
    <article
      className={`flex flex-col rounded-[16px] border-2 bg-papel p-2 shadow-[0_1px_2px_rgb(23_21_19/0.06)] transition-[transform,border-color] duration-150 has-[button:active]:scale-[0.98] ${
        quantidade > 0 ? 'border-laranja' : 'border-transparent'
      } ${
        emLinha ? 'w-[152px] shrink-0 snap-start sm:w-44 lg:w-auto' : ''
      }`}
    >
      <div className="relative aspect-square rounded-[10px] bg-vitrine p-3">
        <ProdutoArte produto={produto} />
        <Etiqueta valor={produto.preco} className="absolute bottom-2 left-2" />
        {quantidade > 0 && (
          <span
            key={quantidade}
            className="num absolute right-2 top-2 grid size-7 animate-pulo place-items-center rounded-full bg-laranja text-sm font-bold text-[#171513]"
            aria-label={`${quantidade} na sacola`}
          >
            {quantidade}
          </span>
        )}
      </div>

      <h3 className="mt-2.5 line-clamp-2 min-h-[2.5em] px-0.5 text-[15px] font-bold leading-tight">{produto.nome}</h3>
      <p className="line-clamp-1 min-h-[1.4em] px-0.5 text-[13px] text-poeira">{produto.descricao}</p>

      <div className="mt-auto pt-2.5">
        {quantidade > 0 ? (
          <div className="animate-aparecer [&>div]:flex [&>div]:w-full [&>div]:justify-between">
            <Contador
              compacto
              laranja
              quantidade={quantidade}
              nome={produto.nome}
              onMenos={() => tirarUm(produto.id)}
              onMais={colocar}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={colocar}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-[10px] bg-tinta text-[15px] font-bold text-papel transition-[transform,background-color] hover:bg-[#2b2724] active:scale-95"
            aria-label={`Adicionar ${produto.nome}`}
          >
            <IconeMais className="size-4" />
            Adicionar
          </button>
        )}
      </div>
    </article>
  );
}
