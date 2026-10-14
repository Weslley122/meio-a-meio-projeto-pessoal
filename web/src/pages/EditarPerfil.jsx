import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Estrutura from '../components/Estrutura';
import { Botao, Campo, Erro } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useAviso } from '../context/AvisoContext';
import { mascaraTelefone, soDigitos } from '../lib/formato';

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { usuario, atualizarPerfil } = useAuth();
  const avisar = useAviso();
  const [f, setF] = useState({
    nome: usuario?.nome || '',
    telefone: mascaraTelefone(usuario?.telefone || ''),
    endereco: usuario?.endereco || '',
  });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const muda = (campo) => (e) =>
    setF((atual) => ({ ...atual, [campo]: campo === 'telefone' ? mascaraTelefone(e.target.value) : e.target.value }));

  async function salvar(e) {
    e.preventDefault();
    const digitos = soDigitos(f.telefone).length;
    if (!f.nome.trim() || !f.endereco.trim()) return setErro('Preencha nome e endereço.');
    if (digitos < 10 || digitos > 11) return setErro('Digite o telefone com DDD, como (96) 98123-4567.');
    setErro('');
    setEnviando(true);
    try {
      await atualizarPerfil({ ...f, telefone: soDigitos(f.telefone) });
      avisar('Dados salvos.');
      navigate('/perfil');
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  }

  return (
    <Estrutura titulo="Editar dados" voltar largura="estreita" semAbas>
      <form onSubmit={salvar} className="space-y-5" noValidate>
        <Erro>{erro}</Erro>
        <Campo rotulo="Nome" autoComplete="name" value={f.nome} onChange={muda('nome')} />
        <Campo
          rotulo="Telefone com DDD"
          dica="Se mudar o telefone, use o número novo para entrar da próxima vez."
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
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
        <Botao type="submit" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar dados'}
        </Botao>
      </form>
    </Estrutura>
  );
}
