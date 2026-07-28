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

As variáveis de ambiente (`DATABASE_*`, `NODE_ENV`) são validadas na inicialização pelo Joi, impedindo o app de subir com configurações inválidas.
