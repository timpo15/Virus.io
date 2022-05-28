
export function get_random_int_from_range(min, max) {
    return Math.trunc(Math.random() * (max - min + 1)) + min;
}