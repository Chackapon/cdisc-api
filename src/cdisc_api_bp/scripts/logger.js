const ADDON_NAME = "Tree Nests";
export var DEBUG_MODE = false; //TODO export this var from main maybe??
export function setDebugMode(mode) {
    DEBUG_MODE = mode;
}
export function log(str) {
    if (DEBUG_MODE)
        console.log(`[${ADDON_NAME}]`, str);
}
export function warn(str) {
    if (DEBUG_MODE)
        console.log(`[${ADDON_NAME}]`, str);
}
