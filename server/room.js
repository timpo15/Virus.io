import {generate_table} from "./map_creation.js";
import {field_width, field_height} from "./game_handler.js";

export class Room {
    constructor(id) {
        this.id = id;
        this.players = new Array(0);
        this.map = generate_table(field_height, field_width);
        this.interval = undefined;
    }
}