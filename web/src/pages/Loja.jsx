import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Estrutura from '../components/Estrutura';
import ProdutoCard from '../components/ProdutoCard';
import ResumoSacola from '../components/ResumoSacola';
import MedidorEntrega from '../components/MedidorEntrega';
import Vitrine from '../components/Vitrine';
import PedidoAoVivo from '../components/PedidoAoVivo';
import { Botao, Erro, Esqueleto, Vazio } from '../components/ui';
import { IconeBusca, IconeFechar, IconePino, IconeSeta, IconeVoltar } from '../components/icones';
import { listarProdutos } from '../api/produtos';
import { useAuth } from '../context/AuthContext';
import { useSacola } from '../context/SacolaContext';
import { CATEGORIAS } from '../lib/catalogo';
import { dinheiro, primeiroNome } from '../lib/formato';

/** Busca sem ligar para acento nem maiúscula: "agua" acha "Água". */
function semAcento(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function saudacao(agora = new Date()) {
  const h = agora.getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Barra preta no pé da tela (celular) com o total e quanto falta pra entrega grátis. */
function BarraSacola() {
  const navigate = useNavigate();
  const { quantidade, subtotal } = useSacola();
  if (quantidade === 0) return null;
  return (
    <>
    {/* espaço para a barra não cobrir os últimos produtos */}
    <div className="h-20 lg:hidden" aria-hidden="true" />
    <div className="fixed inset-x-0 bottom-16 z-20 animate-subir px-3 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-[736px] items-center gap-3 rounded-[14px] bg-piche p-3 pl-4 shadow-[0_8px_24px_rgb(0_0_0/0.3)] ring-1 ring-white/10">
        <div className="min-w-0 flex-1">
          <MedidorEntrega escuro />
        </div>
        <button
          type="button"
          onClick={() => navigate('/carrinho')}
          className="shrink-0 rounded-[10px] bg-laranja px-3.5 py-2 text-left font-bold leading-tight text-[#171513] transition-transform active:scale-95"
        >
          <span className="block text-xs">
            Ver sacola ({quantidade})
          </span>
          <span key={subtotal} className="num block animate-aparecer font-letreiro text-[15px]">{dinheiro(subtotal)}</span>
        </button>
      </div>
    </div>
    </>
  );
}

function CarregandoProdutos() {
  return (
    <div className="space-y-8" aria-label="Carregando produtos">
      {[0, 1].map((i) => (
        <div key={i}>
          <Esqueleto className="mb-4 h-6 w-40" />
          <div className="flex gap-3 overflow-hidden lg:grid lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
            {[0, 1, 2, 3].map((j) => (
              <Esqueleto key={j} className="h-[290px] w-[152px] shrink-0 lg:w-auto" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Loja() {
  const { usuario } = useAuth();
  const { sincronizar } = useSacola();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [categoriaAtual, setCategoriaAtual] = useState(null);
  const [filtro, setFiltro] = useState(null); // categoria aberta em "Ver todos"
  const [barraVisivel, setBarraVisivel] = useState(false);
  const listaCategorias = useRef(null);
  const atalhos = useRef(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    listarProdutos()
      .then((lista) => {
        if (!ativo) return;
        setProdutos(lista);
        sincronizar(lista); // preço da sacola salva acompanha o catálogo atual
      })
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [tentativa, sincronizar]);

  const resultado = useMemo(() => {
    const q = semAcento(busca.trim());
    if (!q) return null;
    return produtos.filter((p) => semAcento(`${p.nome} ${p.descricao || ''}`).includes(q));
  }, [busca, produtos]);

  const prateleiras = useMemo(
    () =>
      CATEGORIAS.map((c) => ({ ...c, produtos: produtos.filter((p) => p.categoria === c.id) })).filter(
        (c) => c.produtos.length > 0,
      ),
    [produtos],
  );

  function irPara(id) {
    setFiltro(null);
    setCategoriaAtual(id);
    document.getElementById('prateleira-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // A barra de categorias acompanha a rolagem: acende a prateleira que está na tela,
  // como nos cardápios dos apps de entrega. Mede no máximo uma vez por quadro de animação.
  useEffect(() => {
    if (resultado || filtro || prateleiras.length === 0) return undefined;
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      // A prateleira conta como "na tela" quando o título passa logo abaixo da barra de categorias.
      const barra = listaCategorias.current?.parentElement;
      const limite = (barra ? barra.getBoundingClientRect().bottom : 120) + 80;
      let atual = null;
      for (const { id } of prateleiras) {
        const el = document.getElementById('prateleira-' + id);
        if (el && el.getBoundingClientRect().top - limite <= 0) atual = id;
      }
      setCategoriaAtual(atual);
    };
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => {
      window.removeEventListener('scroll', aoRolar);
      cancelAnimationFrame(quadro);
    };
  }, [prateleiras, resultado, filtro]);

  // A barrinha de categorias só desce do topo quando os atalhos grandes saem da tela.
  useEffect(() => {
    const alvo = atalhos.current;
    if (!alvo || typeof IntersectionObserver === 'undefined') return undefined;
    const topo = window.innerWidth >= 1024 ? 0 : 64;
    const observador = new IntersectionObserver(([e]) => setBarraVisivel(!e.isIntersecting), {
      rootMargin: `-${topo}px 0px 0px 0px`,
    });
    observador.observe(alvo);
    return () => observador.disconnect();
  }, [carregando, resultado, filtro]);

  // Leva o botão da categoria acesa para o começo da barra (no celular a barra rola de lado).
  useEffect(() => {
    const lista = listaCategorias.current;
    const botao = categoriaAtual && lista?.querySelector(`[data-categoria="${categoriaAtual}"]`);
    if (botao && lista.scrollWidth > lista.clientWidth) {
      lista.scrollTo({ left: botao.parentElement.offsetLeft - 16, behavior: 'smooth' });
    }
  }, [categoriaAtual]);

  const aberta = filtro && prateleiras.find((c) => c.id === filtro);

  return (
    <Estrutura lateral={<ResumoSacola naLateral />}>
      <PedidoAoVivo />

      <h1 className="text-2xl font-bold lg:text-[28px]">
        {saudacao()}, {primeiroNome(usuario?.nome)}
      </h1>
      <Link
        to="/perfil/editar"
        className="mb-4 mt-1 flex items-center gap-1.5 text-[15px] text-poeira hover:text-tinta"
        aria-label={`Entregar em ${usuario?.endereco}. Alterar endereço`}
      >
        <IconePino className="size-4 shrink-0 text-laranja-texto" />
        <span className="truncate">
          Entregar em <span className="font-bold text-tinta">{usuario?.endereco}</span>
        </span>
      </Link>

      <div className="relative">
        <IconeBusca className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-tinta" />
        <label htmlFor="busca" className="sr-only">
          Buscar produto
        </label>
        <input
          id="busca"
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cerveja, gelo, carvão..."
          className="h-12 w-full rounded-full border-2 border-transparent bg-papel pl-11 pr-11 text-[17px] shadow-[0_1px_2px_rgb(23_21_19/0.06)] placeholder:text-poeira focus:border-tinta focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {busca && (
          <button
            type="button"
            onClick={() => setBusca('')}
            className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center text-poeira"
            aria-label="Limpar busca"
          >
            <IconeFechar className="size-5" />
          </button>
        )}
      </div>

      {!resultado && !filtro && !carregando && !erro && (
        <>
          <Vitrine irPara={irPara} />

          {/* Atalhos grandes de categoria, como na tela inicial dos apps de entrega. */}
          <nav aria-label="Categorias" className="-mx-4 mt-6 lg:mx-0">
            <h2 className="mb-3 px-4 text-xl font-bold lg:px-0">O que você procura?</h2>
            <ul ref={atalhos} className="rolagem-lateral flex scroll-px-4 gap-1 px-3 lg:grid lg:grid-cols-8 lg:px-0">
              {prateleiras.map(({ id, nome, Icone }) => (
                <li key={id} className="w-[84px] shrink-0 snap-start lg:w-auto">
                  <button
                    type="button"
                    onClick={() => irPara(id)}
                    className="group flex w-full flex-col items-center gap-1.5 rounded-[14px] p-1 text-center"
                  >
                    <span className="grid size-16 place-items-center rounded-[20px] bg-laranja-claro text-tinta transition-[transform,background-color] duration-150 group-hover:bg-laranja group-active:scale-90">
                      <Icone className="size-8" />
                    </span>
                    <span className="text-[13px] font-bold leading-tight">{nome}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      {/* Barrinha que desce do topo ao rolar e acende a prateleira da vez. */}
      {!resultado && !filtro && (
        <nav
          aria-label="Ir para a categoria"
          aria-hidden={!barraVisivel}
          className={`fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-20 border-b border-linha bg-papel/95 py-2 shadow-[0_4px_16px_rgb(0_0_0/0.06)] backdrop-blur transition-[transform,opacity] duration-200 lg:left-60 lg:right-80 lg:top-0 ${
            barraVisivel ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <ul
            ref={listaCategorias}
            className="rolagem-lateral mx-auto flex max-w-[760px] scroll-px-4 gap-2 px-4 lg:max-w-none lg:px-8"
          >
            {prateleiras.map(({ id, nome, Icone }) => {
              const acesa = categoriaAtual === id;
              return (
                <li key={id} className="shrink-0">
                  <button
                    type="button"
                    tabIndex={barraVisivel ? 0 : -1}
                    data-categoria={id}
                    aria-current={acesa ? 'true' : undefined}
                    onClick={() => irPara(id)}
                    className={`flex h-9 items-center gap-1.5 rounded-full pl-2.5 pr-3.5 text-sm font-bold transition-[background-color,color,transform] duration-200 active:scale-95 ${
                      acesa ? 'bg-tinta text-papel' : 'bg-chao text-tinta hover:bg-laranja-claro'
                    }`}
                  >
                    <Icone className="size-[18px]" />
                    {nome}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="mt-6">
        {carregando && <CarregandoProdutos />}

        {!carregando && erro && (
          <div className="space-y-4">
            <Erro>{erro}</Erro>
            <div className="max-w-60">
              <Botao variante="contorno" onClick={() => setTentativa((n) => n + 1)}>
                Tentar de novo
              </Botao>
            </div>
          </div>
        )}

        {!carregando && !erro && resultado && (
          resultado.length ? (
            <>
              <p className="mb-4 text-poeira" aria-live="polite">
                {resultado.length} {resultado.length === 1 ? 'produto' : 'produtos'} para "{busca.trim()}"
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
                {resultado.map((p) => (
                  <ProdutoCard key={p.id} produto={p} />
                ))}
              </div>
            </>
          ) : (
            <Vazio Icone={IconeBusca} titulo={`Nada encontrado para "${busca.trim()}"`}>
              Tente o nome do produto, como "guaraná" ou "carvão".
            </Vazio>
          )
        )}

        {/* "Ver todos" de uma prateleira: a categoria inteira em grade. */}
        {!carregando && !erro && !resultado && aberta && (
          <section aria-labelledby="titulo-aberta" className="animate-subir">
            <button
              type="button"
              onClick={() => setFiltro(null)}
              className="mb-3 inline-flex items-center gap-1.5 text-[15px] font-bold text-laranja-texto"
            >
              <IconeVoltar className="size-4" />
              Todas as categorias
            </button>
            <h2 id="titulo-aberta" className="mb-4 flex items-center gap-2.5 text-2xl font-bold">
              <span className="grid size-10 place-items-center rounded-[12px] bg-laranja-claro">
                <aberta.Icone className="size-6" />
              </span>
              {aberta.nome}
              <span className="num text-base font-normal text-poeira">{aberta.produtos.length}</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
              {aberta.produtos.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          </section>
        )}

        {!carregando && !erro && !resultado && !aberta && (
          <div className="space-y-8">
            {prateleiras.map(({ id, nome, Icone, produtos: itens }) => (
              <section
                key={id}
                id={'prateleira-' + id}
                aria-labelledby={'titulo-' + id}
                className="scroll-mt-[calc(8rem+env(safe-area-inset-top))] lg:scroll-mt-16"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 id={'titulo-' + id} className="flex items-center gap-2.5 text-xl font-bold">
                    <span className="grid size-9 place-items-center rounded-[11px] bg-laranja-claro">
                      <Icone className="size-5" />
                    </span>
                    {nome}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setFiltro(id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex shrink-0 items-center gap-0.5 text-[15px] font-bold text-laranja-texto lg:hidden"
                  >
                    Ver todos ({itens.length})
                    <IconeSeta className="size-4" />
                  </button>
                </div>
                <div className="rolagem-lateral -mx-4 flex scroll-px-4 gap-3 px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] lg:overflow-visible lg:px-0">
                  {itens.map((p) => (
                    <ProdutoCard key={p.id} produto={p} emLinha />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <BarraSacola />
    </Estrutura>
  );
}
