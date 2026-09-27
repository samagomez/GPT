export const $ = selector => document.querySelector(selector);
export const $$ = selector => document.querySelectorAll(selector);

export function todayISO(){
  return new Date().toISOString().slice(0,10);
}
