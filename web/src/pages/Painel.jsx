import { useRef, useState } from 'react';
import Estrutura from '../components/Estrutura';
import Situacao from '../components/Situacao';
import { Botao, Campo, Erro, Esqueleto, Etiqueta, Vazio } from '../components/ui';
import { IconeCelular, IconeComanda, IconeLoja, IconeMira, IconePino } from '../components/icones';
import { atualizarStatusPedido, todosPedidos } from '../api/pedidos';
import { atualizarLocalizacaoLoja, obterLocalizacaoLoja } from '../api/loja';
import { useAviso } from '../context/AvisoContext';
import { useRepetir } from '../lib/useRepetir';
import { ETAPAS, ULTIMA_ETAPA } from '../lib/catalogo';
import { dataHora, dinheiro, pagamento, soDigitos, telefone } from '../lib/formato';
import { pedirPosicao } from './Rota';

/** "-1.45502, -48.50237" (formato que o Google Maps copia) -> { latitude, longitude } ou null. */
export function lerCoordenadas(texto) {
  const partes = texto.split(/[,;\s]+/).filter(Boolean).map(Number);
  if (partes.length !== 2) return null;
  const [latitude, longitude] = partes;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

function PontoDaLoja() {
  const avisar = useAviso();
  const [loja, setLoja] = useState(null);
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  useRepetir(() => obterLocalizacaoLoja().then(setLoja).catch(() => setLoja({ configurada: false })), 60000);

  async function salvar(coords) {
    await atualizarLocalizacaoLoja(coords);
    setLoja({ configurada: true, ...coords });
    setAberto(false);
    setTexto('');
    avisar('Ponto da loja salvo.');
  }

  async function usarGps() {
    setErro('');
    setOcupado(true);
    try {
      await salvar(await pedirPosicao({ precisa: true }));
    } catch (e) {
      setErro(e.message + ' Você pode digitar as coordenadas.');
      setAberto(true);
    } finally {
      setOcupado(false);
    }
  }

  async function salvarDigitado(e) {
    e.preventDefault();
    const coords = lerCoordenadas(texto);
    if (!coords) {
      setErro('Use o formato latitude, longitude. Exemplo: -1.45502, -48.50237');
      return;
    }
    setErro('');
    setOcupado(true);
    try {
      await salvar(coords);
    } catch (err) {
      setErro(err.message);
    } finally {
      setOcupado(false);
    }
  }

  const definido = loja?.configurada;

  return (
    <section className="rounded-[14px] border border-linha bg-papel p-4">
      <div className="flex items-start gap-3">
        <IconeLoja className="mt-0.5 size-6 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">Ponto da loja</h2>
          <p className="text-[15px] text-poeira">
            {loja === null
              ? 'Conferindo...'
              : definido
                ? `Definido em ${loja.latitude.toFixed(5)}, ${loja.longitude.toFixed(5)}. É daqui que a aba Rota mede a distância.`
                : 'Ainda não definido. Sem ele, os clientes não veem a distância na aba Rota.'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Botao variante={definido ? 'contorno' : 'primario'} onClick={usarGps} disabled={ocupado}>
          <IconeMira className="size-5" />
          {ocupado ? 'Procurando...' : 'Usar o GPS daqui'}
        </Botao>
        <Botao variante="contorno" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}>
          <IconePino className="size-5" />
          Digitar coordenadas
        </Botao>
      </div>

      {erro && <div className="mt-3"><Erro>{erro}</Erro></div>}

      {aberto && (
        <form onSubmit={salvarDigitado} className="mt-4 space-y-3 border-t border-linha pt-4">
          <Campo
            rotulo="Latitude, longitude"
            dica="No Google Maps, toque e segure em cima da loja e copie os números que aparecem."
            inputMode="decimal"
            placeholder="-1.45502, -48.50237"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <Botao type="submit" variante="escuro" disabled={ocupado || !texto.trim()}>
            Salvar ponto
          </Botao>
        </form>
      )}
    </section>
  );
}

function CartaoPedido({ pedido, onAvancar, avancando }) {
  const proxima = ETAPAS[pedido.status + 1];
  const zap = soDigitos(pedido.clienteTelefone);
  return (
    <article className="rounded-[14px] border border-linha bg-papel p-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="num font-letreiro text-lg">Nº {pedido.id}</span>
        <Situacao status={pedido.status} />
        <span className="ml-auto text-sm text-poeira">{dataHora(pedido.criadoEm)}</span>
      </header>

      <div className="mt-3">
        <p className="font-bold">{pedido.clienteNome}</p>
        <p className="mt-0.5 flex items-start gap-1.5 text-[15px]">
          <IconePino className="mt-0.5 size-4 shrink-0 text-poeira" />
          {pedido.clienteEndereco}
        </p>
        {zap && (
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[15px]">
            <IconeCelular className="size-4 text-poeira" />
            <span className="num">{telefone(pedido.clienteTelefone)}</span>
            <a href={`tel:${zap}`} className="font-bold text-laranja-texto underline decoration-2 underline-offset-4">
              Ligar
            </a>
            <a
              href={`https://wa.me/55${zap}`}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-laranja-texto underline decoration-2 underline-offset-4"
            >
              WhatsApp
            </a>
          </p>
        )}
      </div>

      <ul className="mt-3 space-y-1 rounded-[10px] bg-chao/70 p-3 text-[15px]">
        {pedido.itens.map((it) => (
          <li key={it.produtoId}>
            <span className="num font-bold">{it.quantidade}×</span> {it.nome}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[15px] text-poeira">{pagamento(pedido.formaPagamento)}</span>
        <Etiqueta valor={pedido.total} tamanho="g" />
      </div>

      {proxima && (
        <Botao className="mt-4" variante={pedido.status === 0 ? 'primario' : 'escuro'} onClick={onAvancar} disabled={avancando}>
          {avancando ? 'Salvando...' : `Marcar como ${proxima.nome.toLowerCase()}`}
        </Botao>
      )}
    </article>
  );
}

export default function Painel() {
  const avisar = useAviso();
  const [pedidos, setPedidos] = useState(null);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState('abertos');
  const [avancando, setAvancando] = useState(null);

  // Guarda os pedidos já vistos para avisar quando chegar um novo (sem recarregar a página).
  const conhecidos = useRef(null);

  const carregar = () =>
    todosPedidos()
      .then((lista) => {
        if (conhecidos.current) {
          const novos = lista.filter((p) => !conhecidos.current.has(p.id));
          if (novos.length === 1) avisar(`Pedido novo: Nº ${novos[0].id}, de ${novos[0].clienteNome}.`);
          if (novos.length > 1) avisar(`${novos.length} pedidos novos chegaram.`);
          if (novos.length) {
            try {
              navigator.vibrate?.([10, 60, 10]);
            } catch {
              /* sem vibração */
            }
          }
        }
        conhecidos.current = new Set(lista.map((p) => p.id));
        setPedidos(lista);
        setErro('');
      })
      .catch((e) => setErro(e.message));

  // Pedido novo aparece sozinho, sem o Carlinho precisar recarregar.
  useRepetir(carregar, 15000);

  async function avancar(pedido) {
    setAvancando(pedido.id);
    try {
      await atualizarStatusPedido(pedido.id, pedido.status + 1);
      avisar(`Pedido Nº ${pedido.id}: ${ETAPAS[pedido.status + 1].nome.toLowerCase()}.`);
      await carregar();
    } catch (e) {
      avisar(e.message, 'erro');
    } finally {
      setAvancando(null);
    }
  }

  const abertos = (pedidos || []).filter((p) => p.status < ULTIMA_ETAPA).sort((a, b) => a.id - b.id);
  const entregues = (pedidos || []).filter((p) => p.status >= ULTIMA_ETAPA).sort((a, b) => b.id - a.id);
  const vendido = entregues.reduce((s, p) => s + Number(p.total), 0);
  const lista = aba === 'abertos' ? abertos : entregues;

  return (
    <Estrutura titulo="Painel da loja">
      <div className="space-y-5">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {[
            ['Em aberto', abertos.length],
            ['Entregues', entregues.length],
            ['Vendido', dinheiro(vendido)], // soma dos pedidos entregues
          ].map(([rotulo, valor]) => (
            <div
              key={rotulo}
              className={`rounded-[14px] border border-linha bg-papel p-3 sm:p-4 ${rotulo === 'Vendido' ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              <dt className="text-sm text-poeira">{rotulo}</dt>
              <dd className="num mt-1 truncate font-letreiro text-lg sm:text-2xl">{pedidos ? valor : '...'}</dd>
            </div>
          ))}
        </dl>

        <PontoDaLoja />

        <div className="flex rounded-[10px] bg-papel p-1" role="tablist" aria-label="Filtrar pedidos">
          {[
            ['abertos', `Em aberto (${abertos.length})`],
            ['entregues', `Entregues (${entregues.length})`],
          ].map(([id, rotulo]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => setAba(id)}
              className={`flex-1 rounded-[8px] py-2.5 text-[15px] font-bold ${aba === id ? 'bg-tinta text-chao' : 'text-poeira'}`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <Erro>{erro}</Erro>

        {!pedidos && !erro && <Esqueleto className="h-60" />}

        {pedidos && lista.length === 0 && (
          <Vazio Icone={IconeComanda} titulo={aba === 'abertos' ? 'Nenhum pedido esperando.' : 'Nenhum pedido entregue ainda.'}>
            {aba === 'abertos' ? 'Pedidos novos aparecem aqui sozinhos, a cada 15 segundos.' : null}
          </Vazio>
        )}

        <div className="grid gap-3 xl:grid-cols-2">
          {lista.map((p) => (
            <CartaoPedido key={p.id} pedido={p} onAvancar={() => avancar(p)} avancando={avancando === p.id} />
          ))}
        </div>
      </div>
    </Estrutura>
  );
}
