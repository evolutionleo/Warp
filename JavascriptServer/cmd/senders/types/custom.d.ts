import { IPlayerInputs } from "#entity/player";
declare module "#cmd/sendStuff" {
    interface SendStuff {
        sendPlayerControls(data: IPlayerInputs): any;
    }
}
