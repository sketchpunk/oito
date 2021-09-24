class Identify {
    static uuid() {
        let dt = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function")
            dt += performance.now(); //use high-precision timer if available
        const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    static nanoId(t = 21) {
        const r = crypto.getRandomValues(new Uint8Array(t));
        let n, e = "";
        for (; t--;) {
            n = 63 & r[t];
            e += (n < 36) ? n.toString(36) :
                (n < 62) ? (n - 26).toString(36).toUpperCase() :
                    (n < 63) ? "_" : "-";
        }
        return e;
    }
}
export default Identify;
