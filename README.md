# DarkMice Bot

Bot do Discord feito para o servidor de Transformice privado **DarkMice**, com integração ao servidor, banco de dados e funcionalidades como verificação, vinculação e comandos interativos.

---

## 📦 Requisitos

- [Node.js](https://nodejs.org/) **v20.16.0 ou superior**
- [npm](https://www.npmjs.com/)
- Servidor MySQL configurado
- Bot registrado no Discord com permissões adequadas
- Servidor DarkMice configurado

---

## 🚀 Instalação

```bash
git clone https://github.com/TFM-DarkMice/darkmice-bot.git
cd darkmice-bot
npm install
```

---

## ⚙️ Configuração

1. Copie o arquivo `.env.default` como base:

```bash
cp .env.default .env
```

2. Preencha as variáveis no arquivo `.env`:

```env
# Token do bot do Discord
DISCORD_TOKEN=

# ID do cliente e do servidor Discord
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=

# ID do canal de vinculação e cargo de verificação
DISCORD_LINKING_CHANNEL_ID=
DISCORD_VERIFIED_ROLE_ID=

# Categoria de DM para mensagens simuladas
DISCORD_GUILD_DM_CATEGORY_ID=

# Habilita ou não o deploy automático de comandos
DEPLOY_COMMANDS=false

# Configurações do banco de dados MySQL
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_HOST=localhost
DATABASE_NAME=darkmice
DATABASE_PORT=3306

# Configurações do servidor DarkMice
DARKMICE_AUTH_KEY=
DARKMICE_SERVER_ADDRESS=localhost
DARKMICE_SERVER_PORT=11801
```

---

## 💻 Scripts disponíveis

| Script           | Descrição                                        |
|------------------|--------------------------------------------------|
| `npm start`      | Inicia o bot em modo produção                    |
| `npm run dev`    | Modo desenvolvimento com hot-reload             |
| `npm run build`  | Compila o código para `dist/`                    |
| `npm run format` | Formata o código com ESLint                      |
| `npm run lint`   | Verifica problemas de lint                       |

---

## 🧪 Banco de dados

Este projeto usa:

- **MySQL** — Para persistência dos dados dos jogadores.
- **SQLite** (`darkmice.db`) — Para dados locais.

---

## 📁 Estrutura do projeto

```
src/
├── client/               # Integração com Discord (bot, comandos, botões)
├── server/               # Comunicação com o servidor DarkMice
├── common/               # Banco de dados, tipos, inicialização e utilitários
├── resources/commands/   # Comandos disponíveis no Discord
├── index.ts              # Ponto de entrada principal
```

---

## 🛠 Desenvolvimento

Execute o bot com hot-reload para desenvolvimento:

```bash
npm run dev
```

Esse comando compila e reinicia o bot automaticamente ao salvar arquivos `.ts`.

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).

---

## ✨ Autor

Desenvolvido por **Gamedroit** para o servidor privado **DarkMice**.
