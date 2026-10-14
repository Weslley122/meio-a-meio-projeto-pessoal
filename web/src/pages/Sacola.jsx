import Estrutura from '../components/Estrutura';
import ResumoSacola from '../components/ResumoSacola';

export default function Sacola() {
  return (
    <Estrutura titulo="Sacola" voltar largura="estreita" semAbas>
      <ResumoSacola />
    </Estrutura>
  );
}
