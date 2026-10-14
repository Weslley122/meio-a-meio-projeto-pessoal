import { useEffect, useRef, useState } from 'react';
import Estrutura from '../components/Estrutura';
import { Botao, Vazio } from '../components/ui';
import { IconeAlerta, IconeLoja, IconeMira, IconeMoto, IconePino } from '../components/icones';
import { obterLocalizacaoLoja } from '../api/loja';
import { calcularRota } from '../api/rota';
import { km } from '../lib/formato';

/**
 * Pede o GPS do navegador. Alguns navegadores nunca respondem se a pergunta de permissão
 * fica aberta, e o timeout nativo não cobre esse caso: por isso o "vigia" de 15 s.
 */
export function pedirPosicao({ precisa = false } = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Este navegador não tem GPS.'));
      return;
    }
    let respondeu = false;
    const vigia = setTimeout(() => {
      if (!respondeu) {
        respondeu = true;
        reject(new Error('O GPS não respondeu. Confira se a localização está ligada.'));
      }
    }, 15000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (respondeu) return;
        respondeu = true;
        clearTimeout(vigia);
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      (falha) => {
        if (respondeu) return;
        respondeu = true;
        clearTimeout(vigia);
        reject(
          new Error(
            falha.code === 1
              ? 'A localização está bloqueada para este site. Libere nas configurações do navegador.'
              : 'Não foi possível descobrir onde você está agora.',
          ),
        );
      },
      { enableHighAccuracy: precisa, timeout: 10000, maximumAge: precisa ? 0 : 60000 },
    );
  });
}

/** Desenho do trajeto: loja, moto no meio, você. Ilustrativo, não é mapa. */
function Trajeto() {
  return (
    <div className="flex items-center gap-2 rounded-[14px] bg-piche px-5 py-6 text-piche-texto">
      <div className="text-center">
        <IconeLoja className="mx-auto size-8 text-laranja" />
        <p className="mt-1.5 text-xs font-bold">Loja</p>
      </div>
      <div className="relative h-0.5 flex-1 bg-[repeating-linear-gradient(90deg,var(--laranja)_0_8px,transparent_8px_14px)]">
        <IconeMoto className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 bg-piche px-1 text-piche-texto" />
      </div>
      <div className="text-center">
        <IconePino className="mx-auto size-8 text-laranja" />
        <p className="mt-1.5 text-xs font-bold">Você</p>
      </div>
    </div>
  );
}

export default function Rota() {
  const [loja, setLoja] = useState(null); // null = ainda carregando
  const [estado, setEstado] = useState('parado'); // parado | buscando | pronto | erro
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    obterLocalizacaoLoja()
      .then((r) => montado.current && setLoja(r))
      .catch(() => montado.current && setLoja({ configurada: false }));
    return () => {
      montado.current = false;
    };
  }, []);

  async function calcular() {
    setEstado('buscando');
    setErro('');
    try {
      const posicao = await pedirPosicao();
      const r = await calcularRota(posicao);
      if (!montado.current) return;
      setResultado(r);
      setEstado('pronto');
    } catch (e) {
      if (!montado.current) return;
      setErro(e.message);
      setEstado('erro');
    }
  }

  return (
    <Estrutura titulo="Rota da entrega" largura="estreita">
      {loja === null && <p className="text-poeira">Carregando...</p>}

      {loja && !loja.configurada && (
        <Vazio Icone={IconeLoja} titulo="A loja ainda não marcou onde fica.">
          Sem esse ponto não dá para calcular a distância. O Carlinho define isso no Painel.
        </Vazio>
      )}

      {loja?.configurada && (
        <div className="space-y-5">
          <p className="text-[17px]">
            Veja a distância da loja até onde você está agora e quanto tempo a moto leva, em média.
          </p>

          {estado === 'pronto' && resultado && (
            <>
              <Trajeto />
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-[14px] border border-linha bg-papel p-4">
                  <dt className="text-sm text-poeira">Distância</dt>
                  <dd className="num mt-1 font-letreiro text-[28px] leading-none">{km(resultado.distanciaKm)}</dd>
                </div>
                <div className="rounded-[14px] border border-linha bg-papel p-4">
                  <dt className="text-sm text-poeira">Tempo da moto</dt>
                  <dd className="num mt-1 font-letreiro text-[28px] leading-none">{resultado.tempoEstimadoMin} min</dd>
                </div>
              </dl>
              <p className="text-sm text-poeira">
                Conta feita pela distância em linha reta, com um acréscimo pelas curvas das ruas. Chuva e trânsito mudam o
                tempo real.
              </p>
            </>
          )}

          {estado === 'erro' && (
            <div className="flex items-start gap-3 rounded-[14px] bg-erro-claro p-4 text-erro">
              <IconeAlerta className="mt-0.5 size-5 shrink-0" />
              <p className="font-bold">{erro}</p>
            </div>
          )}

          <Botao
            variante={estado === 'pronto' ? 'contorno' : 'primario'}
            onClick={calcular}
            disabled={estado === 'buscando'}
          >
            <IconeMira className="size-5" />
            {estado === 'buscando'
              ? 'Procurando você...'
              : estado === 'pronto'
                ? 'Calcular de novo'
                : estado === 'erro'
                  ? 'Tentar de novo'
                  : 'Usar minha localização'}
          </Botao>
        </div>
      )}
    </Estrutura>
  );
}
