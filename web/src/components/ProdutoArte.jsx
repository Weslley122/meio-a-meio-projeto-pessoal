/*
  Ilustração de cada produto, montada a partir do tipo de embalagem e das cores que o back-end
  guarda (arteTipo, arteCor, arteFaixa). Traço preto e cor chapada, no mesmo desenho dos ícones.
  Não usamos foto de marca: o depósito não tem direito de imagem sobre os rótulos.
*/

const TRACO = '#171513';
const ARO = '#D2CFC8';

function Sombra({ cx = 50, cy = 90, rx = 24 }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="4" fill="#000" opacity=".12" />;
}

function Lata({ cor, faixa }) {
  return (
    <>
      <Sombra cy={86} rx={22} />
      <rect x="31" y="18" width="38" height="64" rx="6" fill={cor} />
      <rect x="31" y="42" width="38" height="17" fill={faixa} />
      <rect x="37" y="25" width="4" height="50" fill="#fff" opacity=".35" />
      <rect x="31" y="18" width="38" height="64" rx="6" fill="none" stroke={TRACO} strokeWidth="2.5" />
      <ellipse cx="50" cy="18" rx="19" ry="4.5" fill={ARO} stroke={TRACO} strokeWidth="2.5" />
    </>
  );
}

function Garrafa({ cor, faixa, pequena }) {
  const largura = pequena ? 28 : 34;
  const x = 50 - largura / 2;
  const ombro = pequena ? 40 : 30;
  const fundo = 88;
  const contorno =
    `M45 11 H55 V${ombro - 8} L${x + largura} ${ombro} V${fundo - 5} ` +
    `Q${x + largura} ${fundo} ${x + largura - 5} ${fundo} H${x + 5} Q${x} ${fundo} ${x} ${fundo - 5} ` +
    `V${ombro} L45 ${ombro - 8} Z`;
  const alturaCorpo = fundo - ombro;
  return (
    <>
      <Sombra cy={91} rx={largura * 0.7} />
      <path d={contorno} fill={cor} />
      <rect x={x} y={ombro + alturaCorpo * 0.3} width={largura} height={alturaCorpo * 0.32} fill={faixa} />
      <rect x={x + 5} y={ombro + 4} width="4" height={alturaCorpo - 12} fill="#fff" opacity=".3" />
      <path d={contorno} fill="none" stroke={TRACO} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="43.5" y="6" width="13" height="6" rx="1.5" fill={faixa} stroke={TRACO} strokeWidth="2.5" />
    </>
  );
}

function Conserva({ cor }) {
  return (
    <>
      <Sombra cy={84} rx={28} />
      <path d="M23 30 V76 A27 6 0 0 0 77 76 V30 Z" fill={cor} />
      <rect x="23" y="44" width="54" height="18" fill="#fff" opacity=".8" />
      <rect x="28" y="36" width="4" height="36" fill="#fff" opacity=".3" />
      <path d="M23 30 V76 A27 6 0 0 0 77 76 V30" fill="none" stroke={TRACO} strokeWidth="2.5" />
      <ellipse cx="50" cy="30" rx="27" ry="6" fill={ARO} stroke={TRACO} strokeWidth="2.5" />
    </>
  );
}

function Pacote({ cor }) {
  const corpo = 'M30 22 H70 L73 50 L70 80 H30 L27 50 Z';
  return (
    <>
      <Sombra cy={88} rx={26} />
      <path d={corpo} fill={cor} stroke={TRACO} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 22 l4 -5 4 5 4 -5 4 5 4 -5 4 5 4 -5 4 5 4 -5 4 5" fill="none" stroke={TRACO} strokeWidth="2.5" />
      <path d="M28 80 l4 5 4 -5 4 5 4 -5 4 5 4 -5 4 5 4 -5 4 5 4 -5" fill="none" stroke={TRACO} strokeWidth="2.5" />
      <ellipse cx="50" cy="52" rx="12" ry="10" fill="#fff" opacity=".45" />
      <rect x="34" y="28" width="4" height="44" fill="#fff" opacity=".25" />
    </>
  );
}

function GeloSaco() {
  return (
    <>
      <Sombra cy={89} rx={27} />
      <path d="M26 26 H74 L70 84 H30 Z" fill="#CFE6F2" stroke={TRACO} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 26 L50 12 L60 26" fill="none" stroke={TRACO} strokeWidth="2.5" />
      {[[36, 40], [53, 46], [38, 60], [55, 64]].map(([x, y]) => (
        <rect key={x + '-' + y} x={x} y={y} width="13" height="13" rx="2" fill="#fff" stroke={TRACO} strokeWidth="2" />
      ))}
    </>
  );
}

function GeloBarra() {
  return (
    <>
      <Sombra cy={84} rx={30} />
      <path d="M20 40 L32 28 H82 L82 70 L70 82 H20 Z" fill="#CFE6F2" stroke={TRACO} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 40 H70 V82 M70 40 L82 28" fill="none" stroke={TRACO} strokeWidth="2.5" />
      <rect x="27" y="47" width="6" height="28" fill="#fff" opacity=".7" />
    </>
  );
}

function Bandeja({ cor }) {
  return (
    <>
      <Sombra cy={82} rx={32} />
      <path d="M16 54 H84 L78 78 H22 Z" fill="#F4F3EF" stroke={TRACO} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="50" cy="52" rx="30" ry="13" fill={cor} stroke={TRACO} strokeWidth="2.5" />
      <path d="M30 47 Q40 42 52 44" fill="none" stroke="#fff" strokeWidth="3" opacity=".5" />
      <path d="M16 54 H84" stroke={TRACO} strokeWidth="2.5" />
    </>
  );
}

function Copos() {
  return (
    <>
      <Sombra cy={88} rx={22} />
      <path d="M32 22 H68 L61 84 H39 Z" fill="#FAFAF8" stroke={TRACO} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M33 31 H67 M34 40 H66" stroke={TRACO} strokeWidth="2" />
      <rect x="37" y="54" width="26" height="12" fill="var(--color-laranja, #FF6A1A)" stroke={TRACO} strokeWidth="2" />
    </>
  );
}

export default function ProdutoArte({ produto, className = 'size-full' }) {
  const { arteTipo, arteCor, arteFaixa } = produto;
  const cor = arteCor || '#C9A063';
  const faixa = arteFaixa || '#8B5A3C';

  let desenho;
  switch (arteTipo) {
    case 'can': desenho = <Lata cor={cor} faixa={faixa} />; break;
    case 'bottle': desenho = <Garrafa cor={cor} faixa={faixa} />; break;
    case 'bottle-small': desenho = <Garrafa cor={cor} faixa={faixa} pequena />; break;
    case 'tin': desenho = <Conserva cor={cor} />; break;
    case 'bag': desenho = <Pacote cor={cor} />; break;
    case 'ice': desenho = <GeloSaco />; break;
    case 'icebar': desenho = <GeloBarra />; break;
    case 'tray': desenho = <Bandeja cor={cor} />; break;
    case 'cups': desenho = <Copos />; break;
    default: desenho = <Lata cor={cor} faixa={faixa} />;
  }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      {desenho}
    </svg>
  );
}
