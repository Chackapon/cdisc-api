import {
    Block,
    world
} from "@minecraft/server";

import {
    JUKEBOX_BLOCK_TYPES
} from "./default_const";



export function getJukeboxID( jukebox: Block ) {
    if (!jukebox) return "none";
    return `${String(jukebox.dimension.id)}@${jukebox.location.x}_${jukebox.location.y}_${jukebox.location.z}`;
}

export function isBlockJukebox( block: Block | undefined ) {
    if ( !block ) return false;
    return JUKEBOX_BLOCK_TYPES.has( block.typeId );
}

export function fromJukeboxID( id: string ) {
    if (!id || id === "none") return undefined;

    const [dimensionId, coords] = id.split("@");
    const [x, y, z] = coords.split("_").map(Number);

    return {
        dimension: world.getDimension(dimensionId),
        location: { x, y, z }
    };
}