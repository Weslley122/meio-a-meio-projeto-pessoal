const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * 4.5 -> "R$ 4,50". Aceita número ou texto (o BigDecimal do Java chega como número no JSON).
 * O Intl já põe um espaço inquebrável depois do "R$": o valor nunca quebra em duas linhas.
 */
export function dinheiro(valor) {
  return moeda.format(Number(valor) || 0);
}

/** "2026-10-13T17:53:00" -> "13/10, 17:53" */
export function dataHora(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia}, ${hora}`;
}

export function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

export function primeiroNome(nome) {
  return (nome || '').trim().split(/\s+/)[0] || '';
}

export function soDigitos(texto) {
  return (texto || '').replace(/\D/g, '');
}

/**
 * Máscara de telefone enquanto a pessoa digita.
 * "9698" -> "(96) 98", "96981234567" -> "(96) 98123-4567". Fixo de 10 dígitos também funciona.
 */
export function mascaraTelefone(texto) {
  const d = soDigitos(texto).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function telefone(texto) {
  const d = soDigitos(texto);
  if (d.length === 10 || d.length === 11) return mascaraTelefone(d);
  return texto || '';
}

const PAGAMENTOS = { pix: 'Pix', cartao: 'Cartão na entrega', dinheiro: 'Dinheiro' };

export function pagamento(codigo) {
  return PAGAMENTOS[codigo] || codigo || '';
}

/** 4.94 -> "4,9 km" */
export function km(valor) {
  return `${Number(valor).toFixed(1).replace('.', ',')} km`;
}
