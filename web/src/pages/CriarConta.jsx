import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Porta from '../components/Porta';
import { Botao, Campo, Erro } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useAviso } from '../context/AvisoContext';
import { mascaraTelefone, primeiroNome, soDigitos } from '../lib/formato';
import { TrocaConta } from './Entrar';

/** Confere no navegador o que dá pra conferir antes de ir ao servidor. */
function validar(f) {
  if (!f.nome.trim()) return 'Digite seu nome.';
  const digitos = soDigitos(f.telefone).length;
  if (digitos < 10 || digitos > 11) return 'Digite o telefone com DDD, como (96) 98123-4567.';
  if (!f.endereco.trim()) return 'Digite o endereço de entrega.';
  if (f.senha.length < 8 || f.senha.length > 64) return 'A senha precisa ter de 8 a 64 caracteres.';
  if (!f.maiorDeIdade) return 'Confirme que você tem 18 anos ou mais.';
  return '';
}

export default function CriarConta() {
  const navigate = useNavigate();
  const { registrar } = useAuth();
  const avisar = useAviso();
  const [f, setF] = useState({ nome: '', telefone: '', endereco: '', senha: '', maiorDeIdade: false });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const muda = (campo) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF((atual) => ({ ...atual, [campo]: campo === 'telefone' ? mascaraTelefone(v) : v }));
  };

  async function enviar(e) {
    e.preventDefault();
    const problema = validar(f);
    setErro(problema);
    if (problema) return;
    setEnviando(true);
    try {
      await registrar({ ...f, telefone: soDigitos(f.telefone) });
      avisar(`Conta criada. Boas compras, ${primeiroNome(f.nome)}.`);
      navigate('/home');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Porta>
      <TrocaConta atual="criar" />
      <form onSubmit={enviar} className="space-y-5" noValidate>
        <Erro>{erro}</Erro>
        <Campo rotulo="Nome" autoComplete="name" value={f.nome} onChange={muda('nome')} />
        <Campo
          rotulo="Telefone com DDD"
          dica="É com ele que você entra na conta."
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(96) 98123-4567"
          value={f.telefone}
          onChange={muda('telefone')}
        />
        <Campo
          rotulo="Endereço de entrega"
          dica="Rua, número, bairro e um ponto de referência."
          autoComplete="street-address"
          value={f.endereco}
          onChange={muda('endereco')}
        />
        <Campo
          rotulo="Senha"
          dica="De 8 a 64 caracteres. Uma frase curta é mais forte que uma palavra."
          type="password"
          autoComplete="new-password"
          maxLength={64}
          value={f.senha}
          onChange={muda('senha')}
        />
        <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border-2 border-linha p-3.5 has-[:checked]:border-tinta">
          <input
            type="checkbox"
            checked={f.maiorDeIdade}
            onChange={muda('maiorDeIdade')}
            className="mt-0.5 size-5 shrink-0 accent-[#171513]"
          />
          <span className="text-[15px]">Tenho 18 anos ou mais. A loja vende bebida alcoólica.</span>
        </label>
        <Botao type="submit" disabled={enviando}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </Botao>
      </form>
    </Porta>
  );
}
