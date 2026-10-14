import { useId } from 'react';
import { dinheiro } from '../lib/formato';
import { IconeAlerta, IconeMais, IconeMenos } from './icones';

/* Peças pequenas reaproveitadas pelas telas. Cada uma guarda as classes do Tailwind num lugar só. */

const BOTAO = {
  // Texto preto no laranja: branco no laranja não passa no contraste (2,9:1).
  primario: 'bg-laranja text-[#171513] hover:brightness-95 active:brightness-90',
  escuro: 'bg-tinta text-chao hover:opacity-90',
  contorno: 'border-2 border-tinta text-tinta hover:bg-tinta/5',
  texto: 'text-laranja-texto underline decoration-2 underline-offset-4 hover:decoration-laranja',
};

export function Botao({ variante = 'primario', className = '', children, ...props }) {
  const base =
    variante === 'texto'
      ? 'inline-flex items-center gap-2 font-bold disabled:opacity-50'
      : 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] px-5 text-[17px] font-bold disabled:cursor-not-allowed disabled:opacity-50';
  return (
    <button className={`${base} ${BOTAO[variante]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Campo({ rotulo, dica, erro, className = '', ...props }) {
  const id = useId();
  const idDica = dica ? id + '-dica' : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-bold">
        {rotulo}
      </label>
      <input
        id={id}
        aria-describedby={idDica}
        aria-invalid={erro ? true : undefined}
        className="h-12 w-full rounded-[10px] border-2 border-linha bg-papel px-3.5 text-[17px] text-tinta placeholder:text-poeira/70 focus:border-tinta focus:outline-none aria-[invalid=true]:border-erro"
        {...props}
      />
      {dica && (
        <p id={idDica} className="mt-1.5 text-sm text-poeira">
          {dica}
        </p>
      )}
    </div>
  );
}

/** Caixa de erro vinda do servidor ou da validação. */
export function Erro({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-[10px] bg-erro-claro px-3.5 py-3 text-[15px] font-bold text-erro">
      <IconeAlerta className="mt-px size-5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/**
 * O preço como etiqueta de maquininha de preço de mercadinho.
 * tamanho "p" nos cards, "g" nos totais.
 */
export function Etiqueta({ valor, tamanho = 'p', className = '' }) {
  const t = tamanho === 'g' ? 'px-2.5 py-1 text-xl' : 'px-1.5 py-0.5 text-[15px]';
  return (
    <span className={`num inline-block rounded-[4px] bg-laranja font-letreiro leading-none text-[#171513] ${t} ${className}`}>
      {dinheiro(valor)}
    </span>
  );
}

/** − 2 + */
export function Contador({ quantidade, nome, onMenos, onMais, compacto = false, laranja = false }) {
  const tam = compacto ? 'size-9' : 'size-10';
  const cor = laranja ? 'bg-laranja text-[#171513]' : 'bg-tinta text-chao';
  return (
    <div className={`inline-flex select-none items-center rounded-[10px] ${cor}`}>
      <button type="button" onClick={onMenos} className={`${tam} grid place-items-center transition-transform active:scale-90`} aria-label={`Tirar um ${nome}`}>
        <IconeMenos className="size-4" />
      </button>
      <span className="num min-w-6 text-center text-[17px] font-bold" aria-live="polite">
        {quantidade}
      </span>
      <button type="button" onClick={onMais} className={`${tam} grid place-items-center transition-transform active:scale-90`} aria-label={`Mais um ${nome}`}>
        <IconeMais className="size-4" />
      </button>
    </div>
  );
}

/** Tela vazia: diz o que fazer em seguida, não só que está vazio. */
export function Vazio({ Icone, titulo, children, acao }) {
  return (
    <div className="mx-auto max-w-sm py-14 text-center">
      {Icone && <Icone className="mx-auto mb-4 size-12 text-poeira" />}
      <h2 className="text-xl font-bold">{titulo}</h2>
      {children && <p className="mt-2 text-poeira">{children}</p>}
      {acao && <div className="mx-auto mt-6 max-w-60">{acao}</div>}
    </div>
  );
}

/** Esqueleto enquanto carrega: blocos cinza no formato do conteúdo. */
export function Esqueleto({ className = '' }) {
  return <div className={`animate-pulse rounded-[10px] bg-linha/60 ${className}`} />;
}

/** Ponto laranja "ao vivo": algo está acontecendo agora (pedido em andamento). */
export function PontoAoVivo({ className = '', anel = 'ring-piche' }) {
  return (
    <span aria-hidden="true" className={`relative inline-flex size-2.5 ${className}`}>
      <span className="absolute inset-0 animate-aceso rounded-full bg-laranja" />
      <span className={`relative size-2.5 rounded-full bg-laranja ring-2 ${anel}`} />
    </span>
  );
}
