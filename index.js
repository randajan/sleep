import sapp, { argv } from "@randajan/simple-lib";


sapp(argv.isBuild, {
    mode:"node",
    lib:{
        entries:["index.js", "esbuild.js"],
        statics:["types"]
    }
})
