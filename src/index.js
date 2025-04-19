
export const prolong = (ms, ok, result)=>{
    return new Promise((res, rej)=>setTimeout(_=>ok ? res(result) : rej(result), ms));
}


export const timeout = (ms, error)=>prolong(ms, false, error ?? new Error("Timeout"));
export const sleep = (ms, result)=>prolong(ms, true, result);