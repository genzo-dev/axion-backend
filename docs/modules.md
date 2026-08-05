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
- Refatoração focada em limpar o código, diminuindo tamanho das funções e facilitando sua leitura.

#### Decisões técnicas:

**1. Sobre o endpoint `/reset-password`:**

Utiliza um JWT dedicado, diferente do JWT padrão criado para os tokens de autenticação (access e refresh), assim como as próprias variáveis de ambiente (secret, audience e issuer - localizados no `src/auth/config/reset-password.config.ts`) e são enviados por link no e-mail. Dessa forma, isolando os fluxos de reset e autenticação, logo, um possível vazamento de acesso não compromete os links de reset e vice-versa.

**2. Sobre o HashingService:**

O HashingService é uma interface injetada no módulo com `useClass: BscryptService`, permitindo trocar o algoritmo facilmente. Em outras palavras, devido sua abstração, posso trocar apenas a biblioteca, alterando um único ponto do código no sistema.

### UsersModule - (**Status**: Em construção)

O módulo em questão serve para todos os métodos focados estritamente ao usuário, como criação de conta, alteração de seus dados, exclusão da conta, entre outros.

- **Função:** Gerenciamento de dados do usuário
- **Providers:** UsersService
- **Controllers:** UsersController
- **Imports:** ConfigModule, TypeOrmModule, AuthModule, EmailModule

#### Funcionalidades em geral:

- Criação de conta do usuário, com envio de código para confirmação da conta via e-mail.
