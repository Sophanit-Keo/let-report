// Build: npm run build          -> writes the finished site to dist/
// Dev:   npm run dev      -> http://localhost:5173 (also on your Wi-Fi IP, for testing on phones)
import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';

const serve = process.argv.includes('--serve');
const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);          // run from the project folder, wherever it's called from
const out = 'dist';

// Supabase settings: from the environment (Vercel project settings) or a local .env file.
function loadEnv() {
  const env = {};
  for (const f of ['.env', '.env.local']) {
    try {
      readFileSync(f, 'utf8').split(/\r?\n/).forEach(line => {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      });
    } catch (e) { /* no file */ }
  }
  return { ...env, ...process.env };
}
const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) console.warn('\n  ⚠  SUPABASE_URL / SUPABASE_ANON_KEY not set: the app will show "Not connected to a database yet".\n');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync('public', out, { recursive: true });
const html = readFileSync('index.html', 'utf8').replaceAll('%V%', Date.now().toString(36));
writeFileSync(`${out}/index.html`, html);
// service worker gets the same version, so a new deploy replaces the old cache
const version = html.match(/app\.js\?v=([a-z0-9]+)/)[1];
writeFileSync(`${out}/sw.js`, readFileSync('public/sw.js', 'utf8').replaceAll('%V%', version));

const options = {
  entryPoints: { app: 'src/main.jsx' },
  bundle: true,
  outdir: out,
  format: 'iife',               // classic script: also works when index.html is opened straight from disk
  minify: !serve,
  sourcemap: serve,
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  // Chrome/Edge/Samsung Internet, Safari on iPhone/iPad (iOS 14.5+), Firefox — about 5 years back
  target: ['chrome87', 'edge88', 'firefox78', 'safari14.1', 'ios14.5'],
  define: {
    'process.env.NODE_ENV': JSON.stringify(serve ? 'development' : 'production'),
    __SUPABASE_URL__: JSON.stringify(SUPABASE_URL),
    __SUPABASE_ANON_KEY__: JSON.stringify(SUPABASE_ANON_KEY),
  },
  logLevel: 'info',
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: out, port: 5173, host: '0.0.0.0' });
  const ips = Object.values(networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
  console.log(`\n  Let Report is running:\n    This computer:  http://localhost:${port}`);
  ips.forEach(ip => console.log(`    Phone/tablet:   http://${ip}:${port}  (same Wi-Fi)`));
} else {
  await esbuild.build(options);
}
