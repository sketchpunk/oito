import esbuild      from 'esbuild';
import textReplace  from 'esbuild-plugin-text-replace';

const config = {
    entryPoints     : [
        './src/DualQuat.ts',
        './src/VRot90.ts',
        './src/Transform2D.ts',
        './src/Colour.ts',
    ],
    outdir          : 'build',
    //outfile         : './build/index.js',
    //external        : [ '@oito/core' ],
    tsconfig        : './tsconfig.json',
    platform        : 'neutral',
    logLevel        : 'info',
    bundle          : false,
    minify          : false,
    sourcemap       : false,
};

async function build_lib(){
    await esbuild.build( config ).catch( _=>process.exit( 1 ) );

    await esbuild.build({
        entryPoints     : [
            './build/DualQuat.js',
            './build/VRot90.js',
            './build/Transform2D.js',
            './build/Colour.js',
        ],
        outdir          : '../../dist/core.extend/',
        plugins         : [
            textReplace({
                include: /.*/,
                pattern:[
                    ['@oito/core','../core.js'],
                ]
            })
        ],
    }).catch( _=>process.exit( 1 ) );
}

build_lib();