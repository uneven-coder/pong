let keyState: Record<string, boolean> = {};

export function registerKey(key:string)  {
    keyState[key] = false;

    window.addEventListener("keydown", (e) => {
        if (e.key === key) keyState[key] = true
    });

    window.addEventListener("keyup", (e) => {
        if (e.key === key) keyState[key] = false;
    });

    return () => keyState[key];
}

export const clampPercentChange = (setter: (value: number | ((prev: number) => number)) => void, delta: number) =>
        setter((prev: number) => Math.max(0, Math.min(100, prev + delta)));

export const clampPercent = (value: number) =>
         Math.max(0, Math.min(100, value));