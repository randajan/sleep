# @randajan/sleep

[![NPM](https://img.shields.io/npm/v/@randajan/sleep.svg)](https://www.npmjs.com/package/@randajan/sleep) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


Tiny async utilities for timeout and sleep using native Promises.

_I was tired of writing it again and again_


## Installation

```bash
npm install @randajan/sleep
```

## Usage

```js
import { sleep, timeout, prolong } from "@randajan/sleep";

// Wait 500ms and resolve with "done"
await sleep(500, "done");

// Wait 500ms and reject with "Timeout"
await timeout(500);

// Wait 1000ms and resolve with "OK"
await prolong(1000, true, "OK");

// Wait 1000ms and reject with custom error
await prolong(1000, false, new Error("Custom timeout"));
```

## API

### `sleep(ms, result)`
Resolves `result` after `ms` milliseconds.

### `timeout(ms, error)`
Rejects `error` after `ms` milliseconds (default: `new Error("Timeout")`).

### `prolong(ms, ok, result)`
Resolves (if `ok` is `true`) or rejects (if `false`) with `result` after `ms` milliseconds.


## License

MIT
