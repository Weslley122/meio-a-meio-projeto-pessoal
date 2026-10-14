import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSacola } from '../context/SacolaContext';
import { usePedidoAtivo } from '../context/PedidoAtivoContext';
import Marca from './Marca';
import { PontoAoVivo } from './ui';
import { IconeComanda, IconeLoja, IconeMoto, IconePessoa, IconePrancheta, IconeSacolinha, IconeVoltar } from './icones';
import { primeiroNome } from '../lib/formato';

const ABAS = [
  { para: '/home', nome: 'Loja', Icone: IconeLoja },
  { para: '/pedidos', nome: 'Pedidos', Icone: IconeComanda, tambem: '/pedido/' },
  { para: '/rota', nome: 'Rota', Icone: IconeMoto },
  { para: '/perfil', nome: 'Perfil', Icone: IconePessoa },
];
const ABA_DONO = { para: '/admin', nome: 'Painel', Icone: IconePrancheta };

function useAbas() {
  const { isAdmin } = useAuth();
  return isAdmin ? [...ABAS, ABA_DONO] : ABAS;
}

/** A aba "Pedidos" continua acesa dentro de um pedido (/pedido/3), e "Perfil" dentro de /perfil/editar. */
function estaAtiva(caminho, { para, tambem }) {
  return caminho === para || caminho.startsWith(para + '/') || (tambem && caminho.startsWith(tambem));
}

function BotaoSacola() {
  const { quantidade } = useSacola();
  return (
    <Link
      to="/carrinho"
      className="relative grid size-11 place-items-center rounded-[10px] text-piche-texto transition-transform hover:bg-white/10 active:scale-90"
      aria-label={quantidade ? `Sacola, ${quantidade} ${quantidade === 1 ? 'item' : 'itens'}` : 'Sacola vazia'}
    >
      <IconeSacolinha className="size-6" />
      {quantidade > 0 && (
        // key muda a cada item: o React recria o selo e a animação "pulo" roda de novo.
        <span
          key={quantidade}
          className="num absolute right-0.5 top-0.5 grid h-5 min-w-5 animate-pulo place-items-center rounded-full bg-laranja px-1 text-xs font-bold text-[#171513]"
        >
          {quantidade}
        </span>
      )}
    </Link>
  );
}

/** Barra preta do topo, só no celular/tablet. No computador quem faz esse papel é a coluna da esquerda. */
function Topo({ titulo, voltar }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-piche pt-[env(safe-area-inset-top)] lg:hidden">
      <div className="mx-auto flex h-16 max-w-[760px] items-center gap-2 px-4">
        {voltar ? (
          <>
            <button
              type="button"
              onClick={() => (typeof voltar === 'string' ? navigate(voltar) : navigate(-1))}
              className="-ml-2 grid size-11 place-items-center rounded-[10px] text-piche-texto transition-transform hover:bg-white/10 active:scale-90"
              aria-label="Voltar"
            >
              <IconeVoltar />
            </button>
            <h1 className="truncate text-lg font-bold text-piche-texto">{titulo}</h1>
          </>
        ) : (
          <Link to="/home" aria-label="Meio a Meio do Carlinho, ir para a loja">
            <Marca />
          </Link>
        )}
        <div className="ml-auto">
          <BotaoSacola />
        </div>
      </div>
    </header>
  );
}

/**
 * Abas do pé da tela no celular: barra branca, como nos apps de compra.
 * Aba ativa: pílula laranja atrás do ícone (abre de dentro pra fora) e o ícone dá um pulinho.
 * Toque: o ícone encolhe enquanto o dedo está em cima, como botão físico.
 * Pedido em andamento: ponto laranja "ao vivo" na aba Pedidos.
 */
function Abas() {
  const abas = useAbas();
  const { pathname } = useLocation();
  const { ativo } = usePedidoAtivo();

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-linha bg-papel/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(0_0_0/0.05)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-[760px] px-1">
        {abas.map((aba) => {
          const { para, nome, Icone } = aba;
          const ativa = estaAtiva(pathname, aba);
          const aoVivo = para === '/pedidos' && ativo;
          return (
            <li key={para} className="flex-1">
              <Link
                to={para}
                aria-current={ativa ? 'page' : undefined}
                aria-label={aoVivo ? `${nome}, pedido em andamento` : undefined}
                className="group flex h-full flex-col items-center justify-center gap-1 [-webkit-tap-highlight-color:transparent]"
              >
                <span className="relative grid h-8 w-14 place-items-center transition-transform duration-150 group-active:scale-90">
                  {ativa && <span aria-hidden="true" className="absolute inset-0 animate-pilula rounded-full bg-laranja" />}
                  <Icone
                    className={`relative size-[22px] ${
                      ativa ? 'animate-pulo text-[#171513]' : 'text-poeira group-hover:text-tinta'
                    }`}
                  />
                  {aoVivo && !ativa && (
                    <span className="absolute right-3 top-0.5">
                      <PontoAoVivo anel="ring-papel" />
                    </span>
                  )}
                </span>
                <span
                  className={`text-[11px] font-bold leading-none ${ativa ? 'text-tinta' : 'text-poeira'}`}
                >
                  {nome}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Coluna preta da esquerda no computador. */
function Lateral() {
  const abas = useAbas();
  const { usuario } = useAuth();
  const { quantidade } = useSacola();
  const { ativo } = usePedidoAtivo();
  const { pathname } = useLocation();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-piche px-4 py-6 lg:flex">
      <Link to="/home" className="px-2" aria-label="Meio a Meio do Carlinho, ir para a loja">
        <Marca />
      </Link>
      <nav aria-label="Principal" className="mt-10">
        <ul className="space-y-1">
          {[...abas, { para: '/carrinho', nome: 'Sacola', Icone: IconeSacolinha, conta: quantidade }].map((aba) => {
            const { para, nome, Icone, conta } = aba;
            const ativa = estaAtiva(pathname, aba);
            return (
              <li key={para}>
                <Link
                  to={para}
                  aria-current={ativa ? 'page' : undefined}
                  className={`group flex h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-bold transition-colors ${
                    ativa ? 'bg-laranja text-[#171513]' : 'text-piche-poeira hover:bg-white/5 hover:text-piche-texto'
                  }`}
                >
                  <Icone className="size-5 transition-transform group-active:scale-90" />
                  {nome}
                  {para === '/pedidos' && ativo && <PontoAoVivo className="ml-auto" />}
                  {conta > 0 && (
                    <span
                      key={conta}
                      className={`num ml-auto animate-pulo rounded-full px-2 text-xs leading-5 ${
                        ativa ? 'bg-[#171513] text-laranja' : 'bg-laranja text-[#171513]'
                      }`}
                    >
                      {conta}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {usuario && (
        <p className="mt-auto px-3 text-sm text-piche-poeira">
          Conectado como <span className="font-bold text-piche-texto">{primeiroNome(usuario.nome)}</span>
        </p>
      )}
    </aside>
  );
}

/**
 * Esqueleto de toda tela logada.
 *   titulo   - nome da tela (no celular vai na barra preta quando há "voltar")
 *   voltar   - true volta uma página; uma string vai pra essa rota
 *   lateral  - conteúdo da coluna direita no computador (a sacola, na loja)
 *   largura  - "estreita" para formulários e telas de leitura
 */
export default function Estrutura({ titulo, voltar, lateral, largura = 'normal', semAbas = false, children }) {
  const navigate = useNavigate();
  const max = largura === 'estreita' ? 'max-w-[560px]' : 'max-w-[760px] lg:max-w-none';

  return (
    <div className="min-h-dvh lg:pl-60">
      <Topo titulo={titulo} voltar={voltar} />
      <Lateral />

      <div className={lateral ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_320px]' : ''}>
        <main className={`mx-auto w-full px-4 pt-5 lg:px-8 lg:pt-10 ${max} ${semAbas ? 'pb-10' : 'pb-28 lg:pb-12'}`}>
          {titulo && (
            <div className={`mb-6 items-center gap-3 ${voltar ? 'hidden lg:flex' : 'flex'}`}>
              {voltar && (
                <button
                  type="button"
                  onClick={() => (typeof voltar === 'string' ? navigate(voltar) : navigate(-1))}
                  className="-ml-2 grid size-10 place-items-center rounded-[10px] hover:bg-tinta/5"
                  aria-label="Voltar"
                >
                  <IconeVoltar />
                </button>
              )}
              <h1 className="text-2xl font-bold lg:text-[28px]">{titulo}</h1>
            </div>
          )}
          {children}
        </main>

        {lateral && (
          <aside className="hidden border-l border-linha bg-papel lg:block">
            <div className="sticky top-0 max-h-dvh overflow-y-auto p-6">{lateral}</div>
          </aside>
        )}
      </div>

      {!semAbas && <Abas />}
    </div>
  );
}
