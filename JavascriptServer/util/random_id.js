import { randomInt } from "crypto";

export function getRandomId(avoid_keys = {}, digits = 6) {
    let id = '';
    let a = Math.pow(10, digits - 1); // 100'000
    let b = Math.pow(10, digits) - 1; // 999'999
    
    if (Object.keys(avoid_keys).length >= b / 2)
        return null;
    
    
    // get a random id, without collisions
    while (id == '' || id in avoid_keys) {
        // a random k-digit number
        id = randomInt(a, b).toString();
    }
    
    return id;
}
