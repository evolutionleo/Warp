import Client from "#concepts/client";
import Entity from "#concepts/entity";
import Room from "#concepts/room";
import PlayerEntity from "./player";

enum WarpPortalType {
    Entrance = 'Entrance',
    Exit = 'Exit',
    Both = 'Both'
}

export default class WarpPortal extends Entity {
    isStatic = true;
    // isTrigger = true;

    static type = 'Warp Portal';
    static object_name = 'oWarpPortal';
    type = WarpPortal.type;
    object_name = WarpPortal.object_name;


    portal_type:WarpPortalType = WarpPortalType.Entrance;
    room_to:Room = undefined;
    warp_id:number = undefined; // to link the exit portal with an entrance
    continuous_collision:Entity[];

    // propNames = [ 'portal_type', 'room_to', 'warp_id', 'continuous_collision' ];

    get enterable() {
        return (this.portal_type === WarpPortalType.Entrance
            || this.portal_type === WarpPortalType.Both)
    }

    get exitable() {
        return (this.portal_type === WarpPortalType.Exit
            || this.portal_type === WarpPortalType.Both)
    }

    private teleport(player:Client):void {
        // player.room is the same as this.room
        this.room.movePlayer(player, this.room_to);
    }

    update() {
        if (this.enterable) {
            let players = this.placeMeetingAll(this.x, this.y, 'Player') as PlayerEntity[];
            // teleport
            players.forEach(player => {
                this.teleport(player.client);
            })
        }
    }
}