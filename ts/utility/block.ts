import {Block, world} from "@minecraft/server";

/**
 * Encodes a Block object into a string ID
 * @param jukebox
 */
export function getBlockID(jukebox: Block | undefined ): string {
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

/**
 * Get instances of all players in a set radius from a block
 * @param block
 */
export function getNearbyPlayers( block: Block ) {
    return world.getPlayers({
        location: block.location,
        maxDistance: 64 // TODO extract to a setting
    });
}