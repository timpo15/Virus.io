import {cell_types} from "./cell.js";
import {get_random_int_from_range} from "./utilities.js";

export function generate_map(cells, players) {
    let positions = [[4, 4], [cells.length - 5, cells[0].length - 5], [4, cells[0].length - 5], [cells.length - 5, 4]];
    for (let i = 0; i < players.length; i++) {
        add_object(cells, positions[i][0], positions[i][1], positions[i][0], positions[i][1], players[i].tower_style, players[i]);
    }
    for (let i = 0; (i + 1) * 20 <= cells.length; i++) {
        for (let j = 0; (j + 1) * 20 <= cells[0].length; j++) {
            generate_landscape_on_rectangle(cells,
                i * 10,
                j * 10,
                i * 10 + 9,
                j * 10 + 9);
            generate_landscape_on_rectangle(cells,
                cells.length - (i + 1) * 10,
                j * 10,
                cells.length - (i + 1) * 10 + 9,
                j * 10 + 9);
            generate_landscape_on_rectangle(cells,
                i * 10,
                cells[0].length - (j + 1) * 10,
                i * 10 + 9,
                cells[0].length - (j + 1) * 10 + 9);
            generate_landscape_on_rectangle(cells,
                cells.length - (i + 1) * 10,
                cells[0].length - (j + 1) * 10,
                cells.length - (i + 1) * 10 + 9,
                cells[0].length - (j + 1) * 10 + 9);
        }
    }

    let i_shift = Math.trunc(cells.length / 20) * 10;
    let j_shift = Math.trunc(cells[0].length / 20) * 10;

    if (cells.length % 20 !== 0) {
        for (let j = 0; (j + 1) * 20 < cells[0].length; j++) {
            generate_landscape_on_rectangle(cells,
                i_shift,
                j * 10,
                i_shift + cells.length % 20 - 1,
                j * 10 + 9);
            generate_landscape_on_rectangle(cells,
                i_shift,
                cells[0].length - (j + 1) * 10,
                i_shift + cells.length % 20 - 1,
                cells[0].length - (j + 1) * 10 + 9);
        }
    }

    if (cells[0].length % 20 !== 0) {
        for (let i = 0; (i + 1) * 20 < cells.length; i++) {
            generate_landscape_on_rectangle(cells,
                i * 10,
                j_shift,
                i * 10 + 9,
                j_shift + cells[0].length % 20 - 1);

            generate_landscape_on_rectangle(cells,
                cells.length - (i + 1) * 10,
                j_shift,
                cells.length - (i + 1) * 10 + 9,
                j_shift + cells[0].length % 20 - 1);
        }
    }

    if (cells.length % 20 !== 0 && cells[0].length % 20 !== 0) {
        generate_landscape_on_rectangle(cells,
            i_shift,
            j_shift,
            i_shift + cells.length % 20 - 1,
            j_shift + cells[0].length % 20 - 1);
    }
}

export function check_tower_connectivity_and_fill_holes(cells, tower_styles) {
    let towers_number = 0;
    let any_tower = undefined;
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            if (cells[i][j].state === cell_types.FREE_TOWER || tower_styles.has(cells[i][j].state)) {
                towers_number++;
                any_tower = [i, j];
            }
        }
    }
    if (any_tower === undefined) {
        return true;
    }
    const di = [-1, 0, 1, 0];
    const dj = [0, -1, 0, 1];
    let stack = [any_tower];
    let used = new Set();
    used.add(any_tower[0] * cells[0].length + any_tower[1]);
    let visited_towers = 0;
    while (stack.length > 0) {
        let [i, j] = stack.pop();
        if (cells[i][j].state === cell_types.FREE_TOWER || tower_styles.has(cells[i][j].state)) {
            visited_towers++;
        }
        for (let k = 0; k < 4; k++) {
            let new_i = i + di[k];
            let new_j = j + dj[k];
            if (new_i >= 0 && new_j >= 0 && new_i < cells.length && new_j < cells[0].length && cells[new_i][new_j].state !== cell_types.WALL && !used.has(new_i * cells[0].length + new_j)) {
                used.add(new_i * cells[0].length + new_j);
                stack.push([new_i, new_j]);
            }
        }
    }
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            if (cells[i][j].state !== cell_types.WALL && !used.has(i * cells[0].length + j)) {
                cells[i][j].state = cell_types.WALL;
            }
        }
    }
    return visited_towers === towers_number;
}

export function clear_map(cells) {
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            cells[i][j].state = cell_types.FREE;
        }
    }
}

function get_random_free_cell(cells, i_min, j_min, i_max, j_max) {
    let i = 0;
    let j = 0;
    do {
        i = get_random_int_from_range(i_min, i_max);
        j = get_random_int_from_range(j_min, j_max);
    } while (cells[i][j].state !== cell_types.FREE);
    return [i, j];
}

function add_object(cells, i_min, j_min, i_max, j_max, object_type, player = undefined) {
    let [i, j] = get_random_free_cell(cells, i_min, j_min, i_max, j_max);
    cells[i][j].state = object_type;
    cells[i][j].player = player;
}

function generate_wall_on_rectangle(cells, i_min, j_min, i_max, j_max) {
    const di = [-1, 0, 1, 0];
    const dj = [0, -1, 0, 1];
    let size = get_random_int_from_range(24, 25);
    let used = new Set();
    let start = get_random_free_cell(cells, i_min, j_min, i_max, j_max)
    let queue = [start];
    used.add(start[0] * cells[0].length + start[1]);
    for (let _ = 0; _ < size; _++) {
        if (queue.length === 0) {
            break;
        }
        let [i, j] = queue.shift();
        add_object(cells, i, j, i, j, cell_types.WALL);
        for (let k = 0; k < 4; k++) {
            let new_i = i + di[k];
            let new_j = j + dj[k];
            if (i_min <= new_i && new_i <= i_max && j_min <= new_j && new_j <= j_max && !used.has(new_i * cells[0].length + new_j) && cells[new_i][new_j].state === cell_types.FREE) {
                queue.push([new_i, new_j]);
                used.add(new_i * cells[0].length + new_j);
                let random_index = get_random_int_from_range(0, queue.length - 1);
                let temp = queue[random_index];
                queue[random_index] = queue[queue.length - 1];
                queue[queue.length - 1] = temp;
            }
        }
    }
}

function generate_landscape_on_rectangle(cells, i_min, j_min, i_max, j_max) {
    add_object(cells, i_min, j_min, i_max, j_max, cell_types.FREE_TOWER);
    if (i_max - i_min + 1 >= 10 && j_max - j_min + 1 >= 10) {
        generate_wall_on_rectangle(cells, i_min, j_min, i_max, j_max);
    }
}