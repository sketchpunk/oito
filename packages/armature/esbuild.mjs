import esbuild      from 'esbuild';
import textReplace  from 'esbuild-plugin-text-replace';

const ArmConfig = {
    entryPoints     : ['./src/index.ts'],
    outfile         : './build/index.js',
    external        : [ '@oito/core', '@oito/core.extend' ],
    tsconfig        : './tsconfig.json',
    platform        : 'neutral',
    logLevel        : 'info',
    bundle          : true,
    minify          : false,
    sourcemap       : false,
};

const AnimConfig = {
    entryPoints     : ['./src/animator/index.ts'],
    outfile         : './build/animator/index.js',
    external        : [ '@oito/core' ],
    tsconfig        : './tsconfig.json',
    platform        : 'neutral',
    logLevel        : 'info',
    bundle          : true,
    minify          : false,
    sourcemap       : false,
};

function plugins( back='./' ){
    return [
        textReplace({
            include: /.*/,
            pattern:[
                ['@oito/core.extend/build',   back+'core.extend'],
                ['@oito/core',                back+'core.js'],
            ]
        })
    ];
}

async function build_lib(){
    await Promise.all([
        esbuild.build( ArmConfig ),
        esbuild.build( AnimConfig ),
    ]).catch( _=>process.exit( 1 ) );

    await Promise.all([
        esbuild.build( { entryPoints:['./build/index.js'],          outfile: '../../dist/armature.js', plugins: plugins(), } ),
        esbuild.build( { entryPoints:['./build/animator/index.js'], outfile: '../../dist/animator.js', plugins: plugins(), } ),
    ]).catch( _=>process.exit( 1 ) );
}

build_lib();