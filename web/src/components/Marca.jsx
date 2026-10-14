import { MarcaTelhado } from './icones';

/**
 * Nome da loja como está pintado na parede: letra de letreiro, com o telhadinho do logo.
 * "clara" = para usar sobre fundo preto.
 */
export default function Marca({ clara = true, className = '' }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <MarcaTelhado className="size-9 shrink-0" />
      <span className="leading-none">
        <span className={`block font-letreiro text-[17px] ${clara ? 'text-piche-texto' : 'text-tinta'}`}>
          Meio a Meio
        </span>
        <span className={`mt-0.5 block text-[13px] font-bold ${clara ? 'text-piche-poeira' : 'text-poeira'}`}>
          do Carlinho
        </span>
      </span>
    </span>
  );
}
