const esbuild = require('esbuild');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch');

const buildOptions = {
    entryPoints: ['src/renderer/index.jsx'],
    bundle: true,
    outfile: 'src/dist/bundle.js',
    platform: 'browser',
    target: ['chrome120'], // Electron uses Chromium
    jsx: 'automatic',
    jsxDev: !isProduction,
    sourcemap: !isProduction,
    minify: isProduction,
    loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
    logLevel: 'info',
};

async function build() {
    try {
        if (isWatch) {
            const context = await esbuild.context(buildOptions);
            await context.watch();
            console.log('👀 Watching for changes...');
        } else {
            await esbuild.build(buildOptions);
            console.log('✅ Build completed successfully!');
        }
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();
