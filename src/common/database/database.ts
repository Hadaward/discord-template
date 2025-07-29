import mysql from "mysql2/promise";
import "@/common/database/local";
import chalk from "chalk";

let pool: mysql.Pool | null = null;

export async function initializeDatabase() {
    console.log(chalk.blueBright("> Connecting to the database..."));

    pool = mysql.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        port: Number(process.env.DATABASE_PORT),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

    console.log(chalk.green("> Database connected successfully."));
}

export function getDatabase(): mysql.Pool {
    if (!pool) {
        throw new Error(`[${chalk.yellow("database.getDatabase")}] Unable to access the database. Please ensure it is initialized by calling ${chalk.cyan("initializeDatabase()")} first.`);
    }

    return pool;
}