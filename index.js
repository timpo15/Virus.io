import {Cell, cell_types} from "./cell.js";

const field_size = 25;
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

function update_cells(cells) {

}

function update_points(cells, players) {

}

function game_handler(cells, tick, ...players) {
    if (tick % random_tick_speed === 0) {

    }

    // let arr = [cell_types.P1, cell_types.P2];
    // for (let i = 0; i < cells.length; i++) {
    //     for (let j = 0; j < cells[i].length; j++) {
    //         cells[i][j].state = arr[Math.trunc(Math.random() * 2)];
    //     }
    // }
}

function start_game() {
    let cells = generate_table(field_size, field_size);
    let tick = 0;
    let ident = setInterval(() => {
        game_handler(cells, tick);
        tick = (tick + 1) % tps;
    }, 1000 / tps);

}

start_game();