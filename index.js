import {Cell, cell_types} from "./cell.js";
import {direction, Player} from "./player.js";
import {generate_map, clear_map, check_tower_connectivity_and_fill_holes, generate_table} from "./map_creation.js";
import {game_handler, field_height, field_width, tps, max_player_speed} from "./game_handler.js";

export let player = undefined;
let game_handler_event = undefined;

function print_player_names(players) {
    for (let i = 0; i < players.length; i++) {
        document.querySelector(`.player${i + 1}_captured .nick`).textContent = players[i].name;
    }
}

export function print_captured(captured) {
    for (let i = 0; i < captured.length; i++) {
        document.querySelector(`.player${i + 1}_captured .score`).textContent = captured[i];
    }
}

function start_game(player_name) {
    let players = [
        new Player(cell_types.P1, cell_types.P1_TOWER, player_name, 0, 0, direction.NONE),
        new Player(cell_types.P2, cell_types.P2_TOWER, "enemy_1", 0, 0, direction.DOWN),
        new Player(cell_types.P3, cell_types.P3_TOWER, "enemy_2", 0, 0, direction.NONE),
        new Player(cell_types.P4, cell_types.P4_TOWER, "enemy_3", 0, 0, direction.NONE)];
    player = players[0];
    print_player_names(players);
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
    game_handler_event = setInterval(() => {
        game_handler(cells, tick, players, cell_styles, tower_styles);
        tick = (tick + 1);
    }, 1000 / tps);
}

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

document.querySelector("#rules").addEventListener("click", () => {
    document.querySelector("#modal-text").innerText="Прошу отчислить по собственному желанию"
    document.querySelector(".modal_window").classList.remove("hidden");
});

document.querySelector("#menu").addEventListener("click", () => {
    document.querySelector(".modal_window").classList.add("hidden");
    document.querySelector("#modal-text").innerText="Вы проиграли, вы лох";
    clearInterval(game_handler_event);
    document.querySelector(".game").classList.add("hidden");
    document.querySelector(".main").classList.remove("hidden");
});

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
   document.querySelector(".main").classList.add("hidden");
   document.querySelector(".game").classList.remove("hidden");
   start_game(nameInput.value);
});

document.querySelector("#give-up").addEventListener("click", () => {
    document.querySelector(".modal_window").classList.remove("hidden");
});

window.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === "w" || e.key.toLowerCase() === 'ц')
        document.querySelector('#move-up').click();
    else if (e.key.toLowerCase() === "s" || e.key.toLowerCase() === 'ы')
        document.querySelector('#move-down').click();
    else if (e.key.toLowerCase() === "a" || e.key.toLowerCase() === 'ф')
        document.querySelector('#move-left').click();
    else if (e.key.toLowerCase() === "d" || e.key.toLowerCase() === 'в')
        document.querySelector('#move-right').click();
    else if (e.key.toLowerCase() === " ")
        document.querySelector('#move-none').click();
    else if (e.key.toLowerCase() === "q" || e.key.toLowerCase() === 'й')
        document.querySelector('#speed').click();
    else if (e.key.toLowerCase() === "e" || e.key.toLowerCase() === 'у')
        document.querySelector('#power').click();
});

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