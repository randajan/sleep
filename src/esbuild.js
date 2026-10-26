
import postcss from "postcss";
import { readFile } from "fs/promises";
import { dirname } from "path";
import extraUnits from "./index.js";

export const extraUnitsEsbuild = units => {
    const processor = postcss([extraUnits(units)]);
    const transform = async (css, from) => (await processor.process(css, { from })).css;

    return {
        name: "postcss-extra-units",
        transform,
        setup(build) {
            build.onLoad({ filter: /\.css$/, namespace: "file" }, async ({ path }) => ({
                contents: await transform(await readFile(path, "utf8"), path),
                loader: path.endsWith(".module.css") ? "local-css" : "css",
                resolveDir: dirname(path)
            }));
        }
    };
};
