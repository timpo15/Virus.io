import {cell_types} from "./cell.js";

export const direction = {
    NONE: -1,
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
};

export class Player {
    constructor(cell, tower, name = "Player", strength = 0, speed = 0, dir = direction.NONE) {
        this.cell = cell;
        this.tower = tower;
        this.name = name;
        this.strength = strength;
        this.speed = speed;
        this.dir = dir;
    }
}