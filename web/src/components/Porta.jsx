import fachada from '../assets/fachada.jpg';
import Marca from './Marca';

/**
 * Layout das telas de fora (capa, entrar, criar conta): a foto da fachada de verdade
 * e o conteúdo embaixo (celular) ou ao lado (computador).
 * A foto é pequena (618×335), então no computador ela aparece no tamanho dela, emoldurada,
 * em vez de esticada até borrar. Para trocar, substitua src/assets/fachada.jpg.
 */
export default function Porta({ children, fotoAlta = false }) {
  return (
    <div className="min-h-dvh bg-papel lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(440px,1fr)]">
      <div className="bg-piche lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-center lg:px-14">
        <img
          src={fachada}
          alt="Fachada verde do depósito Meio a Meio do Carlinho, com o nome pintado na parede"
          className={`w-full object-cover object-[55%_50%] lg:order-2 lg:mx-auto lg:h-auto lg:max-w-[618px] lg:rounded-[14px] ${
            fotoAlta ? 'h-60 sm:h-80' : 'h-36 sm:h-56'
          }`}
        />
        <div className="px-4 py-3 lg:order-1 lg:mx-auto lg:mb-8 lg:w-full lg:max-w-[618px] lg:px-0 lg:py-0">
          <Marca />
        </div>
        <p className="hidden lg:order-3 lg:mx-auto lg:mt-4 lg:block lg:w-full lg:max-w-[618px] lg:text-[15px] lg:text-piche-poeira">
          A loja de verdade. Os pedidos do app saem daqui.
        </p>
      </div>
      <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6 lg:flex lg:max-w-[520px] lg:flex-col lg:justify-center lg:px-12 lg:py-16">
        {children}
      </div>
    </div>
  );
}
