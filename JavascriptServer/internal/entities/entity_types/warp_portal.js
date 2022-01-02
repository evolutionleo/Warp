import Entity from "#concepts/entity";
import trace from "#util/logging";

var WarpPortalType;
(function (WarpPortalType) {
    WarpPortalType["Entrance"] = "Entrance";
    WarpPortalType["Exit"] = "Exit";
    WarpPortalType["Both"] = "Both";
})(WarpPortalType || (WarpPortalType = {}));

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
    };
    
    collider_type = 'polygon';
    
    
    exit_portal = null;
    portal_type = WarpPortalType.Entrance;
    room_to = undefined;
    warp_id = undefined; // to link the exit portal with an entrance
    continuous_collision = [];
    
    propNames = ['portal_type', 'room_to', 'warp_id'];
    
    Room_to = null; // with the Capital letter
    
    get enterable() {
        return (this.portal_type === WarpPortalType.Entrance
            || this.portal_type === WarpPortalType.Both);
    }
    
    get exitable() {
        return (this.portal_type === WarpPortalType.Exit
            || this.portal_type === WarpPortalType.Both);
    }
    
    findExitPortal() {
        return this.Room_to.entities.ofType('Warp Portal').find(e => e.warp_id == this.warp_id);
    }
    
    findRoomTo() {
        return this.room.lobby.rooms.find(room => room.map.room_name === this.room_to);
    }
    
    teleport(player) {
        if (this.Room_to === null) {
            this.Room_to = this.findRoomTo();
        }
        if (this.exit_portal === null) {
            this.exit_portal = this.findExitPortal();
        }
        
        // player.room should be the same as this.room
        trace('room transition:', this.room.map.room_name + " -> " + this.Room_to.map.room_name);
        this.room.movePlayer(player, this.Room_to);
        
        player.entity.x = this.exit_portal.x;
        player.entity.y = this.exit_portal.y;
        this.exit_portal.continuous_collision.push(player.entity);
    }
    
    update() {
        if (this.enterable) {
            let players = this.placeMeetingAll(this.x, this.y, 'Player');
            this.continuous_collision = this.continuous_collision.filter(c => players.includes(c));
            // teleport
            players.forEach(player => {
                if (!this.continuous_collision.includes(player))
                    this.teleport(player.client);
            });
        }
        
        super.update();
    }
}
