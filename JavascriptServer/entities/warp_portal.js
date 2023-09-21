import Entity from "#concepts/entity";

export default class WarpPortal extends Entity {
    static type = 'Warp Portal';
    static object_name = 'oWarpPortal';
    is_static = true;
    is_solid = false;
    // is_trigger = true;
    
    base_size = {
        x: 32,
        y: 32
    };
    
    collider_type = 'box';
    
    
    exit_portal = null;
    portal_type = 'Entrance';
    room_to = undefined;
    warp_id = undefined; // to link the exit portal with an entrance
    continuous_collision = [];
    
    prop_names = ['portal_type', 'room_to', 'warp_id'];
    
    Room_to = null; // with the Capital letter
    
    get enterable() {
        return (this.portal_type === 'Entrance'
            || this.portal_type === 'Both');
    }
    
    get exitable() {
        return (this.portal_type === 'Exit'
            || this.portal_type === 'Both');
    }
    
    findExitPortal() {
        return this.Room_to.entities.ofType(this.type).find(e => e.warp_id == this.warp_id && e !== this);
    }
    
    findRoomTo() {
        return this.room.lobby.rooms.find(room => room.level.room_name === this.room_to);
    }
    
    teleport(player) {
        if (this.Room_to === null) {
            this.Room_to = this.findRoomTo();
        }
        if (this.exit_portal === null) {
            this.exit_portal = this.findExitPortal();
        }
        
        
        if (this.room !== this.Room_to) {
            // player.room should be the same as this.room
            this.room.movePlayer(player, this.Room_to);
        }
        
        player.entity.x = this.exit_portal.x;
        player.entity.y = this.exit_portal.y;
        this.exit_portal.continuous_collision.push({ e: player.entity, t: 1 });
    }
    
    update() {
        if (this.enterable) {
            this.continuous_collision = this.continuous_collision.filter(c => {
                if (!this.checkCollision(this.x, this.y, c.e))
                    c.t--;
                return c.t >= 0;
            });
            
            let players = this.placeMeetingAll(this.x, this.y, 'Player');
            
            // teleport
            players.forEach(player => {
                if (!this.continuous_collision.some(c => c.e == player)) {
                    // if (!this.exit_portal.placeMeeting())
                    this.teleport(player.client);
                }
            });
        }
        
        super.update();
    }
}
