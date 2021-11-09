export function clamp(val:number, min:number, max:number) {
    if (val < min) {
        val = min;
    }
    else if (val > max) {
        val = max;
    }

    return val;
}

export function lerp(start:number, target:number, amount:number) {
    return start + (target - start) * amount;
}