import {cell_types} from "./cell.js";
import {direction} from "./player.js";
import {get_random_int_from_range} from "./utilities.js";
import {player} from "./index.js";

export const field_height = 30;
export const field_width = 30;
const random_tick_speed = 20;
export const tps = 60;
const point_tick_speed = 20 * 60;
export const max_player_speed = 50;

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


export function game_handler(cells, tick, players, cell_styles, tower_styles) {
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