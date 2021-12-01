import esbuild from 'esbuild';

const config = {
  entryPoints   : ['./src/index.ts'],
  outfile       : './build/index.js',
  tsconfig      : './tsconfig.json',
  platform      : 'neutral',
  logLevel      : 'info',
  bundle        : true,
  minify        : false,
  sourcemap     : false,
};

async function build_lib(){
  await esbuild.build( config ).catch( _=>process.exit( 1 ) );
  await esbuild.build({
      entryPoints     : ['./build/index.js'],
      outfile         : '../../dist/parsers/Gltf2.js',
  }).catch( _=>process.exit( 1 ) );
}

build_lib();