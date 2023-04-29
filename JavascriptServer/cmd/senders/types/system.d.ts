import { ValidationError } from "fastest-validator";
declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendServerInfo(compatible: boolean): any;
        sendPing(): any;
        sendPong(T: number): any;
        sendServerTime(client_t: number): any;
        sendInvalidInput(from_cmd: string, errors: ValidationError[]): any;
    }
}
