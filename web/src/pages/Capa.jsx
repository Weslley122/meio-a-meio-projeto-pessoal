import { useNavigate } from 'react-router-dom';
import Porta from '../components/Porta';
import { Botao } from '../components/ui';
import { IconeGalao, IconeGelo, IconeLongNeck, IconeMoto } from '../components/icones';

const DESTAQUES = [
  { Icone: IconeLongNeck, texto: 'Cerveja e refrigerante gelados' },
  { Icone: IconeGelo, texto: 'Gelo em cubo e em barra' },
  { Icone: IconeGalao, texto: 'Água, sucos e mercearia' },
];

export default function Capa() {
  const navigate = useNavigate();
  return (
    <Porta fotoAlta>
      <h1 className="text-[28px] font-bold leading-tight sm:text-[34px]">
        O depósito do bairro, agora entregando na sua porta.
      </h1>

      <ul className="mt-6 space-y-3">
        {DESTAQUES.map(({ Icone, texto }) => (
          <li key={texto} className="flex items-center gap-3 text-[17px]">
            <Icone className="size-6 shrink-0 text-laranja-texto" />
            {texto}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-start gap-3 rounded-[14px] bg-chao p-4">
        <IconeMoto className="mt-0.5 size-7 shrink-0" />
        <p className="text-[15px]">
          <span className="font-bold">Entrega grátis a partir de R$ 150.</span> Abaixo disso, a taxa é de R$ 20 em
          qualquer ponto da área de entrega.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <Botao onClick={() => navigate('/registro')}>Criar conta</Botao>
        <Botao variante="contorno" onClick={() => navigate('/login')}>
          Já tenho conta
        </Botao>
      </div>
      <p className="mt-6 text-sm text-poeira">Venda de bebida alcoólica só para maiores de 18 anos.</p>
    </Porta>
  );
}
