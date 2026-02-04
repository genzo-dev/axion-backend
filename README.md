<p align="center" style="padding-top: 40px; padding-bottom:40px;">
  <img src="assets/imgs/axion-bg.svg" alt="Logo do Axion" width="1000"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-em_desenvolvimento-yellow" alt="Status"/>
  <img src="https://img.shields.io/badge/foco-autodidatas-blue" alt="Foco"/>
  <img src="https://img.shields.io/badge/etapa-MVP-yellow" alt="Etapa"/>
  <img src="https://img.shields.io/badge/escopo-TCC-green" alt="TCC Scope"/>
</p>

# 📖 Axion — Backend

O backend do Axion é responsável pelo sistema principal, gerando endpoints e centralizando regras de negócio. Dessa forma, cobrindo autenticação, autorização, persistências de dados, entre outros pontos importantes do sistema.

Totalmente dockerizado, contará com separação de ambientes (development, tests e staging) via Docker e Docker Compose, padronizando o ambiente e isolando dependências.

<!-- **Premissa:** Existe muito conteúdo interessante na internet e muitas vezes é difícil localizá-lo, logo, a ideia é que autodidatas possam se ajudar, criando e compartilhando trilhas com outros autodidatas, formando um ecossistema amplo de estudo compartilhado. Haverá também a possibilidade de mantê-las privadas para registro pessoal.


>**Como surgiu o nome "Axion"?**<br>
>O nome Axion é inspirado em uma partícula hipotética da física teórica, associada à sustentação do universo. A proposta reflete a ideia de que trilhas de conhecimento, quando combinadas, sustentam um ecossistema completo de aprendizado. -->

<!-- 👉 Landing page: Em breve! -->

> [!NOTE]
> Esse projeto inicialmente está sendo feito como TCC (Trabalho de Conclusão de Curso).

## 🛠️ Principais tecnologias:

<table>
  <tr>
    <td align="center">
      <a href="https://nestjs.com/" title="NestJS">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-original.svg" width="42px;" alt="Logo NestJS"/><br>
        <sub>
        </sub>
      </a>
          <b>NestJS</b>
    </td>
    <td align="center">
      <a href="https://www.typescriptlang.org/" title="TypeScript">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="42px;" alt="Logo TypeScript"/><br>
        <sub>
        </sub>
      </a>
          <b>TypeScript</b>
    </td>
    <td align="center">
      <a href="https://www.postgresql.org/" title="PostgreSQL">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" width="42px;" alt="Logo PostgreSQL"/><br>
        <sub>
        </sub>
      </a>
          <b>PostgreSQL</b>
    </td>
    <td align="center">
      <a href="https://docs.docker.com/" title="Docker">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain.svg" width="42px;" alt="Logo Docker"/><br>
        <sub>
        </sub>
      </a>
          <b>Docker</b>
    </td>
    </td>
    <td align="center">
      <a href="https://swagger.io/docs/" title="Swagger">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swagger/swagger-original.svg" width="42px;" alt="Logo Swagger"/><br>
        <sub>
        </sub>
      </a>
          <b>Swagger</b>
    </td>
    <td align="center">
      <a href="https://insomnia.rest/" title="Insomnia">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/insomnia/insomnia-original.svg" width="42px;" alt="Logo Insomnia"/><br>
        <sub>
        </sub>
      </a>
          <b>Insomnia</b>
    </td>
    <td align="center">
      <a href="https://jestjs.io/docs/getting-started" title="Jest">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jest/jest-plain.svg" width="42px;" alt="Logo Jest"/><br>
        <sub>
        </sub>
      </a>
          <b>Jest</b>
    </td>
  </tr>
</table>

## 🚀 Como rodar o projeto:

> [!IMPORTANT]
> Requisitos:
>
> - Docker
> - Docker Compose

O projeto está totalmente Dockerizado e conta com separação de ambientes (development, tests e staging) via Docker Compose, utilizando um Makefile para facilitar a inserção de comandos.

Abaixo estão as informações de como rodar cada ambiente:

### Ambiente de Desenvolvimento

> ⚠️ Em construção — será disponibilizado após configuração completa do ambiente Docker

### Ambiente de Testes

> ⚠️ Em construção — será disponibilizado após configuração completa do ambiente Docker

### Ambiente de Staging

> ⚠️ Em construção — será disponibilizado após configuração completa do ambiente Docker

> **Observação:** Essa seção será atualizada após conclusão de tópicos da Etapa 1.

## 📂 Estrutura de pastas:

```bash

src/
├── main.ts
├── app.module.ts
│
├── modules/
│ └── user/
│     ├── user.controller.ts
│     ├── user.service.ts
│     ├── user.module.ts
│     └── user.entity.ts
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── filters/
│
├── config/
│ └── env.ts

```

## 📌 Status do projeto:

> [!NOTE]
>
> Etapa atual: Configuração inicial do backend e definição de arquitetura

- ✅ Estrutura inicial de documentação definida
- ✅ Decisões técnicas iniciais estabelecidas
- ✅ README em construção
- ⚠️ Setup inicial do backend (NestJS)
- ❌ Docker ainda não configurado
- ❌ Banco de dados ainda não integrado
- ❌ Autenticação ainda não implementada

> **LEGENDA:**
>
> - ✅ — Concluída
> - ⚠️ — Em andamento
> - ❌ — Ainda não iniciada

## 📝 Documentação:

### Documentação Geral

O projeto possui uma documentação geral, com páginas que levam para especificações do Frontend, Backend, Documentação macro (Arquitetura, Banco de dados, Requisitos, etc.) e Design:

| Documento                                                                                                          | Descrição                                  |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| [📂 Documentação Geral](https://www.notion.so/Documenta-o-Geral-362bc7f8170180e8b229c6c4161186ef?source=copy_link) | Hub de páginas de documentações do projeto |

### Documentação Backend

Além disso, existe uma parte focada totalmente no backend:

| Documento                                                                                                  | Descrição                                          |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [⚙️ Documentação Backend](https://www.notion.so/Backend-323bc7f817018038abddce3df7c8cd90?source=copy_link) | Hub de páginas de documentações backend do projeto |

Caso procure algo mais específico:

| Documento                                                                                                                        | Descrição                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [⚙️ Libs e funções](https://www.notion.so/Bibliotecas-e-fun-es-principais-363bc7f817018077bcb4c5b12e12cc98?source=copy_link)     | Informa as bibliotecas utiizadas e explicas as principais funções do sistema |
| [💡 Fases do projeto](https://www.notion.so/Fases-do-projeto-Atual-MVP-363bc7f8170180fe823ac71f6d9b6c39?source=copy_link)        | Informações sobre o andamento do projeto e as próximas fases a respeito      |
| [💭 Planos para o futuro](https://www.notion.so/Planos-para-o-futuro-Ap-s-MVP-363bc7f8170180639ba9fc8c362bd12e?source=copy_link) | Planejamentos sobre o futuro do projeto, podem não ser implementados         |
| [ℹ️ Decisões técnicas](https://www.notion.so/Decis-es-t-cnicas-363bc7f8170180cb9ad6ded0b7edf3ac?source=copy_link)                | Decisões técnicas e o motivo delas                                           |

<!-- | Documento                                                                           | Descrição                                         |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| [👀 Visão Geral](https://www.notion.so/Requisitos-2e5bc7f817018063a163c8527a0a3620) | Explica a ideia, propósito e visão do projeto     |
| [📃 Requisitos](https://www.notion.so/Requisitos-2e5bc7f817018063a163c8527a0a3620)  | Mapeia todas as necessidades esperadas no sistema | -->

<!-- ### Documentação completa:
Veja a documentação completa do sistema a partir desse link do Notion -->

<!-- **Documentação completa:** [Documentação do Axion](https://www.notion.so/Axion-Documenta-o-2e5bc7f817018019b057eba6e258262e?source=copy_link) -->

> [!WARNING]
>
> A documentação pode ser alterada conforme novas atualizações surgirem

<!-- **Observação:**<br>
A documentação pode ser alterada conforme novas atualizações surgirem -->

<!-- ## 🎨 Design do sistema:

> [!NOTE]
> O design está sendo criado no momento. Essa seção será atualizada em breve.

## 📝 Etapas de desenvolvimento:

### Escopo de TCC:

**Este projeto está sendo desenvolvido como Trabalho de Conclusão de Curso (TCC).**

<details>
  <summary>Etapa 1: MVP Base (em andamento)</summary>

- [x] Inicializar repositório
- [ ] Documentação finalizada
- [ ] Criar setup frontend
- [ ] Criar setup backend
- [ ] Criar setup docker (somente para PostgreSQL incialmente)
- [ ] Criar layout do frontend
- [ ] Criação de CI básica (testes unitários, integração e e2e)
- [ ] Autenticação (login/logout)
- [ ] Recuperação de senha
- [ ] CRUD de trilhas em módulos (públicas/privadas)
- [ ] Busca de trilhas por nome ou categoria
- [ ] Progressão de trilhas básica
- [ ] CRUD do perfil do usuário

</details>

<details>
  <summary>Etapa 2: Interação social entre usuários</summary>

- [ ] Seguir/deixar de seguir usuários
- [ ] Comentários em trilhas públicas
- [ ] Possibilidade de curtir e salvar trilhas públicas
- [ ] Compartilhar trilhas públicas a partir do link

</details>

<details>
  <summary>Etapa 3: Gamificação</summary>

- [ ] Estudar fórmulas de XP e tracking de badges
- [ ] Adaptar documentação pensando em gamificação
- [ ] Sistema de XP
- [ ] Níveis de usuário
- [ ] Badges e conquistas
- [ ] Visualização de conquistas no perfil

</details>

<details>
  <summary>Etapa 4: Segurança e Moderação</summary>

- [ ] Denúncia de trilhas
- [ ] Denúncia deve ser revisada pelo lado administrativo do sistema
- [ ] Regras de visibilidade (privadas/públicas)

</details>

### Escopo pós-TCC:

**Poderá ser implementado antes da entrega do TCC a depender do progresso do sistema**

<details>
  <summary>Etapa 5: Aplicar Redis</summary>

- [ ] Estudar sobre Redis e como usá-lo no Nest
- [ ] Implementar Redis

</details>

<details>
  <summary>Etapa 6: Verificação para educadores</summary>

- [ ] Estudar bibliotecas para fazer upload e validação de arquivos de forma segura
- [ ] Avaliar se o usuário é um educador a partir de algum documento
- [ ] Estudar controle de permissões/roles
- [ ] Deve ser aceito pelo lado administrativo do sistema
- [ ] Painel administrativo básico
- [ ] Usuários verificados devem ganhar uma badge no seu perfil

</details>

<details>
  <summary>Etapa 7: Mensageria para grupos de estudo</summary>

- [ ] Estudar mensageria
- [ ] Adaptar documentação pensando em mensageria
- [ ] Aplicar mensageria básica
- [ ] Criação de grupos de estudo
- [ ] Gerenciamento de grupos de estudo básico

</details>

<details>
  <summary>Etapa 8: Refinamento e Extras</summary>

- [ ] Definição de termos de uso (focado em ser informativo)
- [ ] Limpeza final do código
- [ ] Análise arquitetural e de planos futuros para o projeto

</details>

<details>
  <summary>Etapa 9: Ánalise arquitetural do sistema</summary>

- [ ] Estudar sobre BFF e analisar se vale a pena implementar
- [ ] Analisar sobre arquitetura hexagonal e se vale a pena implementar
- [ ] Tomar uma decisão sobre a arquitetura
- [ ] Possível refatoração do código

</details> -->

<!-- <p>
  <strong>Observações:</strong>
  Após cada etapa será feita uma atualização nesse README, atualizando a etapa atual do projeto e outras possíveis mudanças necessárias.
</p> -->

<!-- > [!IMPORTANT]
> Algumas das etapas podem sofrer modificações durante o processo de desenvolvimento. -->

<!-- > Esse README será atualizado após cada etapa concluída. -->

<!-- >**Importante**: algumas das etapas podem sofrer modificações durante o processo de desenvolvimento. -->

<!-- ## Planos futuros:

<details>
  <summary>Etapa 1: Melhorar interação social</summary>

- [ ] Aprender sobre NoSQL
- [ ] Implementar feed de trilhas de usuários seguidos

</details>

<details>
  <summary>Etapa 2: Mensageria 1:1 e Grupos de estudo</summary>

- [ ] Estudar sobre mensageria avançada
- [ ] Estudar sobre notificações e histórico eficiente
- [ ] Histórico de mensagens apenas para participantes
- [ ] Salas de estudo com limites Free (5) / Premium (40)
- [ ] Melhorar gerenciamento (principalmente para premium)
- [ ] Mensageria melhorada (histórico, notificações)

</details>

<details>
  <summary>Etapa 3: Níveis de conta (free / premium)</summary>

- [ ] Estudar sobre processamento de pagamentos
- [ ] Criar funcionalidades premium para usuários
- [ ] Usuários premium podem criar grupos de estudo de até 40 pessoas
- [ ] Plano mensal para usuários premium (Sugestão: R$ 20,00)

</details>

<details>
  <summary>Etapa 4: Melhorar gamificação</summary>

- [ ] Estudar gamificação avançada
- [ ] Pensar em novas formas de gamificar o sistema
- [ ] Implementar a ideia

</details>

<details>
  <summary>Etapa 5: Planejar formas de utilizar IA</summary>

- [ ] Brainstorm de ideias
- [ ] Analisar e bater o martelo na melhor ideia
- [ ] Implementar a ideia

</details> -->

## Autor

<div align="center">
  <img src="https://github.com/genzo-dev.png" alt="Logo do Axion" width="160"/>
</div>

<div align="center">
  <strong>Gabriel Enzo (genzo-dev)</strong>
</div>

<div align="center">
  <sub>
    Fullstack web developer
  </sub>
</div>

&nbsp;

<div align="center">
  <a href="https://www.linkedin.com/in/gabriel-enzo-200403233/">💼 LinkedIn</a>
  |
  <a href="https://github.com/genzo-dev">🐙 GitHub</a>
</div>

---

<!-- ![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs)
![NestJS](https://img.shields.io/badge/NestJS-e0234e?logo=nestjs&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=fff)
![Docker](https://img.shields.io/badge/Docker-2496ed?logo=docker&logoColor=fff)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=000)
![Vitest](https://img.shields.io/badge/Vitest-D32F2F?logo=vitest&logoColor=fff)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=fff)
![Cypress](https://img.shields.io/badge/Cypress-04B431?logo=cypress&logoColor=fff)
![Figma](https://img.shields.io/badge/Figma-A259FF?logo=figma&logoColor=fff)
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=fff)
![Notion](https://img.shields.io/badge/Notion-000?logo=notion&logoColor=fff) -->
