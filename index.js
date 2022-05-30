import {Cell, cell_types} from "./cell.js";
import {direction, Player} from "./player.js";
import {generate_map, clear_map, check_tower_connectivity_and_fill_holes, generate_table} from "./map_creation.js";
import {game_handler, field_height, field_width, tps, max_player_speed} from "./game_handler.js";

export let player = undefined;
let game_handler_event = undefined;

export function handle_player_loss() {
    document.querySelector("#modal-text").innerText = "Вы проиграли, вы лох";
    document.querySelector(".modal_window").classList.remove("hidden");
}

export function handle_player_win() {
    document.querySelector("#modal-text").innerText = "Вы выиграли, но все равно вы лох";
    document.querySelector(".modal_window").classList.remove("hidden");
}

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

export function print_points(points) {
    document.querySelector('#player-score > span').textContent = points;
}

function start_game(player_name) {
    let players = [
        new Player(cell_types.P1, cell_types.P1_TOWER, player_name, 0, 0, direction.NONE),
        new Player(cell_types.P2, cell_types.P2_TOWER, "enemy_1", 0, 0, direction.DOWN),
        new Player(cell_types.P3, cell_types.P3_TOWER, "enemy_2", 0, 0, direction.NONE),
        new Player(cell_types.P4, cell_types.P4_TOWER, "enemy_3", 0, 0, direction.NONE)];
    player = players[0];
    document.querySelector('#speed > span').textContent = player.speed.toString();
    document.querySelector('#power > span').textContent = player.strength.toString();
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
    //TODO: добавить открытие окошка с правилами
    document.querySelector(".main").classList.add("hidden");
    document.querySelector("#rule-text").innerText = "Статья 1\n" +
        "\n" +
        "1. Российская Федерация - Россия есть демократическое федеративное правовое государство с республиканской формой правления.\n" +
        "\n" +
        "2. Наименования Российская Федерация и Россия равнозначны.\n" +
        "\n" +
        "Статья 2\n" +
        "\n" +
        "Человек, его права и свободы являются высшей ценностью. Признание, соблюдение и защита прав и свобод человека и гражданина - обязанность государства.\n" +
        "\n" +
        "Статья 3\n" +
        "\n" +
        "1. Носителем суверенитета и единственным источником власти в Российской Федерации является ее многонациональный народ.\n" +
        "\n" +
        "2. Народ осуществляет свою власть непосредственно, а также через органы государственной власти и органы местного самоуправления.\n" +
        "\n" +
        "3. Высшим непосредственным выражением власти народа являются референдум и свободные выборы.\n" +
        "\n" +
        "4. Никто не может присваивать власть в Российской Федерации. Захват власти или присвоение властных полномочий преследуется по федеральному закону.\n" +
        "\n" +
        "Статья 4\n" +
        "\n" +
        "1. Суверенитет Российской Федерации распространяется на всю ее территорию.\n" +
        "\n" +
        "2. Конституция Российской Федерации и федеральные законы имеют верховенство на всей территории Российской Федерации.\n" +
        "\n" +
        "3. Российская Федерация обеспечивает целостность и неприкосновенность своей территории.\n" +
        "\n" +
        "Статья 5\n" +
        "\n" +
        "1. Российская Федерация состоит из республик, краев, областей, городов федерального значения, автономной области, автономных округов - равноправных субъектов Российской Федерации.\n" +
        "\n" +
        "2. Республика (государство) имеет свою конституцию и законодательство. Край, область, город федерального значения, автономная область, автономный округ имеет свой устав и законодательство.\n" +
        "\n" +
        "3. Федеративное устройство Российской Федерации основано на ее государственной целостности, единстве системы государственной власти, разграничении предметов ведения и полномочий между органами государственной власти Российской Федерации и органами государственной власти субъектов Российской Федерации, равноправии и самоопределении народов в Российской Федерации.\n" +
        "\n" +
        "4. Во взаимоотношениях с федеральными органами государственной власти все субъекты Российской Федерации между собой равноправны.\n" +
        "\n" +
        "Статья 6\n" +
        "\n" +
        "1. Гражданство Российской Федерации приобретается и прекращается в соответствии с федеральным законом, является единым и равным независимо от оснований приобретения.\n" +
        "\n" +
        "2. Каждый гражданин Российской Федерации обладает на ее территории всеми правами и свободами и несет равные обязанности, предусмотренные Конституцией Российской Федерации.\n" +
        "\n" +
        "3. Гражданин Российской Федерации не может быть лишен своего гражданства или права изменить его.\n" +
        "\n" +
        "Статья 7\n" +
        "\n" +
        "1. Российская Федерация - социальное государство, политика которого направлена на создание условий, обеспечивающих достойную жизнь и свободное развитие человека.\n" +
        "\n" +
        "2. В Российской Федерации охраняются труд и здоровье людей, устанавливается гарантированный минимальный размер оплаты труда, обеспечивается государственная поддержка семьи, материнства, отцовства и детства, инвалидов и пожилых граждан, развивается система социальных служб, устанавливаются государственные пенсии, пособия и иные гарантии социальной защиты.\n" +
        "\n" +
        "Статья 8\n" +
        "\n" +
        "1. В Российской Федерации гарантируются единство экономического пространства, свободное перемещение товаров, услуг и финансовых средств, поддержка конкуренции, свобода экономической деятельности.\n" +
        "\n" +
        "2. В Российской Федерации признаются и защищаются равным образом частная, государственная, муниципальная и иные формы собственности.\n" +
        "\n" +
        "Статья 9\n" +
        "\n" +
        "1. Земля и другие природные ресурсы используются и охраняются в Российской Федерации как основа жизни и деятельности народов, проживающих на соответствующей территории.\n" +
        "\n" +
        "2. Земля и другие природные ресурсы могут находиться в частной, государственной, муниципальной и иных формах собственности.\n" +
        "\n" +
        "Статья 10\n" +
        "\n" +
        "Государственная власть в Российской Федерации осуществляется на основе разделения на законодательную, исполнительную и судебную. Органы законодательной, исполнительной и судебной власти самостоятельны.\n" +
        "\n" +
        "Статья 11\n" +
        "\n" +
        "1. Государственную власть в Российской Федерации осуществляют Президент Российской Федерации, Федеральное Собрание (Совет Федерации и Государственная Дума), Правительство Российской Федерации, суды Российской Федерации.\n" +
        "\n" +
        "2. Государственную власть в субъектах Российской Федерации осуществляют образуемые ими органы государственной власти.\n" +
        "\n" +
        "3. Разграничение предметов ведения и полномочий между органами государственной власти Российской Федерации и органами государственной власти субъектов Российской Федерации осуществляется настоящей Конституцией, Федеративным и иными договорами о разграничении предметов ведения и полномочий.\n" +
        "\n" +
        "Статья 12\n" +
        "\n" +
        "В Российской Федерации признается и гарантируется местное самоуправление. Местное самоуправление в пределах своих полномочий самостоятельно. Органы местного самоуправления не входят в систему органов государственной власти.\n" +
        "\n" +
        "Статья 13\n" +
        "\n" +
        "1. В Российской Федерации признается идеологическое многообразие.\n" +
        "\n" +
        "2. Никакая идеология не может устанавливаться в качестве государственной или обязательной.\n" +
        "\n" +
        "3. В Российской Федерации признаются политическое многообразие, многопартийность.\n" +
        "\n" +
        "4. Общественные объединения равны перед законом.\n" +
        "\n" +
        "5. Запрещается создание и деятельность общественных объединений, цели или действия которых направлены на насильственное изменение основ конституционного строя и нарушение целостности Российской Федерации, подрыв безопасности государства, создание вооруженных формирований, разжигание социальной, расовой, национальной и религиозной розни.\n" +
        "\n" +
        "Статья 14\n" +
        "\n" +
        "1. Российская Федерация - светское государство. Никакая религия не может устанавливаться в качестве государственной или обязательной.\n" +
        "\n" +
        "2. Религиозные объединения отделены от государства и равны перед законом.\n" +
        "\n" +
        "Статья 15\n" +
        "\n" +
        "1. Конституция Российской Федерации имеет высшую юридическую силу, прямое действие и применяется на всей территории Российской Федерации. Законы и иные правовые акты, принимаемые в Российской Федерации, не должны противоречить Конституции Российской Федерации.\n" +
        "\n" +
        "2. Органы государственной власти, органы местного самоуправления, должностные лица, граждане и их объединения обязаны соблюдать Конституцию Российской Федерации и законы.\n" +
        "\n" +
        "3. Законы подлежат официальному опубликованию. Неопубликованные законы не применяются. Любые нормативные правовые акты, затрагивающие права, свободы и обязанности человека и гражданина, не могут применяться, если они не опубликованы официально для всеобщего сведения.\n" +
        "\n" +
        "4. Общепризнанные принципы и нормы международного права и международные договоры Российской Федерации являются составной частью ее правовой системы. Если международным договором Российской Федерации установлены иные правила, чем предусмотренные законом, то применяются правила международного договора.\n" +
        "\n" +
        "Статья 16\n" +
        "\n" +
        "1. Положения настоящей главы Конституции составляют основы конституционного строя Российской Федерации и не могут быть изменены иначе как в порядке, установленном настоящей Конституцией.\n" +
        "\n" +
        "2. Никакие другие положения настоящей Конституции не могут противоречить основам конституционного строя Российской Федерации.";
    document.querySelector(".rules_window").classList.remove("hidden");
});

document.querySelector("#close").addEventListener("click", () => {
    document.querySelector(".rules_window").classList.add("hidden");
    document.querySelector(".main").classList.remove("hidden");
});

document.querySelector("#menu").addEventListener("click", () => {
    document.querySelector(".modal_window").classList.add("hidden");
    clearInterval(game_handler_event);
    document.querySelector(".game").classList.add("hidden");
    document.querySelector(".main").classList.remove("hidden");
});

document.querySelector("#restart").addEventListener("click", () => {
    document.querySelector(".modal_window").classList.add("hidden");
    clearInterval(game_handler_event);
    start_game(player.name);
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
   document.querySelector(".modal_window").classList.add("hidden");
   document.querySelector(".main").classList.add("hidden");
   document.querySelector(".game").classList.remove("hidden");
   start_game(nameInput.value);
});

document.querySelector("#give-up").addEventListener("click", () => {
    handle_player_loss();
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