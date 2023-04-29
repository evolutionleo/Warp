declare module "#cmd/sendStuff" {
    interface SendStuff {
        sendRegister(status: string, reason?: string): any;
        sendLogin(status: string, reason?: string): any;
    }
}
export {};
