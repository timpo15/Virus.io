const myWs = new WebSocket('ws://localhost:9000');
let player_id = undefined;
let room_id = undefined;
// обработчик проинформирует в консоль когда соединение установится
myWs.onopen = function () {
    console.log('подключился');
};
// обработчик сообщений от сервера
myWs.onmessage = function (message) {
    console.log('Message: %s', message.data);

    const json = JSON.parse(message.data);

    switch (json.action) {
        case 'CONSTANTS':
            generate_table(json.height, json.width);
            player_id = json.id;
            room_id = json.room_id;
            break;
        case 'CELL':
            const cell = document.getElementById(json.cell_id);
            cell.setAttribute('class', json.state);
            break;
        case 'POINTS':
            document.querySelector('#player-score > span').textContent = json.points;
            break;
        case 'UPGRADE':
            document.querySelector('#speed > span').textContent = json.speed.toString();
            document.querySelector('#power > span').textContent = json.power.toString();
            break;
        default:
            console.log('huj');
            break;
    }
};

function start_game(name) {
    myWs.send(JSON.stringify({action: 'START_GAME', id: player_id, room_id: room_id}));
}

function set_direction(direction) {
    myWs.send(JSON.stringify({action: 'SET_DIRECTION', direction: direction, id: player_id, room_id: room_id}));
}

function create_room(name) {
    myWs.send(JSON.stringify({action: 'CREATE_ROOM', name: name}));
}

function join_room(name, room_id) {
    myWs.send(JSON.stringify({action: 'JOIN_ROOM', name: name, room_id: room_id}));
}

const cell_types = {
    FREE: "free_cell",
    WALL: "wall_cell",
    FREE_TOWER: "free_tower_cell",
    P1: "p1_cell",
    P2: "p2_cell",
    P3: "p3_cell",
    P4: "p4_cell",
    P1_TOWER: "p1_tower_cell",
    P2_TOWER: "p2_tower_cell",
    P3_TOWER: "p3_tower_cell",
    P4_TOWER: "p4_tower_cell",
};

function generate_table(n, m) {
    let tblBody = document.querySelector("#game-field");
    tblBody.innerHTML = "";
    for (let i = 0; i < n; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < m; j++) {
            let cell = document.createElement("td");
            cell.setAttribute("id", `${i} ${j}`);
            cell.setAttribute("class", cell_types.FREE);
            row.appendChild(cell);
        }
        tblBody.appendChild(row);
    }
}


const direction = {
    NONE: -1,
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
};

let buttons = {
    'up': document.querySelector('#move-up'),
    'down': document.querySelector('#move-down'),
    'left': document.querySelector('#move-left'),
    'right': document.querySelector('#move-right'),
    'none': document.querySelector('#move-none')
}

function selectButton(name) {
    for (const key in buttons) {
        buttons[key].classList.remove('arrow-active');
    }
    buttons[name].classList.add('arrow-active');
}

document.querySelector("#rules").addEventListener("click", () => {
    //TODO: добавить открытие окошка с правилами
});

// document.querySelector("#menu").addEventListener("click", () => {
//     document.querySelector(".modal_window").classList.add("hidden");
//     clearInterval(game_handler_event);
//     document.querySelector(".game").classList.add("hidden");
//     document.querySelector(".main").classList.remove("hidden");
// });
//
// document.querySelector("#restart").addEventListener("click", () => {
//     document.querySelector(".modal_window").classList.add("hidden");
//     clearInterval(game_handler_event);
//     start_game(player.name);
// });

document.querySelector("#play").addEventListener("click", () => {
    const nameInput = document.querySelector("#nickname");
    if (nameInput.value.length === 0) {
        alert("Введите имя");
        return;
    }
    if (nameInput.value.length > 15) {
        alert("Слишком длинное имя");
        return;
    }
    document.querySelector(".modal_window").classList.add("hidden");
    document.querySelector(".main").classList.add("hidden");
    document.querySelector(".game").classList.remove("hidden");
    start_game(nameInput.value);
});

document.querySelector("#give-up").addEventListener("click", () => {
    //handle_player_loss();
});

window.addEventListener('keydown', function (e) {
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
    set_direction(direction.UP);
    selectButton('up');
});

buttons['down'].addEventListener('click', () => {
    set_direction(direction.DOWN);
    selectButton('down');
});

buttons['left'].addEventListener('click', () => {
    set_direction(direction.LEFT);
    selectButton('left');
});

buttons['right'].addEventListener('click', () => {
    set_direction(direction.RIGHT);
    selectButton('right');
});

buttons['none'].addEventListener('click', () => {
    set_direction(direction.NONE);
    selectButton('none');
});

document.querySelector('#speed').addEventListener('click', () => {
    myWs.send(JSON.stringify({action: 'UPGRADE', id: player_id, speed: 1, power: 0, room_id: room_id}));
});

document.querySelector('#power').addEventListener('click', () => {
    myWs.send(JSON.stringify({action: 'UPGRADE', id: player_id, speed: 0, power: 1, room_id: room_id}));
});
