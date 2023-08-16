const { headFactory } = require('../src/factory/head');
const { bodyFactory } = require('../src/factory/body');

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const minify = require('html-minifier').minify;

const {
	DUMP_SITE_TITLE = 'DUMP SITE DEFAULT TITLE',
	DUMP_SITE_DESCRIPTION = 'Dump site default description',
} = process.env;

const replaceEnvironmentVariables = (content) => {
	const regex = /{{(.*?)}}/g;
	return content.replace(regex, (name) => process.env[name.slice(2, -2)]);
};

const buildFile = async (srcPath, destPath) => {
	// read file on src path
	const fileContent = await readFile(srcPath, 'utf-8');

	const builtContent =
		headFactory(DUMP_SITE_TITLE, DUMP_SITE_DESCRIPTION) +
		bodyFactory(fileContent);

	const replacedContent = replaceEnvironmentVariables(builtContent);

	const minifiedContent = minify(replacedContent, {
		collapseWhitespace: true,
		trimCustomFragments: true,
		preserveLineBreaks: false,
	});

	await writeFile(destPath, minifiedContent, 'utf-8');
};

const buildFolder = async (srcPath, destPath) => {
	try {
		const sourceStats = await stat(srcPath);
		if (!sourceStats.isDirectory()) {
			throw new Error('Source path must be a directory');
		}

		await mkdir(destPath, { recursive: true });

		const items = await readdir(srcPath);

		for (const item of items) {
			const srcItemPath = path.join(srcPath, item);
			const destItemPath = path.join(destPath, item);
			const itemStats = await stat(srcItemPath);

			if (itemStats.isDirectory()) {
				await buildFolder(srcItemPath, destItemPath);
			} else if (path.extname(item) === '.html') {
				await buildFile(srcItemPath, destItemPath);
			}
		}

		console.log(`Folder copied from ${srcPath} to ${destPath}`);
	} catch (error) {
		console.error('Error:', error.message);
	}
};

(async () => {
	console.log('Building site...');

	const origin = path.join(__dirname, '../src/pages');
	const destination = path.join(__dirname, '../dist');
	console.log('Origin:', origin);
	console.log('Destination:', destination);

	buildFolder(origin, destination);

	console.log('Site built!');
})();
