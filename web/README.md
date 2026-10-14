# Meio a Meio do Carlinho · app web

App de pedidos para um depósito de bebidas de bairro: o cliente monta a sacola, paga na entrega
e acompanha o pedido; o dono recebe os pedidos num painel e avança cada etapa.

- **Front-end:** React 18 + Vite + Tailwind CSS 4 (esta pasta)
- **Back-end:** Spring Boot 3 + Java 21 + JWT + H2/MySQL (pasta `backend`)

## Como rodar

1. Suba o back-end: dois cliques em `backend\rodar-backend.cmd` (porta 8080).
2. Suba este app: dois cliques em `rodar-web.cmd`. Na primeira vez ele roda `npm install`.
3. Abra o endereço que aparecer (normalmente `http://localhost:5173`).

Login do dono para testar o painel: telefone `99999999999`, senha `admin123`.

Pelo terminal, o equivalente é `npm install` e depois `npm run dev`.

## O que tem

| Tela | O que faz |
|---|---|
| Capa, Entrar, Criar conta | Foto real da fachada. Telefone com máscara enquanto digita; confirmação de 18+ (a loja vende álcool). |
| Loja | Busca sem acento ("agua" acha "Água"), prateleiras por categoria com rolagem lateral no celular e grade no computador. |
| Sacola | Fica salva no aparelho (sobrevive a recarregar a página). Mostra quanto falta para a entrega grátis. |
| Pagamento | Pix, cartão ou dinheiro na entrega. O total cobrado é o que o servidor calcula. |
| Acompanhar | Linha do tempo com 4 etapas, atualizando sozinha a cada 5 s até o pedido ser entregue. |
| Rota | Distância e tempo da moto, a partir do GPS do cliente e do ponto da loja. |
| Painel (dono) | Pedidos em aberto e entregues, botão para avançar etapa, ligar ou chamar no WhatsApp, ponto da loja por GPS ou digitado. |

## Decisões e por quê

**Regra de frete nos dois lados.** Entrega grátis a partir de R$ 150, senão R$ 20. O front calcula
só para mostrar a prévia; quem decide o valor cobrado é o `PedidoService` no back-end, que devolve
`taxaEntrega` e `total` no pedido. Assim ninguém consegue mudar o preço editando o JavaScript.

**"Tempo real" sem WebSocket.** O hook `useRepetir` consulta o servidor de tempos em tempos,
pausa quando a aba está escondida (celular no bolso não gasta dados) e para sozinho quando o
pedido chega em "Entregue". Para o volume de um depósito de bairro é suficiente; WebSocket seria
o próximo passo se o número de pedidos simultâneos crescesse.

**GPS que não trava.** Alguns navegadores nunca respondem quando a pergunta de permissão fica
aberta, e o `timeout` nativo não cobre esse caso. `pedirPosicao()` tem um vigia de 15 s e mensagens
diferentes para "bloqueado" e "não achou". No painel, o dono também pode colar as coordenadas
copiadas do Google Maps, porque GPS de computador costuma ser impreciso.

**Tailwind com tema próprio.** As cores ficam como variáveis CSS (`--laranja`, `--chao`,
`--piche`...) e o Tailwind aponta para elas com `@theme inline`. Por isso `bg-papel` e `text-tinta`
funcionam no modo claro e no escuro sem precisar escrever `dark:` em cada componente.

**Contraste.** O laranja do letreiro (#FF6A1A) com texto branco dá 2,9:1, abaixo do mínimo de
4,5:1. Os botões usam texto preto (6,4:1), e quando o laranja é texto sobre fundo claro ele
escurece para #B83F00 (4,7:1).

**Ícones desenhados para a loja.** Em vez de um pacote de ícones genérico, o app tem um conjunto
próprio em SVG (`src/components/icones.jsx`): fachada com porta de enrolar, comanda, moto com baú,
galão de 20 L, saco de gelo, sacolinha de mercadinho. Todos usam `currentColor`, então tamanho e
cor vêm das classes do Tailwind (`className="size-5 text-laranja"`).

**Ilustração no lugar de foto de produto.** O depósito não tem direito de uso das fotos das
marcas. Cada produto é desenhado a partir de três campos que o back-end guarda: tipo de embalagem,
cor e cor da faixa (`ProdutoArte.jsx`).

**Fontes servidas pelo próprio app** (`@fontsource`), sem chamar o Google a cada visita.
Bungee, uma letra de letreiro urbano, só aparece no nome da loja, nos preços e nos números; o resto
usa Atkinson Hyperlegible, desenhada para leitura fácil em tela pequena.

## Estrutura

```
src/
  api/          chamadas HTTP (client.js põe o token JWT e trata erro de rede)
  context/      AuthContext (sessão), SacolaContext (itens + regra de frete), AvisoContext (avisos)
  components/   Estrutura (barra, menu, abas), ProdutoCard, ProdutoArte, icones, ui (botão, campo...)
  lib/          catalogo (categorias, etapas, regra de frete), formato (R$, telefone, data), useRepetir
  pages/        uma tela por arquivo
```

## Próximos passos

- Testes automatizados: regra de frete e máscara de telefone (Vitest) e o fluxo de compra (Playwright).
- Troco para pagamento em dinheiro (precisa de um campo novo no back-end).
- Notificação no navegador quando o pedido muda de etapa.
