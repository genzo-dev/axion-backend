# Mapeamento de Endpoints

> Este documento serve como base de mapeamento de todos os endpoints presentes no sistema.

---

## Status

> **Parcialmente implementado**. Cobre o módulo de autenticação e a criação de usuário.

## Endpoints

**Legenda:**

| SÍMBOLO | O QUE REPRESENTA |
| ------- | ---------------- |
| 🔓      | ABERTO           |
| 🔒      | FECHADO          |

### `/auth`

| Método  | Endpoint           | Acesso | Descrição                                                 |
| ------- | ------------------ | ------ | --------------------------------------------------------- |
| `POST`  | `/login`           | 🔓     | Login do usuário na plataforma (e-mail ou tag + senha)    |
| `POST`  | `/refresh`         | 🔓     | Refresh automático de access e refresh tokens             |
| `POST`  | `/verify`          | 🔓     | Valida a conta via código e retorna access/refresh tokens |
| `POST`  | `/resend-code`     | 🔓     | Reenvia novo código de verificação de e-mail              |
| `POST`  | `/forgot-password` | 🔓     | Envia link de redefinição de senha para o e-mail          |
| `POST`  | `/reset-password`  | 🔓     | Redefine a senha a partir do token recebido no link       |
| `PATCH` | `/change-password` | 🔒     | Altera a senha do usuário autenticado                     |

### `/users`

| Método | Endpoint | Acesso | Descrição                                             |
| ------ | -------- | ------ | ----------------------------------------------------- |
| `POST` | `/`      | 🔓     | Cria a conta do usuário e envia código de confirmação |
