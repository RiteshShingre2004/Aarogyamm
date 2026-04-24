// Simple toast notification system
let toastFn: ((msg: string, type?: 'success' | 'error' | 'info') => void) | null = null;

export function registerToast(fn: typeof toastFn) {
    toastFn = fn;
}

export function toast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
    if (toastFn) {
        toastFn(msg, type);
    } else {
        console.log(`[Toast ${type}]: ${msg}`);
    }
}
