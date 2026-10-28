import {readdirSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {mdsvex} from 'mdsvex';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({
  root,
  configFile: false,
  logLevel: 'warn',
  resolve: {alias: {'#lib': join(root, 'src/lib')}},
  plugins: [svelte({
    configFile: false,
    extensions: ['.svelte', '.svx'],
    preprocess: mdsvex({
      extensions: ['.svx'],
      layout: {runbook: join(root, 'src/lib/layouts/runbook.svelte')},
    }),
    compilerOptions: {css: 'injected', dev: false},
    emitCss: false,
  })],
  server: {middlewareMode: true, hmr: false, ws: false, watch: null},
  ssr: {noExternal: ['svelte']},
});

const walk = dir => readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(join(dir,e.name)) : [join(dir,e.name)]);
try {
  const {render} = await server.ssrLoadModule('svelte/server');
  const results = [];
  for (const filename of walk(join(root, 'src/routes/kb')).filter(f => f.endsWith('+page.svx')).sort()) {
    const module = await server.ssrLoadModule('/' + relative(root, filename));
    const result = render(module.default);
    const output = join(root, 'rendered', relative(join(root,'src/routes'), dirname(filename)), 'index.html');
    mkdirSync(dirname(output), {recursive:true});
    const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${result.head}</head><body>${result.body ?? result.html}</body></html>\n`;
    writeFileSync(output, html);
    const refs = [...new Set(html.match(/DR-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}/g) ?? [])];
    results.push({source:relative(root,filename),html:relative(root,output),title:module.metadata.title,signature:module.metadata.signature ?? null,deskRefs:refs});
    console.log(relative(root, output));
  }
  mkdirSync(join(root,'evidence'), {recursive:true});
  writeFileSync(join(root,'evidence/render-summary.json'), JSON.stringify(results,null,2)+'\n');
} finally {
  await server.close();
}
