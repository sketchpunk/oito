declare class GamepadTracker {
    constructor();
    onDisconnect(e: any): void;
    onConnect(e: any): void;
    update(): void;
}
export default GamepadTracker;
