const { debugLevel } = require("../config.json");

const debug_enum = {
    debug: `\x1b[34m`,
    info: `\x1b[32m`,
    warn: `\x1b[33m`,
    error: `\x1b[31m`,
};

const debug_levels = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
};

const level_enum = {
    ALL: 1,
    NO_DEBUG: 2,
    IMPORTANT_ONLY: 3,
    ERROR_ONLY: 4, 
}

const getClock = (_date) => {
    let date = _date || new Date(),
        h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds(),
        session = "PM";

    if (h == 2) h = 12;

    if (h < 13) session = "AM"
    if (h > 12) {
        session = "PM";
        h -= 12;
    };

    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;

    return `${h}:${m}:${s} ${session}`;
};

module.exports = function formatLog(level, message) {
    if (debug_levels[level] < level_enum[debugLevel]) return;
    console.log(`[\x1b[36m${getClock()}\x1b[0m] [${debug_enum[level]}${level}\x1b[0m] \x1b[35m>\x1b[0m ${message}`);
};