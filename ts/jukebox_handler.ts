import {
    Block, ItemStack, system,
    world
} from "@minecraft/server";

import {
    ADDON_NAMESPACE,
    JUKEBOX_COMPONENT_NAME,
} from "./default_const";
import {jukeboxRegistry, soundInstanceRegistry} from "./registries";
import {getBlockID} from "./utility/block_id";

/**
 * Tests if passed Block object is a jukebox. True if either:
 * 1. Block id is "minecraft:jukebox"
 * 2. Containts the CDisc jukebox block tag
 * @param block
 */
export function isBlockJukebox( block: Block | undefined ) {
    if ( !block ) return false;

    const cjukebox_component = block.hasTag(`${ADDON_NAMESPACE}:${JUKEBOX_COMPONENT_NAME}`)
    const juke_cond = cjukebox_component ?? false;
    // console.log(juke_cond)
    // console.log(block.typeId)
    return juke_cond || block.typeId === "minecraft:jukebox";
}


// Spawn disc on block break
// TODO document
// TODO handle non player breaking
export function subscribeJukeboxBreakHandler() {
    world.beforeEvents.playerBreakBlock.subscribe((event) => {
        const jukebox = event.block
        if (!isBlockJukebox(jukebox)) return;
        const jukeboxID = getBlockID(jukebox);
        const jukebox_entry = jukeboxRegistry.get(jukeboxID);
        if (!jukebox_entry) return;

        const disc_item = new ItemStack( jukebox_entry.disc_id, 1 );

        disc_item.setDynamicProperty("song_id", jukebox_entry["song_id"] ?? 0);


        system.run(() => {
            jukebox.dimension.spawnItem( disc_item, jukebox.location );
            soundInstanceRegistry.get(jukeboxID)?.stop()
        });

        jukeboxRegistry.delete(jukeboxID);
        soundInstanceRegistry.delete(jukeboxID);

    });
}