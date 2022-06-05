
export function get_random_int_from_range(min, max) {
    return Math.trunc(Math.random() * (max - min + 1)) + min;
}

// Первый тот, кто захватывает клетку
export function kukarek(x, y) {
    return sigmoid((x - y) / 10);
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}