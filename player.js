
export const direction = {
    NONE: -1,
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
};

export class Player {
    constructor(cell_style, tower_style, name = "Player", strength = 0, speed = 0, direction = direction.NONE) {
        this.cell_style = cell_style;
        this.tower_style = tower_style;
        this.name = name;
        this.strength = strength;
        this.speed = speed;
        this.direction = direction;
        this.tower_num = 1;
        this.points = 0;
    }
}