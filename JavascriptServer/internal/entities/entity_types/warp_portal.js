import Entity from '#concepts/entity';
import Collider from '#concepts/collider';

export default class WarpPortal extends Entity {
    static direction = {
        entrance: 'Entrance',
        exit: 'Exit',
        both: 'Both'
    };

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
    
    collider_type = Collider.type.polygon;
    
    
    exit_portal = null;
    portal_type = 'Entrance';
    room_to = undefined;
    warp_id = undefined; // to link the exit portal with an entrance
    continuous_collision = [];
    
    propNames = ['portal_type', 'room_to', 'warp_id'];
    
    Room_to = null; // with the Capital letter
    
    get enterable() {
        return (this.portal_type === WarpPortal.direction.entrance
            || this.portal_type === WarpPortal.direction.both);
    }
    
    get exitable() {
        return (this.portal_type === WarpPortal.direction.exit
            || this.portal_type === WarpPortal.direction.both);
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
