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
import { sleep, timeout, delay, withAbort, withTimeout, withProlong, isAbortSignal } from "@randajan/sleep";

// Wait 500ms and resolve with "done"
await sleep(500, { result:"done" });

// Wait 500ms and reject with "Timeout"
await timeout(500);

// Wait 1000ms and resolve with "OK"
await delay(1000, { isOk:true, result:"OK" });

// Wait 1000ms and reject with custom error
await delay(1000, { isOk:false, error:new Error("Custom timeout") });

// Abort a pending sleep
const controller = new AbortController();
const pending = sleep(1000, { signal:controller.signal });
controller.abort();
await pending.catch(error=>error);

// Wrap any promise and reject when a signal aborts
await withAbort(fetch(url), { signal:controller.signal });

// Wrap any promise and reject if it does not resolve in time
await withTimeout(fetch(url), 2000, { error:new Error("Too slow") });

// Wrap any promise and delay its output for at least 500ms
await withProlong(fetch(url), 500);

// Keep a loading animation aligned to 250ms steps
await withProlong(fetch(url), 250, { align:250 });

// Do not keep a Node.js process alive just because of this timer
const detached = sleep(500, { result:"done", unref:true });

// Validate an AbortSignal-shaped value
isAbortSignal(controller.signal);
```

## API

### `sleep(ms, options)`
Resolves `result` after `ms` milliseconds.

Options:
- `result` - value used to resolve the promise.
- `signal` - optional `AbortSignal` used to abort the timer.
- `unref` - calls Node.js `timer.unref()` when available (default: `false`).

### `timeout(ms, options)`
Rejects `error` after `ms` milliseconds.

Options:
- `error` - value used to reject the promise (default: `new Error("Timeout")`).
- `signal` - optional `AbortSignal` used to abort the timer.
- `unref` - calls Node.js `timer.unref()` when available (default: `false`).

### `delay(ms, options)`
Resolves or rejects after `ms` milliseconds.

Options:
- `isOk` - resolves when `true`, rejects when `false` (default: `true`).
- `result` - value used to resolve the promise.
- `error` - value used to reject the promise.
- `signal` - optional `AbortSignal` used to abort the timer.
- `unref` - calls Node.js `timer.unref()` when available (default: `false`).

### `withTimeout(promise, ms, options)`
Resolves or rejects with `promise`, but rejects with `error` after `ms` milliseconds.
The internal timeout is aborted when `promise` settles.

Options:
- `error` - value used to reject the timeout promise (default: `new Error("Timeout")`).
- `signal` - optional `AbortSignal` used to abort the promise wrapper.
- `unref` - calls Node.js `timer.unref()` when available (default: `true`).

### `withAbort(promise, options)`
Resolves or rejects with `promise`, but rejects with the abort reason when `signal` aborts first.

Options:
- `signal` - optional `AbortSignal` used to abort the promise wrapper.

### `withProlong(promise, ms, options)`
Resolves or rejects with `promise`, but never sooner than after `ms` milliseconds.
Resolve, reject, and abort output are delayed. The original rejection wins over a later abort.
When `align` is provided, output is delayed to the nearest next multiple of `align` milliseconds.

Options:
- `align` - aligns output to the next multiple of this many milliseconds.
- `signal` - optional `AbortSignal` used to abort the promise wrapper.
- `unref` - calls Node.js `timer.unref()` when available (default: `false`).

### `isAbortSignal(value)`
Returns `true` when `value` looks like an `AbortSignal`.

### `asAbortSignal(value, throwError)`
Returns `value` when it looks like an `AbortSignal`; otherwise returns `undefined`.
When `throwError` is `true`, invalid values throw `TypeError`.

### `inheritSignal(signal)`
Creates a child `AbortSignal` that inherits aborts from `signal`.

Returns:
- `signal` - the child `AbortSignal`.
- `abort(reason)` - aborts the child signal.
- `stop()` - removes the inherited abort listener.


## License

MIT
