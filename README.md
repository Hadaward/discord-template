# Discord.js Bot Template

A basic Discord bot template built with [discord.js](https://discord.js.org/), featuring integration with MySQL and SQLite, environment variable configuration, and interactive commands.

---

## 📦 Requirements

- [Node.js](https://nodejs.org/) **v20.16.0 or higher**
- [npm](https://www.npmjs.com/)
- Configured MySQL server (optional, for persistent data)
- Discord bot registered with appropriate permissions

---

## 🚀 Installation

```bash
git clone https://github.com/your-username/discordjs-bot-template.git
cd discordjs-bot-template
npm install
```

---

## ⚙️ Configuration

1. Copy the `.env.default` file as a base:

```bash
cp .env.default .env
```

2. Fill in the variables in the `.env` file:

```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DEPLOY_COMMANDS=false
```

---

## 💻 Available Scripts

| Script           | Description                                 |
|------------------|---------------------------------------------|
| `npm start`      | Starts the bot in production mode           |
| `npm run dev`    | Development mode with hot-reload            |
| `npm run build`  | Compiles the code to the `dist/` directory  |
| `npm run format` | Formats code using ESLint                   |
| `npm run lint`   | Runs lint checks                            |

---

## 🧪 Database

This project supports:

- **MySQL** — For persistent user data.
- **SQLite** (`bot.db`) — For local data storage.

---

## 📁 Project Structure

```
src/
├── client/               # Discord integration (bot, commands, buttons)
├── server/               # Server communication (optional)
├── common/               # Database, types, initialization, utilities
├── resources/commands/   # Discord commands
├── index.ts              # Main entry point
```

---

## 🛠 Development

Run the bot in development mode with hot-reload:

```bash
npm run dev
```

This command automatically compiles and restarts the bot when `.ts` files are saved.

---

## 📄 License

Distributed under the [MIT](LICENSE) license.

---

## ✨ Author

Developed by **Your Name**.
