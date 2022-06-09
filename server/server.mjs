import WebSocket, {WebSocketServer} from 'ws';
import {v4} from "uuid";
import {start_game} from "./index.mjs";
import {field_height, field_width, handle_loss} from "./game_handler.js";
import {Room} from "./room.js";
import {direction, Player} from "./player.js";
import {cell_types} from "./cell.js";

export const wsServer = new WebSocketServer({port: 9000});
wsServer.on('connection', onConnect);

export function broadcast(room, message) {
    for (const player of room.players) {
        if (player.socket !== undefined) {
            player.socket.send(JSON.stringify(message));
        }
    }
}

export const styles = [[cell_types.P1, cell_types.P1_TOWER],
    [cell_types.P2, cell_types.P2_TOWER],
    [cell_types.P3, cell_types.P3_TOWER],
    [cell_types.P4, cell_types.P4_TOWER]];

const rooms = {}
const players = {};
const sockets = {};

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
                    const host = new Player(p, p_tower, v4(), room.id, jsonMessage.name, 0, 0, direction.NONE, wsClient);
                    sockets[wsClient] = host.id;
                    room.players.push(host);
                    rooms[room.id] = room;
                    players[host.id] = host;
                    room.observers_number++;
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
                    if (!(jsonMessage.room_id in rooms)) {
                        wsClient.send(JSON.stringify({
                            action: 'WRONG_ROOM_ID'
                        }));
                    }
                    const room = rooms[jsonMessage.room_id];
                    if (room.players.length === 4) {
                        wsClient.send(JSON.stringify({
                            action: 'FULL_ROOM'
                        }));
                    }
                    const [p, p_tower] = styles[room.players.length];
                    const slave = new Player(p, p_tower, v4(), room.id, jsonMessage.name, 0, 0, direction.NONE, wsClient);
                    sockets[wsClient] = slave.id;
                    players[slave.id] = slave;
                    room.players.push(slave);
                    room.observers_number++;
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
                    if (room.players[0].id === jsonMessage.id) {
                        start_game(room);
                    }
                    else {
                        wsClient.send(JSON.stringify({
                            action: 'ACCESS_DENIED'
                        }));
                    }
                    break;
                }
                case 'SET_DIRECTION':
                    players[jsonMessage.id].direction = jsonMessage.direction;
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
                case 'GIVE_UP':
                    handle_loss(rooms[jsonMessage.room_id].map, players[jsonMessage.id]);
                    break;
                case 'LEAVE':
                    players[jsonMessage.id].socket = undefined;
                    rooms[players[jsonMessage.id].room_id].observers_number--;
                    if (rooms[players[jsonMessage.id].room_id].observers_number === 0) {
                        delete_room(players[jsonMessage.id].room_id);
                    }
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
        if (wsClient in sockets) {
            rooms[players[sockets[wsClient]].room_id].observers_number--;
            if (rooms[players[sockets[wsClient]].room_id].observers_number === 0) {
                delete_room(players[sockets[wsClient]].room_id);
            }
            delete sockets[wsClient];
        }
    });
}

console.log('Сервер запущен на 9000 порту');

function delete_room(room_id) {
    console.log("DELETING ROOM");
    clearInterval(rooms[room_id].interval);
    for (const player of rooms[room_id].players) {
        if (player.socket !== undefined) {
            delete sockets[player.socket];
        }
        delete players[player.id];
    }
    delete rooms[room_id];
}