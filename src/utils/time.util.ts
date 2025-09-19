export function nowMs(): number { 
  return Date.now(); 
}

export function durationMs(start: number): number { 
  return Date.now() - start; 
}
