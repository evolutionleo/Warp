import Profile from "#schemas/profile";


export class Names {
    static async isValid(name) {
        name = name.toLowerCase();
        
        if ((await Profile.exists({ name })) !== null) {
            return false;
        }
        if (name.startsWith('guest')) {
            return false;
        }
        if (name === 'system')
            return false;
        
        return true;
    }
    
    static guest_counter = 1;
    
    static getDefaultName() {
        // let s = (this.guest_counter++).toString();
        let s = Math.floor(Math.random() * 1000000).toString();
        s = '0'.repeat(6 - s.length) + s;
        return 'guest' + s;
    }
    
    static next = this.getDefaultName;
    static get = this.getDefaultName;
    static generate = this.getDefaultName;
}
