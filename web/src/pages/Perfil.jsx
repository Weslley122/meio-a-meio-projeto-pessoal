import { useNavigate } from 'react-router-dom';
import Estrutura from '../components/Estrutura';
import { Botao } from '../components/ui';
import { IconeCelular, IconeLapis, IconePino, IconeSair } from '../components/icones';
import { useAuth } from '../context/AuthContext';
import { useSacola } from '../context/SacolaContext';
import { iniciais, telefone } from '../lib/formato';

export default function Perfil() {
  const navigate = useNavigate();
  const { usuario, logout, isAdmin } = useAuth();
  const { esvaziar } = useSacola();

  function sair() {
    // A sacola é deste aparelho: quem entrar depois não herda os itens.
    esvaziar();
    logout();
    navigate('/', { replace: true });
  }

  return (
    <Estrutura titulo="Perfil" largura="estreita">
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-[14px] bg-tinta font-letreiro text-xl text-chao">
          {iniciais(usuario?.nome)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold">{usuario?.nome}</p>
          <p className="text-poeira">{isAdmin ? 'Dono da loja' : 'Cliente'}</p>
        </div>
      </div>

      <dl className="mt-6 divide-y divide-linha rounded-[14px] border border-linha bg-papel">
        <div className="flex gap-3 p-4">
          <IconeCelular className="mt-0.5 size-5 shrink-0 text-poeira" />
          <div>
            <dt className="text-sm text-poeira">Telefone</dt>
            <dd className="num font-bold">{telefone(usuario?.telefone)}</dd>
          </div>
        </div>
        <div className="flex gap-3 p-4">
          <IconePino className="mt-0.5 size-5 shrink-0 text-poeira" />
          <div>
            <dt className="text-sm text-poeira">Endereço de entrega</dt>
            <dd className="font-bold">{usuario?.endereco}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-6 space-y-3">
        <Botao variante="contorno" onClick={() => navigate('/perfil/editar')}>
          <IconeLapis className="size-5" />
          Editar dados
        </Botao>
        <button
          type="button"
          onClick={sair}
          className="mx-auto flex items-center gap-2 py-3 font-bold text-erro underline decoration-2 underline-offset-4"
        >
          <IconeSair className="size-5" />
          Sair da conta
        </button>
      </div>
    </Estrutura>
  );
}
