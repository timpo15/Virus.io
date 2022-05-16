import {Cell, cell_types} from "./cell.js";
import {direction, Player} from "./player.js";

const field_height = 22;
const field_width = 25;
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

function check_tower_connectivity_and_fill_holes(cells, tower_styles) {
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

function clear_map(cells) {
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            cells[i][j].state = cell_types.FREE;
        }
    }
}

function generate_map(cells, players) {
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
                console.log("huj");
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
        player_.strength += points_to_speed;
        player_.points = 0;
    }
}

function process_loss(cells, players) {
    for (let player of players) {
        if (player.tower_num === 0) {
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

}

function game_handler(cells, tick, players, cell_styles, tower_styles) {
    document.querySelector('#player-score > span').textContent = player.points;
    for (let k = 0; k < players.length; k++) {
        if (tick % (random_tick_speed + max_player_speed - players[k].speed) === 0) {
            update_map(cells, players[k], cell_styles, tower_styles);
            process_loss(cells, players);
        }
        if (tick % point_tick_speed === 0) {
            update_points(players[k]);
        }
    }

    let arr = [cell_types.P1, cell_types.P2];
    // for (let i = 0; i < cells.length; i++) {
    //     for (let j = 0; j < cells[i].length; j++) {
    //         cells[i][j].state = arr[Math.trunc(Math.random() * 2)];
    //     }
    // }
}

function start_game() {
    let players = [
        new Player(cell_types.P1, cell_types.P1_TOWER, "", 0, 0, direction.UP),
        new Player(cell_types.P2, cell_types.P2_TOWER, "", 0, 0, direction.DOWN),
        new Player(cell_types.P3, cell_types.P3_TOWER, "", 0, 0, direction.NONE),
        new Player(cell_types.P4, cell_types.P4_TOWER, "", 0, 0, direction.NONE)];
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

buttons['up'].addEventListener('click', (e) => {
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
//
// let ukraine = false;
// document.querySelector('.give-up').addEventListener('click', () => {
//     let b = document.querySelector('body');
//     if (ukraine){
//         b.style.background = 'linear-gradient(to bottom, white 30%, blue 33% 66%, red 66% 100%)';
//         ukraine = false;
//
//     }
//     else {
//         b.style.background = 'linear-gradient(to bottom, #6AAEFF 50%, #FEFFB5 50%)';
//         ukraine = true;
//     }
// });

start_game();


var modal = document.getElementById("modal");

var btn = document.getElementById("power");

var span = document.getElementById("restart");


btn.onclick = function(e) {
    modal.style.display = "block";
    e.preventDefault();
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
