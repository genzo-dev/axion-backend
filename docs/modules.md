# Mapeamento de Módulos

> Este documento serve como base de mapeamento de todos os módulos presentes no sistema,
> incluindo explicações detalhadas e decisões técnicas de cada módulo.

---

## Status

> **Em construção**. Este documento será completado conforme os módulos forem criados.

## Módulos implementados

### AppModule

O módulo em questão serve para a configuração base de todo o projeto, assim como configurações gerais, incluindo também a base de dados (por meio do TypeOrm).

- **Função:** Módulo raiz da aplicação
- **Providers:** AppService
- **Controllers:** AppController
- **Imports:** ConfigModule, TypeOrmModule
- **Validação:** Schema de variáveis de ambiente validado com Joi

As variáveis de ambiente (`DATABASE_*`) são validadas na inicialização pelo Joi, impedindo o app de subir com configurações inválidas.

### AuthModule - (**Status**: Concluído)

O módulo em questão é responsável por toda a parte de autenticação da plataforma Axion, contando com login, confirmação de conta, redefinição de senhas, entre outras funcionalidades.

- **Função:** Módulo de autenticação da aplicação
- **Providers:** AuthService, HashingService (useClass: BscryptService)
- **Controllers:** AuthController
- **Imports:** ConfigModule (jwtConfig, resetPasswordConfig e emailCodeConfig), TypeOrmModule, EmailModule, JwtModule

#### Funcionalidades em geral:

- Login via e-mail ou tag (@genzo_dev) e senha;
- Confirmação de conta via código enviado para o e-mail cadastrado com reenvio de código (`/resend-code`);
- Geração de access e refresh token, com JWT e função para regerar novos tokens (`/refresh`);
- Redefinição de senha (usuário não logado) a partir de um link enviado pelo endpoint `/forgot-password`;
- Alteração de senha (usuário logado).

#### Possíveis melhorias:

- Login a partir do Google (OAuth), gerando access e refresh tokens que podem ser utilizados no sistema;
- Adição de um `tokenVersion`, garantindo que o usuário não consiga relogar com o mesmo token em casos de alteração de senha.
- Refatoração focada em limpeza de código e separação de responsabilidade (funções envolvendo JWT podem ser realoacadas para um novo service);

#### Decisões técnicas:

**1. Sobre o endpoint `/reset-password`:**

Utiliza um JWT dedicado, diferente do JWT padrão criado para os tokens de autenticação (access e refresh), assim como as próprias variáveis de ambiente (secret, audience e issuer - localizados no `src/auth/config/reset-password.config.ts`) e são enviados por link no e-mail. Dessa forma, isolando os fluxos de reset e autenticação, logo, um possível vazamento de acesso não compromete os links de reset e vice-versa.

**2. Sobre o HashingService:**

O HashingService é uma interface injetada no módulo com `useClass: BscryptService`, permitindo trocar o algoritmo facilmente. Em outras palavras, devido sua abstração, posso trocar apenas a biblioteca, alterando um único ponto do código no sistema.

**3. Sobre os identificadores JWT (jti):**

O sistema utiliza _JSON Web Token IDs_ (jti) para rastreamento e revogação de tokens sensíveis. Cada fluxo crítico possui seu próprio identificador armazenado na entidade `User`:

`refreshToken`:

- **Geração**: a cada emissão de par de tokens (`createTokens()`), um `jti` aleatório (UUID v4) é criado.
- **Armazenamento**: salvo simultaneamente no claim `jti` do _refresh token_ JWT e no campo `User.refreshTokenJti`.
- **Validação**: ao processar `/refresh`, o serviço extrai o `jti` do token apresentado e compara com `User.refreshTokenJti`. Tokens só são reemitidos se houver correspondência exata, invalidando automaticamente _refresh tokens_ anteriores.

`resetPasswordJti`

- **Geração**: ao solicitar recuperação de senha (`forgotPassword()`), um `jti` aleatório é criado.
- **Armazenamento**: salvo no claim `jti` do _reset password token_ JWT e no campo `User.resetPasswordJti`.
- **Validação e consumo único**: o endpoint `/reset-password` busca o usuário por `uuid` **e** `resetPasswordJti` (consulta composta). Após validação bem-sucedida, o campo `User.resetPasswordJti` é definido como `null`, tornando o token permanentemente inválido. Novo fluxo exige nova solicitação via `/forgot-password`.

### UsersModule - (**Status**: Em construção)

O módulo em questão serve para todos os métodos focados estritamente ao usuário, como criação de conta, alteração de seus dados, exclusão da conta, entre outros.

- **Função:** Gerenciamento de dados do usuário
- **Providers:** UsersService
- **Controllers:** UsersController
- **Imports:** ConfigModule, TypeOrmModule, AuthModule, EmailModule

#### Funcionalidades em geral:

- Criação de conta do usuário, com envio de código para confirmação da conta via e-mail.
