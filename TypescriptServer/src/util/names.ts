import Profile from "#schemas/profile";


export class Names {
    static async isValid(name:string) {
        name = name.toLowerCase();

        if ((await Profile.exists({ name })) !== null) {
            return false;
        }
        if (name.startsWith('guest')) {
            return false;
        }

        return true;
    }

    static guest_counter = 1;

    static getDefaultName():string {
        let s = (this.guest_counter++).toString();
        s = '0'.repeat(3 - s.length) + s;
        return 'Guest' + s;
    }
}