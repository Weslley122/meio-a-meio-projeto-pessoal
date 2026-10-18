# Deploy de demonstração

Este guia sobe uma versão **de demonstração** para mostrar o projeto no ar (ex.: link no currículo).
Não é um deploy de produção para clientes reais — ver [limites](#o-que-este-demo-não-é) no fim.

**Arquitetura:** API (Docker + H2) no Render; app web (estático) no Render ou Cloudflare Pages.
Os dois com HTTPS incluso e sem cartão.

```
navegador ──HTTPS──> app web (estático)  ──HTTPS──> API (Render)  ──> H2 em memória
```

---

## Antes de começar

- Uma conta no GitHub com este repositório (já existe).
- Uma conta no Render: https://render.com (login com o GitHub, sem cartão no plano free).
- Os três segredos abaixo. **Eu gerei estes valores para você. Não os coloque no código nem no
  Git — eles vão só nas variáveis de ambiente do Render.** Se preferir, gere outros.

| Variável | Para que serve |
|---|---|
| `JWT_SECRET` | assina os tokens de login |
| `APP_CRIPTO_CHAVE` | cifra o endereço no banco (Base64 de 32 bytes) |
| `ADMIN_SENHA` | senha do painel do dono |

Os valores gerados estão na conversa com o Claude (não ficam no repositório de propósito).

---

## Passo 1 — API no Render

1. No Render: **New → Web Service** e conecte este repositório do GitHub.
2. Configure:
   - **Root Directory:** `backend`
   - **Runtime / Language:** Docker (ele acha o `backend/Dockerfile` sozinho)
   - **Instance Type:** Free
3. Em **Environment**, adicione as variáveis (cole os valores gerados):
   - `JWT_SECRET`
   - `APP_CRIPTO_CHAVE`
   - `ADMIN_SENHA`
   - `CORS_ORIGIN` → deixe `https://exemplo.temporario` por enquanto (ajustamos no Passo 3)
4. **Create Web Service.** A primeira build demora alguns minutos (compila o jar).
5. Quando terminar, o Render dá uma URL tipo `https://meio-a-meio-api.onrender.com`. **Guarde.**
   - Teste abrindo `.../api/produtos` — deve vir um JSON com os produtos.

> Se a build falhar, copie o log e mande para o Claude: ele lê e corrige.

---

## Passo 2 — App web (estático)

No mesmo Render: **New → Static Site**, conecte o mesmo repositório.

- **Root Directory:** `web`
- **Build Command:** `npm ci && npm run build`
- **Publish Directory:** `web/dist`
- **Environment** → adicione:
  - `VITE_API_URL` = a URL da API do Passo 1 **com `/api` no fim**
    (ex.: `https://meio-a-meio-api.onrender.com/api`)

> Esse valor entra no build: é ele que o navegador chama e que a política de segurança (CSP)
> libera. Sem ele, o app tenta falar com `localhost` e não acha a API.

**Create Static Site.** O Render dá outra URL, tipo `https://meio-a-meio.onrender.com`. **Guarde.**
O arquivo `web/public/_redirects` já cuida das rotas do React (abrir `/pedidos` direto funciona).

---

## Passo 3 — Ligar os dois

1. Volte no serviço da **API** (Passo 1) → **Environment**.
2. Troque `CORS_ORIGIN` pela URL do app web (Passo 2), **sem `/` no fim**:
   `https://meio-a-meio.onrender.com`
3. Salve. O Render reinicia a API sozinho.

Pronto. Abra a URL do app web, entre no painel com telefone `99999999999` e a `ADMIN_SENHA`.

---

## Alternativa para o front: Cloudflare Pages

Se preferir separar o app web do Render (build mais rápido, não "dorme"):
em https://pages.cloudflare.com → conecte o repo → **Root** `web`, **Build** `npm ci && npm run build`,
**Output** `dist`, variável `VITE_API_URL` igual à de cima. O `_redirects` já funciona lá também.
Depois, no Passo 3, use a URL do Cloudflare no `CORS_ORIGIN`.

---

## O que este demo NÃO é

- **Os dados reiniciam.** O H2 vive na memória do contêiner; a cada restart (e o plano free
  "dorme" após 15 min sem uso), contas e pedidos de teste somem e o catálogo é recriado. Para
  portfólio, tudo bem. Para a loja de verdade, troque por um banco gerenciado (Postgres/MySQL) e
  ative o perfil `prod`.
- **Primeiro acesso é lento.** Depois de dormir, a API leva ~1 min para voltar no plano free.
- **Não use dados pessoais reais.** Sem banco persistente, backup e as obrigações de LGPD
  resolvidas, o demo é para dados fictícios. Ver `SECURITY.md`.

## Quando virar produção de verdade

1. Banco gerenciado + perfil `prod` (`SPRING_PROFILES_ACTIVE=prod`), que exige todas as variáveis.
2. Backup do banco.
3. LGPD: base legal, política de privacidade, exclusão a pedido.
4. Plano pago (ou outro host) para a API não dormir.
