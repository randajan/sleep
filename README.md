# @randajan/postcss-extra-units

[![NPM](https://img.shields.io/npm/v/@randajan/postcss-extra-units.svg)](https://www.npmjs.com/package/@randajan/postcss-extra-units)

A PostCSS plugin for replacing custom CSS units with values calculated by JavaScript callbacks. It is especially useful for generating complex `calc(...)` expressions from concise dimensions and includes an optional esbuild adapter.

## Installation

```bash
npm install @randajan/postcss-extra-units
```

## Usage

Define a callback for every custom unit. Each callback receives the numeric part of the CSS dimension and returns its complete replacement.

```js
import postcss from "postcss";
import extraUnits from "@randajan/postcss-extra-units";

const units = {
    rpx:value => `${value / 16}rem`,
    grid:value => `calc(${value} * var(--grid-size))`,
};

const input = `
    @media (width >= 320rpx) {
        .card {
            width:20grid;
            margin:16rpx;
        }
    }
`;

const result = await postcss([extraUnits(units)]).process(input, {
    from:undefined,
});

console.log(result.css);
```

The result is:

```css
@media (width >= 20rem) {
    .card {
        width: calc(20 * var(--grid-size));
        margin: 1rem;
    }
}
```

### Complex calculations

The callback can return any complete CSS value, not just another dimension. This makes custom units a compact way to generate calculations involving custom properties and multiple operations:

```js
const units = {
    grid:value => `calc(${value} * var(--grid-size))`,
    fluid:value => `calc(
        ${value} * var(--fluid-scale)
        + var(--fluid-offset)
    )`,
};
```

```css
/* Input */
.card {
    width: 12grid;
    padding: 2fluid;
}

/* Output */
.card {
    width: calc(12 * var(--grid-size));
    padding: calc(
        2 * var(--fluid-scale)
        + var(--fluid-offset)
    );
}
```

### PostCSS configuration

```js
// postcss.config.js
import extraUnits from "@randajan/postcss-extra-units";

export default {
    plugins:[
        extraUnits({
            rpx:value => `${value / 16}rem`,
        }),
    ],
};
```

### esbuild

Import the adapter from the `./esbuild` entrypoint:

```js
import { build } from "esbuild";
import { extraUnitsEsbuild } from "@randajan/postcss-extra-units/esbuild";

await build({
    entryPoints:["src/index.js"],
    bundle:true,
    outdir:"dist",
    plugins:[
        extraUnitsEsbuild({
            rpx:value => `${value / 16}rem`,
        }),
    ],
});
```

The adapter processes `.css` files with esbuild's `css` loader and `.module.css` files with its `local-css` loader.

It also exposes its CSS transformer for direct use:

```js
const plugin = extraUnitsEsbuild({
    rpx:value => `${value / 16}rem`,
});

const css = await plugin.transform(".card { width:160rpx }", "card.css");
```

## API

### `extraUnits(units?)`

Creates a PostCSS plugin.

`units` is an object whose keys are case-sensitive CSS unit names and whose values are conversion callbacks:

```ts
type ExtraUnitConverter = (value: number) => string | number;
type ExtraUnits = Readonly<Record<string, ExtraUnitConverter>>;
```

The plugin transforms matching dimensions in:

- declaration values;
- `@media` parameters;
- `@supports` parameters;
- `@container` parameters.

Values inside `url(...)` are left unchanged. If a configured unit does not contain a function callback, plugin creation throws a `TypeError`.

### `extraUnitsEsbuild(units?)`

Creates an esbuild plugin using the same unit configuration. The returned plugin also provides:

```ts
transform(css: string, from?: string): Promise<string>;
```

## TypeScript

Type declarations are included for both public entrypoints:

```ts
import extraUnits, {
    type ExtraUnitConverter,
    type ExtraUnits,
} from "@randajan/postcss-extra-units";

import {
    extraUnitsEsbuild,
    type ExtraUnitsEsbuildPlugin,
} from "@randajan/postcss-extra-units/esbuild";
```

## License

MIT
