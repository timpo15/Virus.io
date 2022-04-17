import {Cell, cell_types} from "./cell.js";

const field_height = 10;
const field_width = 10;
const random_tick_speed = 5;
const tps = 20;
const point_tick_speed = 20;

function generate_table(n, m) {
    let cells = new Array(n);

    let body = document.getElementsByTagName("body")[0];
    let tbl = document.createElement("table");
    let tblBody = document.createElement("tbody");

    for (let i = 0; i < n; i++) {
        cells[i] = new Array(m);
        let row = document.createElement("tr");
        for (let j = 0; j < m; j++) {
            let cell = document.createElement("td");
            cells[i][j] = new Cell(cell, `${i} ${j}`);
            cell.setAttribute("id", cells[i][j].id);
            cell.setAttribute("class", cells[i][j].state);
            row.appendChild(cell);
        }
        tblBody.appendChild(row);
    }
    tbl.setAttribute("border", "1");
    tbl.appendChild(tblBody);
    body.appendChild(tbl);
    return cells;
}

function get_random_int_from_range(min, max) {
    return Math.trunc(Math.random() * (max - min + 1)) + min;
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

function add_object(cells, i_min, j_min, i_max, j_max, object_type) {
    let [i, j] = get_random_free_cell(cells, i_min, j_min, i_max, j_max);
    cells[i][j].state = object_type;
}

function generate_wall_on_rectangle(cells, i_min, j_min, i_max, j_max) {
    const di = [-1, 0, 1, 0];
    const dj = [0, -1, 0, 1];
    let size = get_random_int_from_range(3, 8);
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

function generate_map(cells) {
    add_object(cells, 4, 4, 4, 4, cell_types.P1);
    add_object(cells, cells.length - 5, cells[0].length - 5, cells.length - 5, cells[0].length - 5, cell_types.P2);
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
    let j_shft = Math.trunc(cells[0].length / 20) * 10;

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
                j_shft,
                i * 10 + 9,
                j_shft + cells[0].length % 20 - 1);

            generate_landscape_on_rectangle(cells,
                cells.length - (i + 1) * 10,
                j_shft,
                cells.length - (i + 1) * 10 + 9,
                j_shft + cells[0].length % 20 - 1);
        }
    }

    if (cells.length % 20 !== 0 && cells[0].length % 20 !== 0) {
        generate_landscape_on_rectangle(cells,
            i_shift,
            j_shft,
            i_shift + cells.length % 20 - 1,
            j_shft + cells[0].length % 20 - 1);
    }
}

function update_cells(cells) {

}

function update_points(cells, players) {

}

function game_handler(cells, tick, ...players) {
    if (tick % random_tick_speed === 0) {

    }

    let arr = [cell_types.P1, cell_types.P2];
    // for (let i = 0; i < cells.length; i++) {
    //     for (let j = 0; j < cells[i].length; j++) {
    //         cells[i][j].state = arr[Math.trunc(Math.random() * 2)];
    //     }
    // }
}

function start_game() {
    let cells = generate_table(field_height, field_width);
    generate_map(cells);
    let tick = 0;
    let ident = setInterval(() => {
        game_handler(cells, tick);
        tick = (tick + 1) % tps;
    }, 1000 / tps);

}

start_game();