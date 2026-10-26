

import parse from "postcss-value-parser";

const extraUnits = (units = {}) => {
    const callbacks = new Map(Object.entries(units));
    const names = [...callbacks.keys()];

    for (const [unit, callback] of callbacks) {
        if (typeof callback !== "function") { throw new TypeError(`Unit '${unit}' must have a function callback`); }
    }

    const transform = value => {
        if (!names.some(unit => value.includes(unit))) { return value; }

        const ast = parse(value);
        let changed = false;

        ast.walk(node => {
            if (node.type === "function" && node.value.toLowerCase() === "url") { return false; }
            if (node.type !== "word") { return; }

            const parsed = parse.unit(node.value);
            if (!parsed || !callbacks.has(parsed.unit)) { return; }

            node.value = String(callbacks.get(parsed.unit)(Number(parsed.number)));
            changed = true;
        });

        return changed ? ast.toString() : value;
    };

    return {
        postcssPlugin: "postcss-extra-units",
        Declaration(decl) { decl.value = transform(decl.value); },
        AtRule(rule) {
            if (["media", "supports", "container"].includes(rule.name.toLowerCase())) {
                rule.params = transform(rule.params);
            }
        }
    };
};

extraUnits.postcss = true;

export default extraUnits;
