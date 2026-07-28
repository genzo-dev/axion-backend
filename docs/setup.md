# Setup

> Esse documento retrata todo o setup do projeto, incluindo seus pré-requisitos e como rodar.

---

## Pré-requisitos

- Docker
- Docker Compose

## Variáveis de Ambiente

Cada ambiente possui suas próprias variáveis de ambiente, localizados em `.envs/`:

| Ambiente | Arquivo              |
| -------- | -------------------- |
| Dev      | `.envs/.env.dev`     |
| Staging  | `.envs/.env.staging` |
| Test     | `.envs/.env.test`    |

> Convém copiar dos arquivos `.env.*-EXAMPLE` caso necessário.

## Ambientes

O projeto está dividido em três ambientes com suas próprias configurações:

### Desenvolvimento

- Hot-reload com nest start --watch
- Código montado via bind mount (alterações refletem em tempo real)
- PostgreSQL com volume persistente pgdata-dev
- App em http://localhost:3001
- PostgreSQL em localhost:5432

### Staging

- Roda o build otimizado (node dist/main.js)
- Sem watch mode — código compilado estático
- PostgreSQL com volume persistente pgdata-staging
- App em http://localhost:3001
- PostgreSQL em localhost:5434

### Testes E2E

- Sobe o app com npm run test:e2e
- PostgreSQL efêmero (tmpfs) — dados são descartados ao final
- Container é derrubado automaticamente após os testes

### Portas

| Serviço    | Dev   | Staging | Test  |
| ---------- | ----- | ------- | ----- |
| App        | :3001 | :3001   | :3001 |
| PostgreSQL | :5432 | :5434   | :5432 |

> Apenas um ambiente por vez — portas do app conflitam entre ambientes.

## Como rodar cada ambiente:

### Ambiente de Desenvolvimento

#### 1. Copie as variáveis de ambiente de desenvolvimento:

```bash
cp .envs/.env.dev-EXAMPLE .envs/.env.dev
```

#### 2. Rode o projeto via docker compose:

```bash
npm run docker:dev
```

### Ambiente de Testes

#### 1. Copie as variáveis de ambiente de testes:

```bash
cp .envs/.env.test-EXAMPLE .envs/.env.test
```

#### 2. Rode o projeto via docker compose:

```bash
npm run docker:test:e2e
```

#### Para rodar os testes unitários, utilize:

```bash
npm run test
```

### Ambiente de Staging

#### 1. Copie as variáveis de ambiente de staging:

```bash
cp .envs/.env.staging-EXAMPLE .envs/.env.staging
```

#### 2. Rode o projeto via docker compose:

```bash
npm run docker:staging
```

> [!NOTE]
>
> Os comandos sobem apenas o contêiner app e o postgres. Para ver logs completos, use `docker compose logs -f app`.

## Comandos Úteis

#### Parar contêineres

```bash
npm run docker:dev # Ctrl+C
```

#### Rebuild forçado (sem cache)

```bash
npm run docker:dev -- --build
```

#### Ver logs de um serviço específico

```bash
docker compose logs -f app
```

#### Acessar o banco via CLI

```bash
docker compose exec postgres psql -U <user> -d <database>
```

#### Limpar volumes (dados dos bancos)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```
