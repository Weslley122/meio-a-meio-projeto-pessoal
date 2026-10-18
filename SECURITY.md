# Segurança

Este documento diz **o que está protegido, onde está no código, o que ainda falta** e como isso é
verificado. Itens marcados como *processo* não são código: são práticas que valem para quem opera o
sistema, e estão aqui para mostrar que foram pensados, não para fingir que um app resolve sozinho.

- Testes automáticos de ataque: [`backend/src/test/java/.../SegurancaTest.java`](backend/src/test/java/com/meioameio/backend/SegurancaTest.java)
  (17 casos, rodam no CI a cada push).
- Pipeline: [`.github/workflows/ci.yml`](.github/workflows/ci.yml), [`codeql.yml`](.github/workflows/codeql.yml)
  e [`dependabot.yml`](.github/dependabot.yml).

## Resumo por tema

### Injeção (SQL injection) — OWASP A03

| O que existe | Onde |
|---|---|
| Todo acesso ao banco passa pelo Spring Data JPA (métodos derivados e `findById`), que usa consultas parametrizadas. Não existe SQL montado com concatenação de texto. | `repository/*` |
| Entradas com formato e tamanho fechados (`@Pattern`, `@Size`, `@Max`) antes de chegar ao serviço. | `dto/*Request.java` |
| Teste: `' OR '1'='1` no login responde 401. | `SegurancaTest.sqlInjectionNoLogin` |

**Limite:** se um dia alguém escrever `@Query(nativeQuery = true)` concatenando texto, a proteção some.
O CodeQL (`security-extended`) procura exatamente esse padrão.

### XSS (cross-site scripting)

| O que existe | Onde |
|---|---|
| O React escapa todo texto exibido. O projeto não usa `dangerouslySetInnerHTML`, `innerHTML` nem `eval`. | `web/src` |
| Links montados com dados do cliente (`tel:` e WhatsApp no painel) usam só os dígitos do telefone. | `web/src/pages/Painel.jsx` |
| Content-Security-Policy no build de produção: só scripts, estilos e fontes do próprio site; script inline é bloqueado. Testado em todas as telas com a política ativa: nenhuma violação. | `web/vite.config.js` |
| A API devolve só JSON com `Content-Security-Policy: default-src 'none'` e `X-Content-Type-Options: nosniff`. | `config/SecurityConfig.java` |

**Limite:** o token fica no `localStorage`. Se um XSS passar, ele pode ser lido. A troca seria cookie
`HttpOnly` + `SameSite=Strict`, o que traz o CSRF de volta (ver abaixo). Decisão consciente para um
app sem conteúdo gerado por terceiros.

### CSRF

| O que existe | Onde |
|---|---|
| Proteção CSRF do Spring **desligada de propósito**: CSRF depende do navegador mandar cookie sozinho, e a API não usa cookie. O token vai no cabeçalho `Authorization`, que o navegador nunca envia por conta própria. | `SecurityConfig.java` (comentário) |
| CORS fechado: uma origem, métodos e cabeçalhos explícitos, sem credenciais. | `config/CorsConfig.java` |

**Se o login mudar para cookie**, o CSRF tem que ser religado (`CookieCsrfTokenRepository`) no mesmo commit.

### Autenticação e autorização — OWASP A01, A07

| O que existe | Onde |
|---|---|
| JWT HS256 com emissor obrigatório (`iss`) e validade de 12 h. Token com `alg: none` ou outra chave é recusado. | `security/JwtUtil.java` |
| O papel (CLIENTE/ADMIN) é lido **do banco a cada requisição**, não do token: rebaixar um admin vale na hora. | `security/JwtAuthFilter.java` |
| Autorização em duas camadas: por rota e com `@PreAuthorize` nos métodos de admin. | `SecurityConfig.java`, `PedidoController`, `LojaController` |
| IDOR: pedido de outra pessoa responde 404 (nem confirma que existe). | `PedidoService.buscarPorId` |
| Mesma mensagem para "telefone não existe" e "senha errada", e o mesmo tempo de resposta (hash falso), para não revelar quem tem conta. | `service/AuthService.java` |
| Bloqueio por força bruta: 5 erros seguidos travam aquele login por 15 min. Limite de 20 chamadas/min por IP em `/api/auth/*`, com resposta 429 e `Retry-After`. | `security/LimiteDeTentativas.java`, `LimiteDeRequisicoesFilter.java` |
| Senha de 8 a 64 caracteres (NIST SP 800-63B), no front e no back. | `RegistroRequest`, `CriarConta.jsx` |
| O app encerra a sessão sozinho quando a API responde 401. | `web/src/api/client.js`, `AuthContext.jsx` |

**Limites:**
- Não há revogação de token antes de vencer (logout só apaga do navegador). O próximo passo é token curto (15 min) + refresh token guardado no banco.
- O bloqueio por telefone pode ser usado para travar a conta de outra pessoa por 15 min (lockout DoS). O limite por IP reduz, não elimina. Alternativa futura: CAPTCHA depois de 3 erros em vez de bloqueio.
- Os contadores ficam em memória: com mais de uma instância da API, precisariam ir para o Redis.

### Menor privilégio e escalação de privilégio

| O que existe | Onde |
|---|---|
| Toda conta criada pelo app é CLIENTE. O DTO de cadastro não tem campo `role`; mandar `"role":"ADMIN"` é ignorado (teste). | `AuthService.registrar`, `SegurancaTest.cadastroNaoAceitaPapel` |
| Editar perfil não mexe em papel nem senha. | `UsuarioService` |
| Tudo que não foi liberado explicitamente exige login (`anyRequest().authenticated()`). | `SecurityConfig.java` |
| Status do pedido só avança uma etapa por vez e nunca volta depois de entregue. | `PedidoService.atualizarStatus` |
| Preço e frete vêm do banco; valores mandados pelo app são ignorados (teste). | `PedidoService.criarPedido` |
| Em produção, o usuário do banco só lê e grava dados; criar e alterar tabelas é tarefa de outro usuário (`ddl-auto=validate`). | `application-prod.properties` |
| No GitHub Actions, o token do pipeline só tem `contents: read`. | `.github/workflows/*.yml` |

### Hashing e salt

BCrypt com custo 12 (`SecurityConfig.passwordEncoder`). O BCrypt gera um salt aleatório por senha e
guarda junto do hash: duas contas com a mesma senha ficam com hashes diferentes, e tabela pré-calculada
(rainbow table) não serve. Ele é lento de propósito (~250 ms por tentativa), o que encarece a força bruta
offline se o banco vazar. O teste `senhaComHash` confere que o banco guarda `$2a$12$...`, nunca a senha.

O BCrypt só lê os primeiros 72 bytes; por isso o limite de 64 caracteres. Esse detalhe já virou CVE no
Spring Security (CVE-2025-22228), corrigido nas versões trazidas pelo Spring Boot 3.5.

### Criptografia simétrica

AES-256-GCM no endereço do cliente, aplicado como `AttributeConverter` do JPA
(`security/CriptografiaCampo.java`). IV aleatório de 12 bytes a cada gravação, tag de 16 bytes que
detecta adulteração, chave em variável de ambiente (`APP_CRIPTO_CHAVE`), nunca no banco. Teste:
`enderecoCifradoNoBanco` confere que o banco tem `gcm1:...` e a API devolve o texto normal.

**Limites:** o telefone não é cifrado porque o login busca por ele. O caminho é um *blind index*
(HMAC do telefone numa coluna só para busca). Não há rotação de chave: o prefixo `gcm1:` existe para
permitir uma `gcm2:` no futuro.

### Criptografia assimétrica

Hoje **não é usada no código**, e isso é uma escolha: com um único serviço que emite e confere o token,
HS256 (chave simétrica) basta. Onde ela entra:
- **HTTPS/TLS**: o certificado do servidor é um par de chaves pública/privada.
- **Próximo passo, se surgirem outros serviços** (ex.: um app do entregador): trocar para RS256/ES256.
  A API assina com a chave privada e os outros só conferem com a pública, sem poder emitir tokens.

### HTTPS e TLS

| O que existe | Onde |
|---|---|
| HSTS de 1 ano com subdomínios (o Spring só envia em conexão HTTPS). | `SecurityConfig.java` |
| Perfil `prod` preparado para TLS no proxy reverso (Nginx, Caddy ou a hospedagem): `forward-headers-strategy=framework`. | `application-prod.properties` |
| `Referrer-Policy: no-referrer` e `Permissions-Policy` fechando câmera, microfone e localização na API. | `SecurityConfig.java` |

*Processo:* em produção, a API não pode ficar exposta direto na internet, só atrás do proxy com TLS
1.2+. Se ficar, o cabeçalho `X-Forwarded-For` pode ser forjado para driblar o limite por IP.
O host do app web deve mandar `frame-ancestors 'none'` como cabeçalho (em meta tag ele é ignorado).

### Segurança de APIs (OWASP API Top 10)

| Risco | Tratamento |
|---|---|
| API1 Autorização por objeto (IDOR) | 404 para pedido de outro usuário |
| API2 Autenticação quebrada | JWT validado, bloqueio por força bruta, mensagem única |
| API3 Propriedades expostas/atribuição em massa | DTOs de entrada e saída; `role` e preço não entram pelo JSON |
| API4 Consumo de recursos | Limites de tamanho nos DTOs (máx. 30 itens, 99 unidades), 429 nas rotas de login |
| API5 Autorização por função | Rotas de admin com regra por rota + `@PreAuthorize` |
| API8 Má configuração | Erros sem stack trace nem mensagem técnica (500 devolve só uma referência), cabeçalhos de segurança |

### Logs de segurança e SIEM

Eventos de segurança vão para um logger próprio (`SEGURANCA`) em formato `chave=valor`, que qualquer
SIEM (Wazuh, Splunk, Elastic) lê sem parser customizado. Arquivo `logs/seguranca.log`, com rotação.

```
data=2026-10-18T08:23:50.901-03:00 nivel=WARN evento=acesso_negado usuario=4 metodo=PATCH caminho=/api/pedidos/2/status ip=127.0.0.1
```

Eventos: `conta_criada`, `login_ok`, `login_falha`, `login_bloqueado`, `limite_excedido`,
`nao_autenticado`, `acesso_negado`, `perfil_alterado`, `status_alterado`, `loja_localizacao_alterada`,
`erro_interno`. Telefone aparece mascarado (só os 4 últimos dígitos), senha e token nunca. Quebras de
linha são removidas para ninguém forjar uma linha falsa no log (log injection).

*Processo (não implementado):* o SIEM em si. Regras que fariam sentido: mais de 20 `login_falha` do
mesmo IP em 5 min; qualquer `acesso_negado` em rota de admin; `status_alterado` fora do horário da loja.

### Vulnerabilidades, CVEs e DevSecOps

| Etapa | Ferramenta |
|---|---|
| Dependências do back-end atualizadas | Spring Boot 3.3.4 → 3.5.16 (traz as correções do Spring Security e do Tomcat) |
| Dependências do front atualizadas | Vite 5.4 → 6.4.4 (falhas do servidor de desenvolvimento: CVE-2025-30208 e o aviso do esbuild GHSA-67mh-4wv8-2f99) |
| Testes de segurança a cada push | `ci.yml` → `mvnw verify` (inclui `SegurancaTest`) |
| Auditoria de dependências npm | `ci.yml` → `npm audit --audit-level=high --omit=dev` |
| Análise estática (SAST) | `codeql.yml`, Java e JavaScript, consultas `security-extended`, toda semana também |
| Atualização automática | `dependabot.yml` (Maven, npm e as próprias Actions) |
| Instalação travada pelo lockfile | `npm ci` no CI |
| Segredos fora do código | `application-prod.properties` sem valor padrão: faltou variável, a API não sobe |

**Limites:** não há SCA no Maven além do Dependabot (próximo passo: OWASP Dependency-Check ou
`trivy fs`), nem varredura de segredos no histórico (próximo: `gitleaks` no CI). A chave de
desenvolvimento e a senha `admin123` estão no repositório **de propósito**, só para rodar local; a API
avisa no log quando sobe com elas.

### Pentest

Além dos 17 testes automáticos, a API rodando foi atacada manualmente. Resultado na seção
[Pentest manual](#pentest-manual) abaixo.

*Processo:* um pentest de verdade é feito por outra pessoa, com escopo e autorização por escrito, e
inclui ferramentas como OWASP ZAP ou Burp Suite. O que está aqui é autoverificação.

### Engenharia social e phishing

*Processo*, com uma parte no app:
- A tela de login avisa que ninguém do Meio a Meio pede senha por WhatsApp, ligação ou SMS (golpe
  comum em app de entrega: "confirme seu pedido me passando o código").
- O app nunca pede senha fora da tela de login, e não manda link de login por mensagem.
- Para a loja: o painel do dono é o alvo mais valioso. Senha do admin só por variável de ambiente,
  nunca enviada por chat; desconfiar de "suporte" pedindo acesso.
- Próximo passo: segundo fator (código por app autenticador) para a conta de admin.

### Zero trust

Aplicado onde cabe num monólito:
- Nenhuma requisição é confiável por vir "de dentro": toda chamada protegida revalida o token **e**
  consulta o usuário no banco (conta apagada ou rebaixada perde acesso na hora).
- O front não decide nada: esconder o painel de quem não é admin é só interface; a API devolve 403.
- Preço, frete e status são recalculados no servidor, nunca aceitos do cliente.

### Análise de malware

*Processo / fora do escopo do app.* O app não recebe arquivos (não há upload), o que elimina o vetor
mais comum. Na cadeia de dependências: o npm 12 já bloqueia scripts de instalação não aprovados
(ele barrou o `postinstall` do esbuild na instalação), o lockfile fixa versões e hashes de integridade,
e o Dependabot avisa quando sai alerta. Se um dia houver upload (foto de comprovante, por exemplo),
o caminho é validar o tipo pelo conteúdo, limitar tamanho, guardar fora da pasta pública e passar
por antivírus (ClamAV) antes de abrir.

## Pentest manual

_Em andamento._

## Como reportar uma vulnerabilidade

Não abra issue pública. Use **Security → Report a vulnerability** no GitHub deste repositório
(relato privado) ou fale comigo pelo perfil [@Weslley122](https://github.com/Weslley122).
Diga o que encontrou, como reproduzir e o impacto. Respondo em até 7 dias.
