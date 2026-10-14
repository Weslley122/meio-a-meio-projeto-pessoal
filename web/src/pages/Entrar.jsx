import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Porta from '../components/Porta';
import { Botao, Campo, Erro } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useAviso } from '../context/AvisoContext';
import { mascaraTelefone, primeiroNome, soDigitos } from '../lib/formato';

export function TrocaConta({ atual }) {
  const base = 'flex-1 rounded-[8px] py-2.5 text-center text-[15px] font-bold';
  return (
    <div className="mb-7 flex rounded-[10px] bg-chao p-1" role="navigation" aria-label="Entrar ou criar conta">
      <Link to="/login" aria-current={atual === 'entrar' ? 'page' : undefined}
        className={`${base} ${atual === 'entrar' ? 'bg-papel shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-poeira'}`}>
        Entrar
      </Link>
      <Link to="/registro" aria-current={atual === 'criar' ? 'page' : undefined}
        className={`${base} ${atual === 'criar' ? 'bg-papel shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-poeira'}`}>
        Criar conta
      </Link>
    </div>
  );
}

export default function Entrar() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const avisar = useAviso();
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      // O back-end compara só os dígitos, então a máscara não atrapalha.
      const r = await login({ telefone: soDigitos(telefone), senha });
      avisar(`Olá de novo, ${primeiroNome(r.usuario.nome)}.`);
      navigate('/home');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Porta>
      <TrocaConta atual="entrar" />
      <form onSubmit={enviar} className="space-y-5" noValidate>
        <Erro>{erro}</Erro>
        <Campo
          rotulo="Telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(96) 98123-4567"
          value={telefone}
          onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
          required
        />
        <Campo
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <Botao type="submit" disabled={enviando || !telefone || !senha}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </Botao>
      </form>
    </Porta>
  );
}
