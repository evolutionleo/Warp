import Client from "#concepts/client";
import Entity from "#concepts/entity";
import Room from "#concepts/room";
import trace from "#util/logging";
import PlayerEntity from "./player";

type WarpPortalType = 'Entrance' | 'Exit' | 'Both';

export default class WarpPortal extends Entity {
    static type = 'WarpPortal';
    static object_name = 'oWarpPortal';
    is_static = true;
    is_solid = false;
    // is_trigger = true;

    base_size = {
        x: 32,
        y: 32
    }

    collider_type = 'box';


    exit_portal:WarpPortal = null;
    portal_type:WarpPortalType|string = 'Entrance';
    room_to:string = undefined;
    warp_id:number = undefined; // to link the exit portal with an entrance
    continuous_collision:{ e: PlayerEntity, t: number }[] = [];

    prop_names = [ 'portal_type', 'room_to', 'warp_id' ];

    Room_to:Room = null; // with the Capital letter

    get enterable() {
        return (this.portal_type === 'Entrance'
            || this.portal_type === 'Both')
    }

    get exitable() {
        return (this.portal_type === 'Exit'
            || this.portal_type === 'Both')
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
        this.exit_portal.continuous_collision.push({e: player.entity, t: 1 });
    }

    update() {
        if (this.enterable) {
            let players = this.placeMeetingAll<PlayerEntity>(this.x, this.y, 'Player');

            this.continuous_collision = this.continuous_collision.filter(c => {
                if (!this.checkCollision(this.x, this.y, c.e)) c.t--;
                return c.t >= 0;
            });

            // teleport
            players.forEach(player => {
                if (this.continuous_collision.findIndex(c => (c.e == player)) == -1)
                    this.teleport(player.client);
            })
        }

        super.update();
    }
}