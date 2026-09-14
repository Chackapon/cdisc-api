const ADDON_NAME = "Tree Nests";

export var DEBUG_MODE = false;//TODO export this var from main maybe??

export function setDebugMode( mode: boolean ) {
    DEBUG_MODE = mode;
}

export function log( str: string ) {
    if (DEBUG_MODE) console.log(`[${ADDON_NAME}]`, str);
}

export function warn( str: string ) {
    if (DEBUG_MODE) console.log(`[${ADDON_NAME}]`, str);
}