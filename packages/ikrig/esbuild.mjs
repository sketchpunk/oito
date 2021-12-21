import esbuild      from 'esbuild';
import textReplace  from 'esbuild-plugin-text-replace';

const Config = {
    entryPoints     : ['./src/index.ts'],
    outfile         : './build/index.js',
    external        : [ '@oito/core', '@oito/core.extend', '@oito/armature' ],
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
                //['@oito/core.extend/build',   back+'core.extend'],
                ['@oito/core',                back+'core.js'],
                ['@oito/armature',            back+'armature.js'],
            ]
        })
    ];
}

async function build_lib(){
    await Promise.all([
        esbuild.build( Config ),
    ]).catch( _=>process.exit( 1 ) );

    await Promise.all([
        esbuild.build( { entryPoints:['./build/index.js'], outfile: '../../dist/ikrig.js', plugins: plugins(), } ),
    ]).catch( _=>process.exit( 1 ) );
}

build_lib();