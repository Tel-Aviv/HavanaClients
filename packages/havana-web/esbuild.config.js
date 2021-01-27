require('esbuild').build({
    entryPoints: ['./src/index.jsx'],
    bundle: true,
    sourcemap: true,
    // format: 'esm',
    // splitting: true,
    target: ['chrome88','edge16'],
    // outdir: './dist',
    outfile: './dist/bundle.js',
    define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.DEBUG': 'true',
    }
}).catch( () => process.exit(1) )