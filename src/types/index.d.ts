import type { PluginCreator } from "postcss";

/** Converts the numeric part of a CSS dimension into its replacement value. */
export type ExtraUnitConverter = (value: number) => string | number;

/** Maps custom CSS unit names to their conversion callbacks. */
export type ExtraUnits = Readonly<Record<string, ExtraUnitConverter>>;

/** Creates a PostCSS plugin that replaces configured custom CSS units. */
declare const extraUnits: PluginCreator<ExtraUnits>;

export default extraUnits;
