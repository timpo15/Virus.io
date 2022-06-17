import {broadcast} from "./server.mjs";
import {max_player_speed} from "./game_handler.js";

export const direction = {
    NONE: -1,
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
};

export class Player {
    constructor(cell_style, tower_style, id, room_id, name = "Player", strength = 0, speed = 0, direction = direction.NONE, socket = undefined, is_bot = false) {
        this.cell_style = cell_style;
        this.tower_style = tower_style;
        this.id = id;
        this.room_id = room_id;
        this.name = name;
        this.strength = strength;
        this.speed = speed;
        this.direction = direction;
        this.tower_num = 1;
        this.points = 0;
        this.socket = socket;
        this.is_bot = is_bot;
        this.alive = true;
    }

    add_speed(value) {
        value = Math.min(value, max_player_speed - this.speed, this.points);
        this.speed += value;
        this.points -= value;
    }

    add_power(value) {
        value = Math.min(value, this.points);
        this.strength += value;
        this.points -= value;
    }
}