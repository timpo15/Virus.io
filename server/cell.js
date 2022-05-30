import {broadcast} from "./server.mjs";

export const cell_types = {
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

export class Cell {
    constructor(tag, id, state = cell_types.FREE, player = undefined) {
        this.tag = tag;
        this.id = id;
        this._state = state;
        this.player = player;
    }

    set state(value) {
        this._state = value;
        broadcast({action: 'CELL', cell_id: this.id, state: value});
    }

    get state() {
        return this._state;
    }
}