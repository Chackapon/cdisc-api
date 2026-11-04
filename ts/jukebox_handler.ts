import {
    Block,
    world
} from "@minecraft/server";

import {
    ADDON_NAMESPACE,
    JUKEBOX_COMPONENT_NAME,
} from "./default_const";



export function getJukeboxID( jukebox: Block ) {
    if (!jukebox) return "none";
    return `${String(jukebox.dimension.id)}@${jukebox.location.x}_${jukebox.location.y}_${jukebox.location.z}`;
}

export function isBlockJukebox( block: Block | undefined ) {
    if ( !block ) return false;

    const cjukebox_component = block.getComponent(`${ADDON_NAMESPACE}:${JUKEBOX_COMPONENT_NAME}`)
    const juke_cond = cjukebox_component ?? false;
    console.log(juke_cond)
    console.log(block.typeId)
    return juke_cond || block.typeId === "minecraft:jukebox";
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