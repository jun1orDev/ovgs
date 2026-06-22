# OVGS - Sistema de Gestão de Ordens de Venda

Projeto full stack do desafio técnico de Sistema de Gestão de Ordens de Venda.

## Stack

- Node.js
- TypeScript
- NestJS
- React + Vite
- PostgreSQL
- Prisma ORM

## Execução local

> Pré-requisitos:
> - Node.js `24.17.0` ou superior.
> - npm `11.13.0` ou superior.
> - Docker com Docker Compose instalado.
>
> O banco PostgreSQL roda em `localhost:15432` para evitar conflito com outros projetos que estejam usando a porta padrão `5432`.
> A API roda em `localhost:3101` para evitar conflito com projetos usando portas comuns como `3000` ou `3001`.

```bash
# Instala as dependências do monorepo e dos workspaces apps/api e apps/web.
npm install

# Cria o arquivo .env da API a partir do modelo.
# O arquivo apps/api/.env é usado pelo Prisma/NestJS para conectar no banco.
cp apps/api/.env.example apps/api/.env

# Sobe o PostgreSQL em container.
# A porta externa foi configurada como 15432, mapeada para a porta interna 5432.
npm run compose:up

# Gera o cliente Prisma, aplica as migrations e popula o banco com dados iniciais.
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Inicia API NestJS e frontend React/Vite em paralelo.
npm run dev
```
API: <http://localhost:3101/api>  
Web: <http://localhost:5173>  
Swagger: <http://localhost:3101/api/docs>

### Comandos auxiliares

```bash
# Para os servidores de desenvolvimento.
npm run dev

# Para subir apenas a API.
npm run api:dev

# Para subir apenas o frontend.
npm run web:dev

# Para gerar novamente o cliente Prisma.
npm run prisma:generate

# Para aplicar migrations no banco.
npm run prisma:migrate

# Para popular o banco com dados iniciais.
npm run prisma:seed

# Para parar o container do PostgreSQL.
npm run compose:down

# Para executar todos os testes.
npm test

# Para executar todos os builds.
npm run build
```

## Testes

```bash
npm test
```

## Deploy no Render.com

O projeto está deployado no Render.com com os seguintes serviços:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | <https://ovgs-web.onrender.com> | Interface React/Vite |
| **API (Swagger)** | <https://ovgs.onrender.com/api/docs> | Documentação OpenAPI/Swagger |
| **Banco (PgHero)** | <https://pghero-dpg-d8s5jgr6sc1c73c2k120-a.onrender.com> | Monitoramento do PostgreSQL |

![Serviços no Render.com](https://via.placeholder.com/800x400/1e293b/ffffff?text=Render.com+Services%3A+Frontend%2C+API%2C+PostgreSQL)

> **Nota**: O plano gratuito do Render pode hibernar serviços após 15 min de inatividade. A primeira requisição pode levar 30-60s para "acordar" o serviço.

## Funcionalidades implementadas

- Cadastro de clientes, tipos de transporte e itens.
- Criação, listagem, detalhamento e transição de status de ordens de venda.
- Validação de autorização do cliente por tipo de transporte.
- Agendamento e reagendamento de ordens.
- Monitoramento operacional por status, cliente, transporte e período.
- Auditoria dos eventos relevantes de ordem de venda.
- Testes unitários para regras de transição de status.

## Decisões arquiteturais

- **Monorepo com npm workspaces**: separação clara entre `apps/api` (NestJS) e `apps/web` (React/Vite), compartilhando configurações de lint, TypeScript e scripts de build/test.
- **Arquitetura em camadas no backend**: `application` (controllers, DTOs), `domain` (services, entities, enums, exceptions), `infrastructure` (Prisma, config), `shared` (filters, pipes, guards). Isso isola regras de negócio de detalhes de framework e facilita testes.
- **API REST com validação global**: `ValidationPipe` global com `whitelist` e `forbidNonWhitelisted`; DTOs usam `class-validator`/`class-transformer`.
- **Tratamento de erros centralizado**: `PrismaExceptionFilter` mapeia erros P2003/P2002 para exceções de negócio claras (400/409) em vez de 500 genérico.
- **Frontend com React Router v7**: rotas aninhadas para cadastros (`/cadastros/*`), layout com sidebar responsiva e toggle mobile.
- **CSS modular por feature**: `index.css` importa apenas `base`, `layout`, `components` e arquivos por tela (`dashboard.css`, `sales-orders.css`, `monitoring.css`, etc.), evitando CSS global inchado.
- **Tipagem compartilhada**: tipos de domínio em `apps/web/src/types/ovgs.ts` espelham contratos da API, garantindo type-safety ponta a ponta.

## Estratégia de modelagem do domínio

- **Entidades centrais**: `Client`, `TransportType`, `Item`, `SalesOrder`, `SalesOrderItem`, `ClientTransportType`, `AuditEvent`.
- **Value Objects / Enums**: `OrderStatus` (CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE) com transições validadas em `OrderStatusTransitionService` (single source of truth).
- **Regras de negócio encapsuladas em Services**: criação de ordem valida cliente, transporte autorizado, itens ativos, número sequencial `OV-000001`; agendamento valida janela 08:00–18:00; alteração de transporte só em CRIADA/PLANEJADA.
- **Auditoria como entidade separada**: `AuditEvent` registra `entityType`, `entityId`, `action`, `previousState`, `nextState`, `createdAt` — JSON apenas para snapshots, não para relacionamentos.
- **Autorização cliente-transporte**: tabela `ClientTransportType` (unique `clientId+transportTypeId`) garante que só transportes autorizados possam ser usados em ordens.

## Estratégia de persistência

- **PostgreSQL 16** via Docker Compose (porta externa 15432, interna 5432).
- **Prisma ORM** com schema declarativo (`prisma/schema.prisma`):
  - Índices em campos de filtro frequente (`status`, `clientId`, `transportTypeId`, `deliveryDate`, `createdAt`).
  - Constraints únicas: `SalesOrder.number`, `ClientTransportType(clientId, transportTypeId)`, `SalesOrderItem(salesOrderId, itemId)`, `Client.document/email` (unique quando preenchidos).
  - Relacionamentos com `onDelete: Cascade` onde apropriado (ex.: `SalesOrderItem → SalesOrder`, `ClientTransportType → Client/TransportType`).
- **Migrations versionadas** (`prisma migrate dev`) — histórico de schema no repositório.
- **Seed idempotente** (`prisma/seed.ts`) cria dados de demonstração (transportes, cliente, autorizações, itens, ordem `OV-000001`) usando `upsert` para rodar múltiplas vezes sem duplicar.

## Considerações sobre escalabilidade

- **Stateless API**: NestJS roda sem estado em memória; múltiplas réplicas podem ser escaladas horizontalmente atrás de load balancer.
- **Banco de dados**: PostgreSQL suporta read replicas para consultas de monitoramento/listagem; escritas concentradas no primary.
- **Paginação obrigatória** em listagens (`page`/`pageSize` máx 100) evita payloads grandes e OOM.
- **Índices compostos** planejados para queries de monitoramento (ex.: `(status, clientId, createdAt)`).
- **Cache futuro**: endpoints de monitoramento e listagens são candidatos a Redis (TTL curto) para aliviar DB em picos.
- **Webhooks/Eventos**: auditoria já registra eventos; pode evoluir para outbox pattern + message broker (Kafka/RabbitMQ) para integrações assíncronas.

## Considerações sobre performance

- **Queries otimizadas**: `findAll` e `findMonitoringSummary` usam `buildWhere` único e `Promise.all` para `count` + `groupBy` em uma transação.
- **Select explícito** em `findExistingItems` e listagens evita over-fetching de campos grandes.
- **Frontend**: lazy loading de rotas (code-splitting automático do Vite), imagens do hero otimizadas (Unsplash CDN com `w=1200&q=80`), CSS modular sem runtime-injection.
- **Bundle size**: dependências mínimas no frontend (React, React Router, Vite); sem UI kits pesados.
- **Validação de janela de agendamento** compartilhada (`schedule-window.ts`) evita duplicação e garante consistência entre backend/frontend.

## Trade-offs assumidos

- **Autenticação/Autorização simplificada**: não há JWT, RBAC ou multi-tenancy no escopo atual; endpoints abertos. Em produção, adicionar `AuthModule` (JWT + Passport), guards de permissão e `userId` na auditoria.
- **Validação de SKU no frontend + backend**: normalização `SKU-` duplicada nos dois lados para UX imediata + garantia de integridade; poderia ser centralizada em lib compartilhada.
- **Sem testes E2E**: apenas unitários para `OrderStatusTransitionService`. Cobertura de integração (Supertest) e E2E (Playwright/Cypress) seria uma ótima alternativa.
- **Seed com dados fixos**: facilita demo/local, mas não substitui factory/fixture para testes automatizados.
- **Portas não padrão** (API 3101, DB 15432) evitam conflitos em máquina de dev, já documentado.
- **CSS-in-JS não usado**: opção por CSS Modules/arquivos estáticos para simplicidade e zero runtime; perde escopo dinâmico de tema, mas ganha performance e DX.
- **Auditoria síncrona**: `AuditService.create` roda na mesma transação da operação; em alto volume, mover para outbox/async evitaria latência extra.
