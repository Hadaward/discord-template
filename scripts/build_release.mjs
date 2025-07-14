import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import obfuscator from "javascript-obfuscator";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { promisify } from "node:util";
import { parse } from "@dotenvx/dotenvx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const run = promisify(exec);

const DIST_DIR = path.join(__dirname, "..", "dist");
const ENTRY_FILE = path.join(DIST_DIR, "index.js");
const RESOURCES_DIR = path.join(__dirname, "..", "dist", "resources");
const OUTPUT_FILE = path.join(__dirname, "..", "release", "index.js");
const RELEASE_DIR = path.join(__dirname, "..", "release");
const PKG_SRC = path.join(__dirname, "..", "package.json");
const PKG_DEST = path.join(RELEASE_DIR, "package.json");

async function injectEnvVarsInDir(dir, env) {
	const entries = await readdir(dir, { withFileTypes: true });

	await Promise.all(entries.map(async (entry) => {
		const full = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (entry.name === "node_modules") {
				// Ignora node_modules
				return;
			}
			await injectEnvVarsInDir(full, env);
		} else if (entry.name.endsWith(".js")) {
			let content = await readFile(full, "utf-8");

			for (const [ key, value ] of Object.entries(env)) {
				// substitui por string JSON segura
				const literal = JSON.stringify(value);
				const regex = new RegExp(`process\\.env\\.${key}\\b`, "gu");

				content = content.replace(regex, literal);
			}

			await writeFile(full, content);
		}
	}));
}

async function copyDir(src, dest) {
	const entries = await readdir(src, { withFileTypes: true });

	await mkdir(dest, { recursive: true });
	await Promise.all(entries.map(async (entry) => {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath);
		} else {
			await writeFile(destPath, await readFile(srcPath));
		}
	}));
}

async function obfuscateDir(dir) {
	const entries = await readdir(dir, { withFileTypes: true });

	await Promise.all(entries.map(async (entry) => {
		const full = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (entry.name === "node_modules") {
				// Ignora node_modules
				return;
			}
			await obfuscateDir(full);
		} else if (entry.name.endsWith(".js")) {
			const code = await readFile(full, "utf-8");
			const obfuscated = obfuscator.obfuscate(
				code,
				{
					compact: true,
					controlFlowFlattening: true,
					controlFlowFlatteningThreshold: 0.75,
					deadCodeInjection: true,
					deadCodeInjectionThreshold: 0.4,
					selfDefending: true,
					stringArray: true,
					stringArrayEncoding: [ "rc4" ],
					stringArrayWrappersType: "function",
					stringArrayThreshold: 0.75,
					simplify: true,
					target: "node",
					identifierNamesGenerator: "hexadecimal",
					renameGlobals: false,
					renameProperties: false,
				},
			).toString();

			await writeFile(full, obfuscated);
		}
	}));
}

(async () => {
	console.log("🛠️   1. Compilando projeto com TypeScript...");
	await run("npm run build");

	console.log("📦  2. Gerando bundle ESM com esbuild...");
	await run(`npx esbuild ${ENTRY_FILE} --bundle --platform=node --format=esm --packages=external --outfile=${OUTPUT_FILE}`);

	console.log("📁  3. Copiando pasta resources para release...");
	await copyDir(RESOURCES_DIR, path.join(RELEASE_DIR, "resources"));

	console.log("🌱  4. Lendo variáveis do .env...");
	const env = parse(await readFile(path.join(__dirname, "..", ".env")));

	console.log("🧬  5. Injetando process.env.[VAR] como valores literais em release...");
	await injectEnvVarsInDir(RELEASE_DIR, env);

	console.log("🔒  6. Ofuscando arquivos na pasta release...");
	await obfuscateDir(RELEASE_DIR);

	console.log("📦  7. Gerando package.json limpo para release...");
	const pkgRaw = await readFile(PKG_SRC, "utf-8");
	const pkg = JSON.parse(pkgRaw);
	const pkgRelease = {
		name: pkg.name,
		version: pkg.version,
		description: pkg.description,
		license: pkg.license,
		author: pkg.author,
		type: pkg.type,
		main: "./index.js",
		scripts: { start: "node index.js" },
		engines: pkg.engines,
		dependencies: pkg.dependencies,
	};

	await writeFile(PKG_DEST, JSON.stringify(pkgRelease, null, 2));

	console.log("✅ Build concluído com sucesso.");
})();
