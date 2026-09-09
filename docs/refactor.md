# Planejamento de refatoração do sistema

Este documento serve como base para o planejamento e acompanhamento de futuras refatorações no código. Nele devem ser registrados pontos identificados que possam ser melhorados, simplificados ou limpos, mesmo que a refatoração ainda não tenha sido realizada.

> O documento deve ser atualizado sempre que novos pontos de refatoração forem identificados ou quando alguma tarefa for concluída.

> Obs.: Caso o documento esteja vazio ou todas as tarefas de refatoração estejam marcadas como CONCLUÍDO (✅), significa que, até o momento, não há refatorações pendentes identificadas no estado atual do código.

**LEGENDA - Nível de prioridade:**

- 🟢 Baixa
- 🟡 Média
- 🔴 Alta

**LEGENDA - Status:**

- ⏳ Pendente
- 🔄 Em andamento
- ✅ Concluído

## Tabelas SQL (TypeORM):

### REFACTOR #1 (🔴) - Status: ⏳

- As tabelas do sistema devem ser normalizadas após a criação de um Diagrama de Entidade-Relacionamento (DER)

> Motivo: A estrutura atual concentra diferentes responsabilidades em algumas tabelas, aumentando a complexidade das queries e dificultando a manutenção e evolução do modelo de dados. A normalização deverá ser avaliada após a elaboração do DER.

## Auth Module

### REFACTOR #1 (🟡) - Status: ⏳

- Separar as funcionalidade envolvendo JWT em um `jwt.service.ts` ou `auth-jwt.service.ts` interno do sistema, o qual irá ser utilizado somente pelo `auth.service.ts` já existente.

> Motivo: Nota-se que o `auth-jwt.service.ts` possui dois tipos de responsabilidades: 1 - Cuidar das regras de negócio relacioandas a JWT no sistema de autenticação; 2 - Lidar com as próprias regras de negócio de autenticação. Dessa forma, existe a possibilidade de separar ambas em arquivos diferentes, tornando o código mais limpo e legível.

### REFACTOR #2 (🟢) - Status: ⏳

- Quebrar as funções em partes menores seguindo os conceitos do **Código Limpo** e os princípios **SOLID**.

> Motivo: Visto que algumas funções fazem diversas coisas distintas e pode prejudicar a leitura, a intenção dessa refatoração é tornar o código mais legível e manutenível.

#### Observações:

- Após as refatorações acima, deve ser revisado novamente a possibilidade de refatoração do código, levando em consideração que ele possa não estar tão limpo. Não deve ser exigido cumprir todas as exigências do **Código Limpo**, mas procurar uma maneira de deixá-lo mais sustentável

## Users Module

#### REFACTOR 1 (🟡) - Status: ⏳

- A função `async create(createUserDto)` deve ser quebrada em partes menores, visto que ela está fazendo diversas coisas
