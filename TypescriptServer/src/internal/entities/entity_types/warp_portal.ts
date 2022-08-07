import Client from "#concepts/client";
import Entity from "#concepts/entity";
import Room from "#concepts/room";
import trace from "#util/logging";
import PlayerEntity from "./player";

enum WarpPortalType {
    Entrance = 'Entrance',
    Exit = 'Exit',
    Both = 'Both'
}

export default class WarpPortal extends Entity {
    isStatic = true;
    isSolid = false;
    // isTrigger = true;

    static type = 'Warp Portal';
    static object_name = 'oWarpPortal';
    type = WarpPortal.type;
    object_name = WarpPortal.object_name;

    base_size = {
        x: 32,
        y: 32
    }

    collider_type = 'polygon';


    exit_portal:WarpPortal = null;
    portal_type:WarpPortalType|string = WarpPortalType.Entrance;
    room_to:string = undefined;
    warp_id:number = undefined; // to link the exit portal with an entrance
    continuous_collision:PlayerEntity[] = [];

    propNames = [ 'portal_type', 'room_to', 'warp_id' ];

    Room_to:Room = null; // with the Capital letter

    get enterable() {
        return (this.portal_type === WarpPortalType.Entrance
            || this.portal_type === WarpPortalType.Both)
    }

    get exitable() {
        return (this.portal_type === WarpPortalType.Exit
            || this.portal_type === WarpPortalType.Both)
    }

    private findExitPortal():WarpPortal {
        return this.Room_to.entities.ofType('Warp Portal').find(e => (e as WarpPortal).warp_id == this.warp_id) as WarpPortal;
    }

    private findRoomTo():Room {
        return this.room.lobby.rooms.find(room => room.map.room_name === this.room_to);
    }

    private teleport(player:Client):void {
        if (this.Room_to === null) {
            this.Room_to = this.findRoomTo();
        }
        if (this.exit_portal === null) {
            this.exit_portal = this.findExitPortal();
        }

        // player.room should be the same as this.room
        this.room.movePlayer(player, this.Room_to);

        player.entity.x = this.exit_portal.x;
        player.entity.y = this.exit_portal.y;
        this.exit_portal.continuous_collision.push(player.entity);
    }

    update() {
        if (this.enterable) {
            let players = this.placeMeetingAll(this.x, this.y, 'Player') as PlayerEntity[];
            this.continuous_collision = this.continuous_collision.filter(c => players.includes(c));
            // teleport
            players.forEach(player => {
                if (!this.continuous_collision.includes(player))
                    this.teleport(player.client);
            })
        }

        super.update();
    }
}