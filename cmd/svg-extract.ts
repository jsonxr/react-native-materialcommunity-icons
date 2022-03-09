import path from 'path';
import fs from 'fs/promises';
import { readdir } from 'fs/promises';
import { upperFirst, camelCase } from 'lodash';
import format from 'xml-formatter';
import PromisePool from 'es6-promise-pool';
import { REPO_DIR } from './constants';

type TMIcon = {
  name: string;
  path: string;
  variants: Record<string, string>;
};

const writeIndexFile = async (icons: TMIcon[], root: string) => {
  const files = icons.map((i) => `export * from './${i.name}';`);
  const content = files.join('\n') + '\n';
  await fs.writeFile(path.resolve(`${root}/index.ts`), content);
};

const writeTsxFile = async ({ name, variants, ...icon }: TMIcon, root: string) => {
  let content = `// ${icon.path}\nimport { createSvgIcon } from './createSvgIcon';\n\n`;

  if (Object.keys(variants).length === 1) {
    const svg = variants[Object.keys(variants)[0]];
    const pretty = format(svg, { indentation: '  ' }).split('\n').join('\n  ');

    content += `export const ${name} = createSvgIcon(\n  \`${pretty}\`\n);\n\n`;
  } else {
    // Write the variants version...
    content = '';
  }

  //console.log(content);
  await fs.writeFile(path.resolve(`${root}/${name}.tsx`), content);
};

type VariantsFn = (dir: string) => Promise<Record<string, string>>;

const getIconList = async (directory: string, getIconVariants: VariantsFn): Promise<TMIcon[]> => {
  const directories = await readdir(directory);
  const icons = await Promise.all(
    directories.map(async (d) => {
      const baseName = path.basename(d, '.svg');
      return {
        name: `Svg${upperFirst(camelCase(baseName))}`,
        path: `svg/${d}`,
        variants: await getIconVariants(path.join(directory, d)),
      };
    })
  );
  return icons;
};

const getIconVariants = async (dir: string): Promise<Record<string, string>> => ({
  default: await fs.readFile(dir, { encoding: 'utf-8' }),
});

async function main() {
  const directory = path.resolve(path.join(REPO_DIR, 'svg'));
  const icons: TMIcon[] = await getIconList(directory, getIconVariants);

  const ROOT = 'icons';
  const generatePromises = function* () {
    for (const icon of icons) {
      yield writeTsxFile(icon, ROOT);
    }
  };
  const iterator: any = generatePromises();
  const pool = new PromisePool(iterator, 3);
  await pool.start();

  writeIndexFile(icons, ROOT);
}

main();
