import {Block, world} from "@minecraft/server";

/**
 * Encodes a Block object into a string ID
 * @param jukebox
 */
export function getBlockID(jukebox: Block ) {
    if (!jukebox) return "none";
    return `${String(jukebox.dimension.id)}@${jukebox.location.x}_${jukebox.location.y}_${jukebox.location.z}`;
}

/**
 * Decodes the string ID and retrieves the Block object
 * @param id
 */
export function fromBlockID(id: string | undefined ) {
    if (!id || id === "none") return undefined;

    const [dimensionId, coords] = id.split("@");
    const [x, y, z] = coords.split("_").map(Number);

    return world.getDimension(dimensionId).getBlock({x,y,z})
}