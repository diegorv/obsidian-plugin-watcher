import esbuild from 'esbuild';
import builtins from 'builtin-modules';
import { buildPlugin } from '../../shared/esbuild.config.base.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

buildPlugin({
  esbuild,
  builtins,
  entryPoint: 'main.ts',
  pluginDir: __dirname
});
