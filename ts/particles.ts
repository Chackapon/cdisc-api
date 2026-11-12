import {RecordSong} from "./default_const";
import {Block, MolangVariableMap, RGB, system, Vector3} from "@minecraft/server";
// import {Vector3Utils} from "@minecraft/math";


// TODO docuemtn
const COLOR_GRADIENT_MAP = [
    "FF0000",
    "FF8100",
    "FFF800",
    "00FF04",
    "00FFFF",
    "0A00FF",
    "FE00FF",
    "FF0000"
]

/**
 * Converts a string hex color into an Object with decimal representation for each color channel
 * @param hex
 */
function hexToVector( hex: string ): Vector3 {
    const extractColor = ( idx: number ) => {
        return hex.substring(idx*2, idx*2 + 2);
    }

    return {
        x: parseInt( extractColor(0), 16 ),
        y: parseInt( extractColor(1), 16 ),
        z: parseInt( extractColor(2), 16 )
    }
}

// TODO document
function lerp( a: number, b: number, t: number ) {
    return t*b + (1-t)*a
}

// TODO document
function interpolateColors(color_a: Vector3, color_b: Vector3, t: number) {
    // return Vector3Utils.lerp(color_a, color_b, t);
    return {
        x: lerp(color_a.x, color_b.x, t),
        y: lerp(color_a.y, color_b.y, t),
        z: lerp(color_a.z, color_b.z, t),
    }
}

/**
 * Interpolate a [0,1] value to a color
 * @param x
 */
function interpolateColor( x: number ): RGB {

    const delta = 1 / (COLOR_GRADIENT_MAP.length - 1);
    const t = x % delta;

    // Select range
    let start_i = 0
    let end_i = COLOR_GRADIENT_MAP.length - 1

    while (end_i - start_i !== 1) {
        let s = start_i + Math.floor( (end_i - start_i) / 2 );
        if (x < delta*s) end_i = s;
        else start_i = s;
    }

    // Select color range for given x
    const color_a = hexToVector( COLOR_GRADIENT_MAP[start_i] )
    const color_b = hexToVector( COLOR_GRADIENT_MAP[end_i] )

    // Interpolate color
    const result = interpolateColors(color_a, color_b, t)

    console.log(t)
    console.log(JSON.stringify(result))

    // Convert Vector3 to color
    return {
        red: result.x,
        green: result.y,
        blue: result.z,
    }
}

/**
 * Single atomic operation of spawning a particle
 * @param jukebox
 * @param song
 */
function noteParticleTick(jukebox: Block, song: RecordSong) {

    // Calculate and set particle color

    const molang_var_map = new MolangVariableMap();

    //TODO add easter eggs
    switch (song.author) {
        case "Bułgar":
        case "bulgar":
            console.log("Easter egg particle Bułgar")
            break
        default:
            break
    }
    // TODO add key color ranges
    const x = system.currentTick / 20
    const t = (Math.sin(x) + 1) / 2
    molang_var_map.setColorRGB("variable.note_color", interpolateColor(t));

    // Spawn particle
    jukebox.dimension.spawnParticle("minecraft:note_particle", {
        x: jukebox.location.x + 0.5,
        y: jukebox.location.y + 1.2,
        z: jukebox.location.z + 0.5
    }, molang_var_map);
}


// TODO document
export function registerParticleTicker(song: RecordSong, jukebox: Block) {

    // Calculate particle spawning interval (can't be less than 1 tick
    const particleInterval = Math.ceil((song.bpm ?? 60) / 3 / 4) || 1;

    // Play particle once and register particle spawner loop
    noteParticleTick(jukebox, song)
    return system.runInterval(() => noteParticleTick(jukebox, song), particleInterval);
}