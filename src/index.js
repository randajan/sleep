
/**
 * Checks whether a value looks like an AbortSignal.
 *
 * @param {*} signal
 * @returns {boolean}
 */
export const isAbortSignal = signal=>!!signal
    && typeof signal === "object"
    && typeof signal.aborted === "boolean"
    && typeof signal.addEventListener === "function"
    && typeof signal.removeEventListener === "function";


/**
 * Returns a valid AbortSignal or undefined.
 *
 * @param {*} signal
 * @param {boolean} [throwError=false]
 * @returns {AbortSignal|undefined}
 * @throws {TypeError}
 */
export const asAbortSignal = (signal, throwError=false)=>{
    if (isAbortSignal(signal)) { return signal; }
    if (!throwError) { return; }
    throw new TypeError("options.signal must be an AbortSignal");
};

const abortError = signal=>signal.reason ?? new Error("Aborted");

/**
 * Creates a child AbortSignal that inherits aborts from another signal.
 *
 * @param {*} signal
 * @returns {{ signal:AbortSignal|undefined, abort:function, stop:function }}
 */
export const inheritSignal = signal=>{
    signal = asAbortSignal(signal);

    if (typeof AbortController !== "function") {
        return {
            signal,
            abort:_=>{},
            stop:_=>{},
        };
    }

    const controller = new AbortController();
    const abort = _=>controller.abort(signal.reason);
    const stop = _=>signal?.removeEventListener("abort", abort);

    if (signal?.aborted) { abort(); }
    else { signal?.addEventListener("abort", abort, { once:true }); }

    return {
        signal:controller.signal,
        abort:reason=>controller.abort(reason),
        stop,
    };
};

/**
 * Resolves or rejects after a delay.
 *
 * @template T
 * @param {number} ms
 * @param {object} [options]
 * @param {boolean} [options.isOk=true]
 * @param {T} [options.result]
 * @param {*} [options.error]
 * @param {AbortSignal} [options.signal]
 * @param {boolean} [options.unref=false]
 * @returns {Promise<T>}
 */
export const delay = (ms, options={})=>{
    const { isOk=true, result, error, unref=false } = options;
    const signal = asAbortSignal(options.signal);

    return new Promise((res, rej)=>{
        if (signal?.aborted) { return rej(abortError(signal)); }

        const stop = _=>{
            clearTimeout(timer);
            signal?.removeEventListener?.("abort", abort);
        };

        const done = _=>{
            stop();
            isOk ? res(result) : rej(error);
        };

        const abort = _=>{
            stop();
            rej(abortError(signal));
        };

        const timer = setTimeout(done, ms);
        if (unref) { timer.unref?.(); }
        signal?.addEventListener?.("abort", abort, { once:true });
    });
}


/**
 * Rejects after a delay.
 *
 * @param {number} ms
 * @param {object} [options]
 * @param {*} [options.error]
 * @param {AbortSignal} [options.signal]
 * @param {boolean} [options.unref=false]
 * @returns {Promise<never>}
 */
export const timeout = (ms, options={})=>delay(ms, {
    ...options,
    isOk:false,
    error:options.error ?? new Error("Timeout"),
});

/**
 * Resolves after a delay.
 *
 * @template T
 * @param {number} ms
 * @param {object} [options]
 * @param {T} [options.result]
 * @param {AbortSignal} [options.signal]
 * @param {boolean} [options.unref=false]
 * @returns {Promise<T>}
 */
export const sleep = (ms, options={})=>delay(ms, {
    ...options,
    isOk:true,
});

/**
 * Rejects a promise when a signal aborts.
 *
 * @template T
 * @param {PromiseLike<T>|T} promise
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<T>}
 */
export const withAbort = (promise, options={})=>{
    const signal = asAbortSignal(options.signal);
    if (!signal) { return Promise.resolve(promise); }
    if (signal.aborted) { return Promise.reject(abortError(signal)); }

    let stop = _=>{};

    return Promise.race([
        Promise.resolve(promise),
        new Promise((res, rej)=>{
            const abort = _=>rej(abortError(signal));
            stop = _=>signal.removeEventListener("abort", abort);
            signal.addEventListener("abort", abort, { once:true });
        }),
    ]).finally(stop);
};

/**
 * Rejects if a promise does not settle before a timeout.
 *
 * @template T
 * @param {PromiseLike<T>|T} promise
 * @param {number} ms
 * @param {object} [options]
 * @param {*} [options.error]
 * @param {AbortSignal} [options.signal]
 * @param {boolean} [options.unref=true]
 * @returns {Promise<T>}
 */
export const withTimeout = (promise, ms, options={})=>{
    const timeoutController = inheritSignal(options.signal);

    const output = timeoutController.signal?.aborted
        ? Promise.reject(abortError(timeoutController.signal))
        : Promise.race([
            Promise.resolve(promise),
            timeout(ms, { unref:true, ...options, signal:timeoutController.signal }),
        ]);

    return output.finally(_=>{
        timeoutController.stop();
        timeoutController.abort();
    });
};

/**
 * Calculates the remaining delay needed to reach a minimum duration and optional alignment.
 *
 * @param {number} started
 * @param {number} ms
 * @param {number} [align=0]
 * @returns {number}
 */
const prolongMs = (started, ms, align=0)=>{
    const elapsed = Date.now() - started;
    const minWait = Math.max(0, ms - elapsed);
    const target = elapsed + minWait;
    align = align > 0 ? align : 0;

    return minWait + (align ? (align - (target % align)) % align : 0);
};

/**
 * Delays a promise output until at least ms elapsed, optionally aligned to a step.
 *
 * @template T
 * @param {PromiseLike<T>|T} promise
 * @param {number} ms
 * @param {object} [options]
 * @param {number} [options.align=0]
 * @param {AbortSignal} [options.signal]
 * @param {boolean} [options.unref=false]
 * @returns {Promise<T>}
 */
export const withProlong = async (promise, ms, options={})=>{
    const started = Date.now();
    const signal = asAbortSignal(options.signal);

    let result, error, isOk = true;
    try { result = await withAbort(promise, { signal }); }
    catch (err) { error = err; isOk = false; }

    const wait = prolongMs(started, ms, options.align);
    if (wait) { await sleep(wait, { unref:options.unref }); }

    if (!isOk) { throw error; }
    if (signal?.aborted) { throw abortError(signal); }

    return result;
    
};
