import type { Plugin } from "esbuild";
import type { ExtraUnits } from "./index.js";

/** esbuild plugin with an exposed CSS transformation helper. */
export interface ExtraUnitsEsbuildPlugin extends Plugin {
    transform(css: string, from?: string): Promise<string>;
}

/** Creates an esbuild plugin backed by postcss-extra-units. */
export function extraUnitsEsbuild(units?: ExtraUnits): ExtraUnitsEsbuildPlugin;
