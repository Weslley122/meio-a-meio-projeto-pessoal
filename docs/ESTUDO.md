# Roteiro de estudo: JPA, JUnit e Docker neste projeto

Este roteiro serve para você conseguir explicar cada parte numa entrevista técnica. Para cada
tema: onde está no código, o que ler e as perguntas que costumam fazer.
Responda em voz alta, sem olhar o código. Se travar, volte ao arquivo.

---

## 1. JPA / Hibernate

**Onde está:** `backend/src/main/java/.../model` (entidades), `.../repository` (repositórios) e
`backend/src/test/java/.../repository/PedidoRepositoryTest.java`.

**Leia nesta ordem:**
1. `model/Pedido.java`: `@Entity`, `@Id` + `@GeneratedValue`, `@ManyToOne` (pedido → usuário) e
   `@OneToMany(cascade = ALL, orphanRemoval = true)` (pedido → itens).
2. `repository/PedidoRepository.java`: interface sem nenhuma implementação. O Spring Data gera o SQL
   a partir do nome do método.
3. `model/Usuario.java`: o `@Convert` que cifra o endereço antes de gravar.
4. `PedidoRepositoryTest`: rode e leia cada teste.

**Perguntas de entrevista:**
- Qual a diferença entre JPA e Hibernate? *(JPA é a especificação, Hibernate é a implementação.)*
- O que faz `cascade = CascadeType.ALL`? Por que não existe `ItemPedidoRepository`?
- `FetchType.LAZY` x `EAGER`: qual o risco de cada um? O que é o problema N+1?
- Como o Spring sabe o SQL de `findByUsuarioOrderByCriadoEmDesc`?
- Para que serve `@Transactional`? Por que o teste de repositório desfaz tudo no final?
- Por que `spring.jpa.open-in-view=false`?

---

## 2. Testes com JUnit 5 + Mockito

**Onde está:** `backend/src/test/java/.../service/PedidoServiceTest.java`.

**Conceitos que aparecem no arquivo:**
- **Teste de unidade x integração.** `PedidoServiceTest` não sobe o Spring nem o banco.
  `PedidoRepositoryTest` sobe os dois.
- **Mock** (`@Mock`, `@InjectMocks`, `when(...).thenReturn(...)`, `verify(...)`).
- **Padrão AAA:** Arrange, Act, Assert.
- **Valores de fronteira:** 149,99 / 150,00 / 150,01 no teste da regra de frete.
- **`@ParameterizedTest` + `@CsvSource`:** um teste, várias entradas.
- **`@Nested`:** agrupa testes por comportamento.
- **`BigDecimal`:** por que `isEqualByComparingTo` e não `equals`.

**Exercício (faça você, sem ajuda):** crie um teste novo em `PedidoServiceTest` que confere que
o **admin** consegue ver o pedido de qualquer cliente em `buscarPorId`.

**Perguntas de entrevista:**
- Qual a diferença entre teste de unidade e de integração? Quando usar cada um?
- O que é um mock? Quando **não** mockar?
- Por que testar 149,99 e 150,00, e não só 100 e 200?
- Por que dinheiro em `BigDecimal` e não em `double`?

---

## 3. Docker

**Onde está:** `backend/Dockerfile`, `docker-compose.yml` e `.env.example`.

**Leia nesta ordem:**
1. `backend/Dockerfile`: build em dois estágios. O primeiro compila com Maven, o segundo só roda
   com o JRE. Por que a imagem final fica menor?
2. `docker-compose.yml`: dois serviços (`mysql` e `api`), a rede entre eles (a API acha o banco
   pelo nome `mysql`), o volume que guarda os dados e o `healthcheck` + `depends_on`.
3. `.env.example`: os segredos ficam fora do código e fora do Git (`.env` está no `.gitignore`).

**Exercício:** rode `docker compose up --build`, crie uma conta pelo app, rode
`docker compose down` e depois `up` de novo. A conta continua lá? E depois de `down -v`?

**Perguntas de entrevista:**
- Qual a diferença entre imagem e container?
- Por que copiar o `pom.xml` e baixar as dependências **antes** de copiar o código?
- Qual a diferença entre `Dockerfile` e `docker-compose.yml`?
- Por que, dentro do Compose, a URL do banco usa `mysql` e não `localhost`?
- Para que serve o volume? O que `down -v` apaga?

---

## 4. CI (GitHub Actions)

**Onde está:** `.github/workflows/ci.yml`. A cada push e PR, ele roda os testes do back-end, faz a
auditoria e o build do front-end, valida o `docker-compose.yml` e constrói a imagem Docker.

**Pergunta de entrevista:** o que acontece se alguém abrir um PR que quebra a regra de frete?
*(O `PedidoServiceTest` falha no CI e o PR fica marcado em vermelho.)*
