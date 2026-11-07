import {
    Block, ItemStack,
    world
} from "@minecraft/server";

import {
    ADDON_NAMESPACE,
    JUKEBOX_COMPONENT_NAME, JukeboxEntry,
} from "./default_const";
import {jukeboxRegistry} from "./registries";
import {getBlockID} from "./utility/block_id";
import {removeDisc} from "./disc_handler";


/**
 * New wrapper for the jukeboxRegistry concept, intended for automatic handling of hoppers and such on disc replacement
 */
class JukeboxRegistry {
    private registry: Map<string, JukeboxEntry>;

    constructor (){
        this.registry = new Map<string, JukeboxEntry>()
    }

    has( jukebox: Block ) {
        return this.registry.has( getBlockID(jukebox) );
    }

    add( jukebox: Block, disc_item: ItemStack ) {
        this.registry.set( getBlockID(jukebox), {
            disc_id: disc_item.typeId,
            song_id: disc_item.getDynamicProperty("song_id") as number,
        } );
    }

    delete( jukebox: Block ) {
        jukeboxRegistry.delete( getBlockID(jukebox) );
        // TODO handle hopper
    }
}

/**
 * Tests if passed Block object is a jukebox. True if either:
 * 1. Contains the "minecraft:record_player" component
 * 2. Containts the CDisc jukebox block tag
 * @param block
 */
export function isBlockJukebox( block: Block | undefined ) {
    if ( !block ) return false;

    const cjukebox_component = block.hasTag(`${ADDON_NAMESPACE}:${JUKEBOX_COMPONENT_NAME}`)
    const vanilla_component = block.hasComponent("minecraft:record_player")
    const juke_cond = cjukebox_component ?? false;
    const vanilla_cond = vanilla_component ?? false;

    return juke_cond || vanilla_cond;
}

/**
 * Tests if there is a vanilla music disc in the jukebox
 * @param jukebox
 */
export function vanillaDiscInJukebox( jukebox: Block | undefined ) {
    return jukebox?.getComponent("minecraft:record_player")?.getRecord() !== undefined;
}

/**
 * Tests if there is a vanilla od CDisc music disc in the jukebox
 * @param jukebox
 */
export function isJukeboxFull( jukebox: Block | undefined ) {
    if ( !jukebox ) return false;
    return vanillaDiscInJukebox(jukebox) || jukeboxRegistry.has(getBlockID(jukebox));
}


// Spawn disc on block break
/**
 * Subscribe event handlers for jukebox block breaking
 */
export function subscribeJukeboxBreakHandler() {
    // NOTE vanilla jukebox is immovable, so handling pistons is not strictly necessary for now
    // NOTE more robust on break handling is possible if custom jukeboxes are component driven, not tag

    // Handle player breaking the jukebox
    world.afterEvents.playerBreakBlock.subscribe((event) => {

        // Get jukebox block
        const jukebox = event.block
        if (!isBlockJukebox(jukebox)) return;

        // Create disc ItemStack
        const disc_item = removeDisc( jukebox )
        if (!disc_item) return

        // Spawn item
        jukebox.dimension.spawnItem( disc_item, jukebox.location );

    });

    // Handle jukeboxes breaking the jukebox
    world.afterEvents.blockExplode.subscribe((event) => {

        // Get jukebox block
        const jukebox = event.block
        if (!isBlockJukebox(jukebox)) return;

        // Create disc ItemStack
        const disc_item = removeDisc( jukebox )
        if (!disc_item) return

        // Spawn item
        jukebox.dimension.spawnItem( disc_item, jukebox.location );

    })
}