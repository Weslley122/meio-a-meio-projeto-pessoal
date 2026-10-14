import {
  IconeLongNeck, IconePet, IconeGalao, IconeGelo, IconeSalgadinho, IconeLata, IconeLinguica, IconePacote,
} from '../components/icones';

/** A ordem aqui é a ordem das prateleiras na tela. O "id" é o mesmo que o back-end grava no produto. */
export const CATEGORIAS = [
  { id: 'cervejas', nome: 'Cervejas', Icone: IconeLongNeck },
  { id: 'refrigerantes', nome: 'Refrigerantes', Icone: IconePet },
  { id: 'aguas', nome: 'Águas e sucos', Icone: IconeGalao },
  { id: 'gelo', nome: 'Gelo', Icone: IconeGelo },
  { id: 'snacks', nome: 'Salgadinhos', Icone: IconeSalgadinho },
  { id: 'enlatados', nome: 'Enlatados', Icone: IconeLata },
  { id: 'carnes', nome: 'Carnes e frios', Icone: IconeLinguica },
  { id: 'mercearia', nome: 'Mercearia', Icone: IconePacote },
];

/** Índice = número do status que o back-end devolve (0 a 3). */
export const ETAPAS = [
  { nome: 'Recebido', detalhe: 'A loja recebeu seu pedido.' },
  { nome: 'Separando', detalhe: 'Os itens estão sendo separados.' },
  { nome: 'A caminho', detalhe: 'O entregador saiu com seu pedido.' },
  { nome: 'Entregue', detalhe: 'Pedido entregue no seu endereço.' },
];

export const ULTIMA_ETAPA = ETAPAS.length - 1;

/** Mesma regra do back-end (PedidoService). O valor cobrado de verdade é o que o servidor devolve. */
export const ENTREGA_GRATIS_A_PARTIR = 150;
export const TAXA_ENTREGA = 20;
