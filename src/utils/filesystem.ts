import { readdir } from "fs/promises";
import { Dirent } from "fs";
import { join } from "path";

export async function recursiveReadDir(path: string, predicate?: (entry: Dirent<string>) => boolean): Promise<string[]> {
	try {
		const entries = await readdir(path, { withFileTypes: true });
		const files: string[] = [];

		const dirPromises: Promise<string[]>[] = [];

		for (const entry of entries) {
			const fullPath = join(path, entry.name);

			if (entry.isDirectory()) {
				dirPromises.push(recursiveReadDir(fullPath, predicate));
			} else if (entry.isFile() && (!predicate || predicate(entry))) {
				files.push(fullPath);
			}
		}

		const nestedFilesArrays = await Promise.all(dirPromises);

		for (const nestedFiles of nestedFilesArrays) {
			files.push(...nestedFiles);
		}

		return files;
	} catch (error) {
		console.error(`Error reading directory ${path}:`, error);

		return [];
	}
}
