export const cell_types = {
    FREE: "free_cell",
    WALL: "wall_cell",
    FREE_TOWER: "free_tower_cell",
    P1: "p1_cell",
    P2: "p2_cell",
    P1_TOWER: "p1_tower_cell",
    P2_TOWER: "p2_tower_cell",
};

export class Cell {
    constructor(tag, id, state = cell_types.FREE) {
        this.tag = tag;
        this.id = id;
        this._state = state;
    }

    set state(value) {
        this._state = value;
        this.tag.setAttribute("class", value);
    }

    get state() {
        return this._state;
    }
}