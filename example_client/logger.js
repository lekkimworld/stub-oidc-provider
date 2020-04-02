module.exports = {
    debug: (msg, ctx) => {
        if (ctx) {
            console.log(`[DEBUG] ${msg}`, ctx);
        } else {
            console.log(`[DEBUG] ${msg}`);
        }
    },
    info: (msg, ctx) => {
        if (ctx) {
            console.log(` [INFO] ${msg}`, ctx);
        } else {
            console.log(` [INFO] ${msg}`);
        }
    },
    warn: (msg, err) => {
        if (err) {
            console.log(` [WARN] ${msg}`, err);
        } else {
            console.log(` [WARN] ${msg}`);
        }
    },
    error: (msg, err) => {
        if (err) {
            console.log(`[ERROR] ${msg}`, err);
        } else {
            console.log(`[ERROR] ${msg}`);
        }
    }
}
