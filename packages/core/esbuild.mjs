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
  //format        : 'esm',
  //target        : ['es2020'],
  //watch       : true,
  //watch: {
  //  onRebuild(error, result) {
  //    if (error) console.error('watch build failed:', error)
  //    else console.log('watch build succeeded:', result)
  //  },
  //},
  //splitting   : true,
  //plugins: [nodeExternalsPlugin()]
};

async function build_lib(){
  await esbuild.build( config ).catch( _=>process.exit( 1 ) );

  await esbuild.build({
      entryPoints     : ['./build/index.js'],
      outfile         : '../../dist/core.js',
  }).catch( _=>process.exit( 1 ) );
}

build_lib();