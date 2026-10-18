# Meio a Meio do Carlinho — Back-end (Spring Boot)

API REST em Java 21 + Spring Boot 3 para o app do depósito Meio a Meio do Carlinho.

## Pré-requisito

- **JDK 21.** No Windows: `winget install EclipseAdoptium.Temurin.21.JDK`
  (depois feche e abra o terminal de novo, pra ele enxergar o Java).

Não precisa instalar o Maven: o projeto traz o **Maven Wrapper** (`mvnw.cmd`), que baixa o Maven
sozinho na primeira execução. Também não precisa instalar banco de dados para começar (veja abaixo).

## Rodando

Dentro desta pasta:

```powershell
.\mvnw.cmd spring-boot:run
```

A primeira execução demora alguns minutos (baixa o Maven e as bibliotecas). A API sobe em
`http://localhost:8080` quando aparecer `Started MeioAMeioBackendApplication` no terminal.

Na primeira execução o app cria sozinho:
- as tabelas;
- os 30 produtos do catálogo;
- o administrador: **telefone `99999999999`, senha `admin123`** (é com esse login que aparece o Painel do Carlinho). A senha vem de `ADMIN_SENHA`; `admin123` é só o padrão local.

## Banco de dados

**Padrão: H2.** É um banco em arquivo, guardado na pasta `data/` deste projeto. Não precisa
instalar nada, e os dados continuam lá entre uma execução e outra. Para zerar tudo, pare o
servidor e apague a pasta `data/`.

**Testes:** `testar-backend.cmd` (ou `.\mvnw.cmd test`). Usam um banco H2 em memória, separado do seu.

**Produção:** perfil `prod` (`SPRING_PROFILES_ACTIVE=prod`). Exige `JWT_SECRET`, `APP_CRIPTO_CHAVE`,
`ADMIN_SENHA`, `CORS_ORIGIN`, `DB_URL`, `DB_USER` e `DB_PASSWORD`. Detalhes em [`../SECURITY.md`](../SECURITY.md).

**MySQL (opcional).** Com o MySQL 8 instalado e rodando:
1. Ajuste usuário e senha em `src/main/resources/application-mysql.properties`.
2. Rode com o perfil `mysql`:
   ```powershell
   .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=mysql"
   ```
   O banco `meio_a_meio` é criado automaticamente se não existir.

## Principais endpoints

| Método | Rota                          | Acesso        | Descrição                                      |
|--------|-------------------------------|---------------|------------------------------------------------|
| POST   | `/api/auth/registro`          | público       | Cria conta de cliente                          |
| POST   | `/api/auth/login`             | público       | Login, retorna token JWT                       |
| GET    | `/api/produtos`               | público       | Lista o catálogo                               |
| GET    | `/api/usuarios/me`            | logado        | Perfil do usuário logado                       |
| PUT    | `/api/usuarios/me`            | logado        | Atualiza nome/telefone/endereço                |
| POST   | `/api/pedidos`                | logado        | Cria um pedido (calcula o frete sozinho)       |
| GET    | `/api/pedidos/meus`           | logado        | Histórico de pedidos do usuário                |
| GET    | `/api/pedidos/{id}`           | logado        | Detalhe de um pedido (dono ou admin)           |
| GET    | `/api/pedidos/todos`          | **admin**     | Lista todos os pedidos (Painel)                |
| PATCH  | `/api/pedidos/{id}/status`    | **admin**     | Avança o status do pedido                      |
| GET    | `/api/loja/localizacao`       | público       | Localização (lat/lng) configurada da loja      |
| PUT    | `/api/loja/localizacao`       | **admin**     | Define a localização da loja                   |
| POST   | `/api/rota/calcular`          | logado        | Distância e tempo estimado até o cliente       |

Autenticação: envie o header `Authorization: Bearer <token>` recebido no login/registro.
O token guarda o ID do usuário, então trocar o telefone no perfil não derruba a sessão.

## Regra de frete

R$ 20,00 de taxa de entrega para pedidos abaixo de R$ 150,00; frete grátis a partir de R$ 150,00.
Está centralizada em `PedidoService.calcularTaxaEntrega`.
