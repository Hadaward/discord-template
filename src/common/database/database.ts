import chalk from "chalk";
import mysql from "mysql2/promise";
import "@/common/database/local";

let database: mysql.Connection | null = null;

export async function initializeDatabase() {
	console.log(chalk.blueBright("> Connecting to the database..."));

	database = await mysql.createConnection({
		host: process.env.DATABASE_HOST,
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		database: process.env.DATABASE_NAME,
		port: Number(process.env.DATABASE_PORT),
	});

	console.log(chalk.green("> Database connected successfully."));
}

export function getDatabase(): mysql.Connection {
	if (!database) {
		throw new Error(`[${chalk.yellow("database.getDatabase")}] Unable to access the database. Please ensure it is initialized by calling ${chalk.cyan("initializeDatabase()")} first.`);
	}

	return database;
}
