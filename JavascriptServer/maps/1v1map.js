import { levelFind } from "#concepts/level";
import GameMap from "#concepts/map";

let level = levelFind('One Versus One');

export default new GameMap(level, '1v1');
