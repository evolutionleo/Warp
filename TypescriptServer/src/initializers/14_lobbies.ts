import { lobbyCreate } from '#concepts/lobby';

global.maps.forEach(map => lobbyCreate(map));