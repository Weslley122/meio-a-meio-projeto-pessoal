/*
  Ícones do app, desenhados à mão numa grade de 24px.
  Traço de 2px com pontas retas e cantos vivos (lembra a estrutura de ferro do toldo do depósito),
  em vez das pontas arredondadas dos pacotes de ícones prontos.
  Cor e tamanho vêm do Tailwind pelo className: <IconeGelo className="size-5 text-laranja" />.
*/

function Icone({ className = 'size-6', titulo, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      role={titulo ? 'img' : undefined}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      {titulo && <title>{titulo}</title>}
      {children}
    </svg>
  );
}

/* ---------- Navegação ---------- */

/** Fachada com porta de enrolar: a "Loja". */
export function IconeLoja(props) {
  return (
    <Icone {...props}>
      <path d="M3 9 5 4h14l2 5H3Z" />
      <path d="M4.5 9v11h15V9" />
      <path d="M8.5 20v-7h7v7M8.5 16.5h7" />
    </Icone>
  );
}

/** Comanda com o pé picotado: "Pedidos". */
export function IconeComanda(props) {
  return (
    <Icone {...props}>
      <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5V3Z" />
      <path d="M9 8h6M9 11.5h6M9 15h3" />
    </Icone>
  );
}

/** Moto de entrega com baú: "Rota". */
export function IconeMoto(props) {
  return (
    <Icone {...props}>
      <circle cx="5.5" cy="17" r="2.5" />
      <circle cx="18.5" cy="17" r="2.5" />
      <path d="M2.5 11h10l2 6H8" />
      <path d="M18.5 17 16 8h-2.5" />
      <path d="M3 6h5.5v5H3z" />
    </Icone>
  );
}

export function IconePessoa(props) {
  return (
    <Icone {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20.5c0-4 3-6.5 7-6.5s7 2.5 7 6.5" />
    </Icone>
  );
}

/** Prancheta de anotar pedido: o "Painel" do dono. */
export function IconePrancheta(props) {
  return (
    <Icone {...props}>
      <path d="M15 4.5h3.5V21h-13V4.5H9" />
      <path d="M9 3h6v3H9z" />
      <path d="M9 11h6M9 14.5h6M9 18h3" />
    </Icone>
  );
}

/** Sacolinha plástica de mercadinho (a de alça, "camiseta"). */
export function IconeSacolinha(props) {
  return (
    <Icone {...props}>
      <path d="M5.5 8.5h13L17.5 21h-11L5.5 8.5Z" />
      <path d="M7.5 8.5V6a1.75 1.75 0 0 1 3.5 0v2.5M13 8.5V6a1.75 1.75 0 0 1 3.5 0v2.5" />
    </Icone>
  );
}

/* ---------- Categorias ---------- */

export function IconeLongNeck(props) {
  return (
    <Icone {...props}>
      <path d="M10 2.5h4V6l1.5 3.5v12h-7v-12L10 6V2.5Z" />
      <path d="M8.5 13.5h7M8.5 17.5h7" />
    </Icone>
  );
}

/** Garrafa PET de 2 litros. */
export function IconePet(props) {
  return (
    <Icone {...props}>
      <path d="M10 2.5h4v2h-4z" />
      <path d="M10.5 4.5V6C8.5 7 7.5 8.5 7.5 10.5v11h9v-11c0-2-1-3.5-3-4.5V4.5" />
      <path d="M7.5 14h9M7.5 17.5h9" />
    </Icone>
  );
}

/** Galão de 20 litros: o que mais sai num depósito. */
export function IconeGalao(props) {
  return (
    <Icone {...props}>
      <path d="M10 2.5h4V5h-4z" />
      <path d="M5.5 9 9 5h6l3.5 4v12.5h-13V9Z" />
      <path d="M5.5 13h13M5.5 17h13" />
    </Icone>
  );
}

/** Saco de gelo amarrado, com cubos dentro. */
export function IconeGelo(props) {
  return (
    <Icone {...props}>
      <path d="M9.5 7 12 3.5 14.5 7" />
      <path d="M6 7h12l-1 14.5H7L6 7Z" />
      <path d="M9 11h3v3H9zM12.5 15h3v3h-3z" />
    </Icone>
  );
}

/** Pacote de salgadinho com a solda serrilhada em cima e embaixo. */
export function IconeSalgadinho(props) {
  return (
    <Icone {...props}>
      <path d="m6 4 1.5 1.5L9 4l1.5 1.5L12 4l1.5 1.5L15 4l1.5 1.5L18 4" />
      <path d="m6 20 1.5-1.5L9 20l1.5-1.5L12 20l1.5-1.5L15 20l1.5-1.5L18 20" />
      <path d="M7 6.5 6.5 17.5M17 6.5l.5 11" />
      <circle cx="12" cy="12" r="2.5" />
    </Icone>
  );
}

/** Lata de conserva. */
export function IconeLata(props) {
  return (
    <Icone {...props}>
      <ellipse cx="12" cy="6" rx="6.5" ry="2.5" />
      <path d="M5.5 6v12c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V6" />
      <path d="M5.5 11c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5" />
    </Icone>
  );
}

/** Duas linguiças emendadas. */
export function IconeLinguica(props) {
  return (
    <Icone {...props}>
      <rect x="2.5" y="10" width="9.5" height="5.5" rx="2.75" transform="rotate(14 7.25 12.75)" />
      <rect x="12" y="10" width="9.5" height="5.5" rx="2.75" transform="rotate(-14 16.75 12.75)" />
    </Icone>
  );
}

/** Pacote de 5 kg (arroz, feijão, açúcar): a mercearia. */
export function IconePacote(props) {
  return (
    <Icone {...props}>
      <path d="M6 7.5 7.5 4h9L18 7.5V21H6V7.5Z" />
      <path d="M6 7.5h12" />
      <path d="M9 12h6v4.5H9z" />
    </Icone>
  );
}

/* ---------- Interface ---------- */

export function IconeBusca(props) {
  return (
    <Icone {...props}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
    </Icone>
  );
}

export function IconeVoltar(props) {
  return (
    <Icone {...props}>
      <path d="M11 5 4 12l7 7M4 12h16" />
    </Icone>
  );
}

export function IconeMais(props) {
  return (
    <Icone {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icone>
  );
}

export function IconeMenos(props) {
  return (
    <Icone {...props}>
      <path d="M5 12h14" />
    </Icone>
  );
}

export function IconeCerto(props) {
  return (
    <Icone {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Icone>
  );
}

export function IconeFechar(props) {
  return (
    <Icone {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icone>
  );
}

export function IconeSeta(props) {
  return (
    <Icone {...props}>
      <path d="m9 5 7 7-7 7" />
    </Icone>
  );
}

export function IconeLixeira(props) {
  return (
    <Icone {...props}>
      <path d="M4 6.5h16M9 6.5V3.5h6v3M6 6.5 7 21h10l1-14.5" />
    </Icone>
  );
}

export function IconePino(props) {
  return (
    <Icone {...props}>
      <path d="M12 21s-6.5-6.2-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.25" />
    </Icone>
  );
}

export function IconeMira(props) {
  return (
    <Icone {...props}>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
      <path d="M12 11.5v1" />
    </Icone>
  );
}

export function IconeAlerta(props) {
  return (
    <Icone {...props}>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9.5V14M12 16.5v1" />
    </Icone>
  );
}

export function IconeLapis(props) {
  return (
    <Icone {...props}>
      <path d="M4 20h4L19.5 8.5l-4-4L4 16v4Z" />
      <path d="m13 7 4 4" />
    </Icone>
  );
}

export function IconeSair(props) {
  return (
    <Icone {...props}>
      <path d="M10 4H5v16h5" />
      <path d="M15 8l4 4-4 4M19 12H9.5" />
    </Icone>
  );
}

export function IconeCelular(props) {
  return (
    <Icone {...props}>
      <path d="M7 2.5h10v19H7z" />
      <path d="M11 18.5h2" />
    </Icone>
  );
}

export function IconeRelogio(props) {
  return (
    <Icone {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Icone>
  );
}

/* Formas de pagamento (sem copiar logotipo de ninguém). */

export function IconeQrCode(props) {
  return (
    <Icone {...props}>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 19v1M20 14v1" />
    </Icone>
  );
}

export function IconeCartao(props) {
  return (
    <Icone {...props}>
      <path d="M2.5 5.5h19v13h-19z" />
      <path d="M2.5 9.5h19M6 15h4" />
    </Icone>
  );
}

export function IconeCedula(props) {
  return (
    <Icone {...props}>
      <path d="M2.5 6.5h19v11h-19z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M5.5 9.5v1M18.5 13.5v1" />
    </Icone>
  );
}

/* ---------- Marca ---------- */

/** O telhadinho do logo pintado na fachada. */
export function MarcaTelhado({ className = 'size-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" className="fill-laranja" />
      <path
        d="M6 19 16 10l10 9"
        fill="none"
        stroke="#171513"
        strokeWidth="4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
