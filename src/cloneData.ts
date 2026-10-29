// Project data is JSON-compatible. Draft proxies cannot use native cloning.
export function cloneData<T>(value:T):T {
 try{return globalThis.structuredClone(value);}catch(error){
  if((error as Error).name!=="DataCloneError")throw error;
  return JSON.parse(JSON.stringify(value));
 }
}
