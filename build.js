import esbuild from 'esbuild';

// Automatically exclude all node_modules from the bundled version
// import { nodeExternalsPlugin } from 'esbuild-node-externals'

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    outfile: 'ui/index.js',
    bundle: true,
    // minify: true,
    // platform: 'node',
    sourcemap: true,
    target: ['chrome67', 'firefox70', 'safari14', 'edge79'],
    // plugins: [nodeExternalsPlugin()]
  })
  .catch(() => process.exit(1));
