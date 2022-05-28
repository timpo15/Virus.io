import {Cell, cell_types} from "./cell.js";
import {direction, Player} from "./player.js";
import {get_random_int_from_range} from "./utilities.js";
import {generate_map, clear_map, check_tower_connectivity_and_fill_holes} from "./map_creation.js";

const field_height = 30;
const field_width = 30;
const random_tick_speed = 20;
const tps = 60;
const point_tick_speed = 20 * 60;
const max_player_speed = 50;
let player = undefined;

function generate_table(n, m) {
    let cells = new Array(n);
    let tblBody = document.querySelector("#game-field");

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

    return cells;
}

function check_neighbours(cells, i, j, player_, dir_i, dir_j, cell_styles, tower_styles) {
    let prob = Math.random();
    let f = cells[i + dir_i][j + dir_j].state === cell_types.FREE
        || cells[i + dir_i][j + dir_j].state === cell_types.FREE_TOWER;
    f |= cell_styles.has(cells[i + dir_i][j + dir_j].state)
        && cells[i + dir_i][j + dir_j].state !== player_.cell_style
        && prob < player_.strength / (player_.strength + cells[i + dir_i][j + dir_j].player.strength);
    f |= tower_styles.has(cells[i + dir_i][j + dir_j].state)
        && cells[i + dir_i][j + dir_j].state !== player_.tower_style
        && prob < player_.strength / (player_.strength + cells[i + dir_i][j + dir_j].player.strength);
    return f;
}

function get_prob(edge, player) {
    let prob = [5, 5, 5, 5];
    if (player.direction !== direction.NONE) {
        prob[player.direction] += 80;
    } else {
        prob = [25, 25, 25, 25];
    }
    let sum_zeros = 0;
    let kol_non_zeros = 4;
    for (let i = 0; i < 4; i++) {
        if (edge[i].length === 0) {
            sum_zeros += prob[i];
            prob[i] = 0;
            kol_non_zeros--;
        }
    }
    let add = Math.trunc(sum_zeros / kol_non_zeros);
    for (let i = 0; i < 4; i++) {
        if (prob[i] !== 0) {
            prob[i] += add;
            sum_zeros -= add;
        }
    }
    for (let i = 0; i < 4 && sum_zeros !== 0; i++) {
        if (prob[i] !== 0) {
            prob[i]++;
            sum_zeros--;
        }
    }
    return prob;
}

function update_map(cells, player, cell_styles, tower_styles) {
    let edge = [[], [], [], []];
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            if (cells[i][j].state !== player.cell_style && cells[i][j].state !== player.tower_style)
                continue;
            if (i !== 0 && check_neighbours(cells, i, j, player, -1, 0, cell_styles, tower_styles)) {
                edge[direction.UP].push([i - 1, j]);
            }
            if (i !== cells.length - 1 && check_neighbours(cells, i, j, player, 1, 0, cell_styles, tower_styles)) {
                edge[direction.DOWN].push([i + 1, j]);
            }
            if (j !== 0 && check_neighbours(cells, i, j, player, 0, -1, cell_styles, tower_styles)) {
                edge[direction.LEFT].push([i, j - 1]);
            }
            if (j !== cells[i].length - 1 && check_neighbours(cells, i, j, player, 0, 1, cell_styles, tower_styles)) {
                edge[direction.RIGHT].push([i, j + 1]);
            }
        }
    }
    let prob = get_prob(edge, player);
    let rnd = get_random_int_from_range(1, 100);
    for (let i = 0; i < 4; i++) {
        if (rnd <= prob[i]) {
            let index = edge[i][get_random_int_from_range(0, edge[i].length - 1)];
            let is_opponent_tower = tower_styles.has(cells[index[0]][index[1]].state);
            if (cells[index[0]][index[1]].state === cell_types.FREE_TOWER
                || is_opponent_tower) {
                if (is_opponent_tower) {
                    cells[index[0]][index[1]].player.tower_num--;
                }
                cells[index[0]][index[1]].state = player.tower_style;
                cells[index[0]][index[1]].player = player;
                player.tower_num++;
                continue;
            }
            if (cells[index[0]][index[1]].state === cell_types.FREE
                || cell_styles.has(cells[index[0]][index[1]].state)) {
                cells[index[0]][index[1]].state = player.cell_style;
                cells[index[0]][index[1]].player = player;
            }
            break;
        } else {
            rnd -= prob[i];
        }
    }
}

function update_points(player_) {
    player_.points += player_.tower_num;
    if (player_ !== player) { //TODO: БАБКА ЛЮТАЯ(исправить)
        let points_to_speed = Math.min(max_player_speed, get_random_int_from_range(0, player_.points));
        player_.strength += player_.points - points_to_speed;
        player_.speed += points_to_speed;
        player_.points = 0;
    }
}

function process_loss(cells, players) {
    let cnt = 0;
    for (let player of players) {
        if (player.tower_num === 0) {
            cnt++;
            for (let i = 0; i < cells.length; i++) {
                for (let j = 0; j < cells[i].length; j++) {
                    if (cells[i][j].state === player.tower_style)
                        cells[i][j].state = cell_types.FREE_TOWER;
                    else if (cells[i][j].state === player.cell_style)
                        cells[i][j].state = cell_types.FREE;
                }
            }
        }
    }
    if (players.length - cnt === 1) {
        do_smth_when_only_one_left();
    }
}

function do_smth_when_only_one_left() {
    ;
}


function game_handler(cells, tick, players, cell_styles, tower_styles) {
    document.querySelector('#player-score > span').textContent = player.points;
    for (let k = 0; k < players.length; k++) {
        if (tick % (random_tick_speed + max_player_speed - players[k].speed) === 0) {
            // console.log(k + " " + (random_tick_speed + max_player_speed - players[k].speed));
            update_map(cells, players[k], cell_styles, tower_styles);
            process_loss(cells, players);
        }
        if (tick % point_tick_speed === 0) {
            update_points(players[k]);
        }
    }

}

function start_game() {
    let players = [
        new Player(cell_types.P1, cell_types.P1_TOWER, "P1", 0, 0, direction.UP),
        new Player(cell_types.P2, cell_types.P2_TOWER, "P2", 0, 0, direction.DOWN),
        new Player(cell_types.P3, cell_types.P3_TOWER, "P3", 0, 0, direction.NONE),
        new Player(cell_types.P4, cell_types.P4_TOWER, "P4", 0, 0, direction.NONE)];
    player = players[0];
    let tower_styles = new Set();
    let cell_styles = new Set();
    for (let player of players) {
        cell_styles.add(player.cell_style);
        tower_styles.add(player.tower_style);
    }
    let cells = generate_table(field_height, field_width);
    do {
        clear_map(cells);
        generate_map(cells, players);
    }
    while (!check_tower_connectivity_and_fill_holes(cells, tower_styles));

    let tick = 0;
    let ident = setInterval(() => {
        game_handler(cells, tick, players, cell_styles, tower_styles);
        tick = (tick + 1);
    }, 1000 / tps);
}

window.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === "w")
        document.querySelector('#move-up').click();
    else if (e.key.toLowerCase() === "s")
        document.querySelector('#move-down').click();
    else if (e.key.toLowerCase() === "a")
        document.querySelector('#move-left').click();
    else if (e.key.toLowerCase() === "d")
        document.querySelector('#move-right').click();
    else if (e.key.toLowerCase() === " ")
        document.querySelector('#move-none').click();
    else if (e.key.toLowerCase() === "q")
        document.querySelector('#speed').click();
    else if (e.key.toLowerCase() === "e")
        document.querySelector('#power').click();
});

let buttons = {
    'up': document.querySelector('#move-up'),
    'down': document.querySelector('#move-down'),
    'left': document.querySelector('#move-left'),
    'right': document.querySelector('#move-right'),
    'none': document.querySelector('#move-none')
}

function selectButton(name) {
    for(const key in buttons) {
        buttons[key].classList.remove('arrow-active');
    }
    buttons[name].classList.add('arrow-active');
}

buttons['up'].addEventListener('click', () => {
    player.direction = direction.UP;
    selectButton('up');
});

buttons['down'].addEventListener('click', () => {
    player.direction = direction.DOWN;
    selectButton('down');
});

buttons['left'].addEventListener('click', () => {
    player.direction = direction.LEFT;
    selectButton('left');
});

buttons['right'].addEventListener('click', () => {
    player.direction = direction.RIGHT;
    selectButton('right');
});

buttons['none'].addEventListener('click', () => {
    player.direction = direction.NONE;
    selectButton('none');
});

document.querySelector('#speed').addEventListener('click', () => {
    if (player.speed === max_player_speed)
        return;

    if (player.points > 0) {
        player.speed++;
        player.points--;
        document.querySelector('#speed > span').textContent = player.speed.toString();
    }
});

document.querySelector('#power').addEventListener('click', () => {
    if (player.points > 0) {
        player.strength++;
        player.points--;
        document.querySelector('#power > span').textContent = player.strength.toString();
    }
});


const modal = document.getElementById("modal");
const btn = document.getElementById("power");
const span = document.getElementById("restart");


// btn.onclick = function(e) {
//     modal.style.display = "block";
//     e.preventDefault();
// }
//
// span.onclick = function() {
//     modal.style.display = "none";
// }
//
// window.onclick = function(event) {
//     if (event.target === modal) {
//         modal.style.display = "none";
//     }
// }

document.querySelector("#play").addEventListener("click", () => {
   const nameInput = document.querySelector("#nickname");
   if (nameInput.value.length === 0){
       alert("Введите имя");
       return;
   }
   if (nameInput.value.length > 15){
       alert("Слишком длинное имя");
       return;
   }
   document.querySelector(".player1_captured .nick").textContent = nameInput.value;
   document.querySelector(".main").classList.add("hidden");
   document.querySelector(".game").classList.remove("hidden");
   start_game();
});