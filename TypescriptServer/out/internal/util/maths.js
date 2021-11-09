export function clamp(val, min, max) {
    if (val < min) {
        val = min;
    }
    else if (val > max) {
        val = max;
    }
    return val;
}
export function lerp(start, target, amount) {
    return start + (target - start) * amount;
}
