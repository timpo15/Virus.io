import WebSocket, {WebSocketServer} from 'ws';
import {v4} from "uuid";
import {player, start_game} from "./index.mjs";
import {field_height, field_width} from "./game_handler.js";
import {Room} from "./room.js";
import {direction, Player} from "./player.js";
import {cell_types} from "./cell.js";

export const wsServer = new WebSocketServer({port: 9000});
wsServer.on('connection', onConnect);

export function broadcast(message) {
    for (const client of wsServer.clients) {
        client.send(JSON.stringify(message));
    }
}

export const styles = [[cell_types.P1, cell_types.P1_TOWER],
    [cell_types.P2, cell_types.P2_TOWER],
    [cell_types.P3, cell_types.P3_TOWER],
    [cell_types.P4, cell_types.P4_TOWER]];
const rooms = {}
const players = {};

function onConnect(wsClient) {
    console.log('Новый пользователь');
    wsClient.on('message', function (message) {
        try {
            const jsonMessage = JSON.parse(message);
            console.log(jsonMessage);
            console.log(jsonMessage.action);
            switch (jsonMessage.action) {
                case 'ECHO':
                    wsClient.send(jsonMessage.data);
                    break;
                case 'PING':
                    setTimeout(function () {
                        wsClient.send('PONG');
                    }, 2000);
                    break;
                case 'CREATE_ROOM': {
                    const room = new Room(v4());
                    const [p, p_tower] = styles[0];
                    const host = new Player(p, p_tower, v4(), room.id, jsonMessage.name, 0, 0, direction.NONE);
                    room.players.push(host);
                    rooms[room.id] = room;
                    players[host.id] = host;
                    wsClient.send(JSON.stringify({
                        action: 'CONSTANTS',
                        width: field_width,
                        height: field_height,
                        id: host.id,
                        room_id: room.id
                    }));
                    break;
                }
                case 'JOIN_ROOM': {
                    const room = rooms[jsonMessage.room_id];
                    if (room.players.length === 4) {
                        wsClient.send("Poshel naxui");
                        break;
                    }
                    const [p, p_tower] = styles[room.players.length];
                    const slave = new Player(p, p_tower, v4(), room.id, jsonMessage.name, 0, 0, direction.NONE);
                    players[slave.id] = slave;
                    room.players.push(slave);
                    wsClient.send(JSON.stringify({
                        action: 'CONSTANTS',
                        width: field_width,
                        height: field_height,
                        id: slave.id,
                        room_id: room.id
                    }));
                    break;
                }
                case 'START_GAME': {
                    const room = rooms[jsonMessage.room_id];
                    if (room.players[0].id === jsonMessage.id)
                        start_game(room);
                    break;
                }
                case 'SET_DIRECTION':
                    players[jsonMessage.id] = jsonMessage.direction;
                    break;
                case 'UPGRADE':
                    let p = players[jsonMessage.id];
                    p.add_speed(jsonMessage.speed);
                    p.add_power(jsonMessage.power);
                    wsClient.send(JSON.stringify({
                        action: 'UPGRADE',
                        speed: p.speed,
                        power: p.strength
                    }));
                    wsClient.send(JSON.stringify({
                        action: 'POINTS',
                        points: p.points
                    }));
                    break;
                default:
                    console.log('Неизвестная команда');
                    break;
            }
        } catch (error) {
            console.log('Ошибка', error);
        }
    });
    wsClient.on('close', function () {
        // отправка уведомления в консоль
        console.log('Пользователь отключился');
    });
}

console.log('Сервер запущен на 9000 порту');