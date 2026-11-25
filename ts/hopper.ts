import {Block, system, world} from "@minecraft/server";
import {hopperJukeboxRegistry, jukeboxRegistry} from "./registries";
import {fromBlockID, getBlockID} from "./utility/block";
import {isBlockJukebox} from "./jukebox_handler";
import {isCDisc, playDisc, removeDisc, setDiscLore, stopSongHandler} from "./disc_handler";
import {
    ADDON_NAMESPACE,
    DEFAULT_HOPPER_POLLING_TIME,
    HOPPER_TAG,
    JUKEBOX_DATA_NAME,
} from "./default_const";
import {saveWorldData} from "./world_data_save";

/**
 * Retreive Block instances of hoppers neighboring the block that are facing its direction
 * @param block
 */
function getNeighborHoppers( block: Block ): Set<Block> {
    const result = new Set<Block | undefined>()

    if (isBlockHopper(block.east()) && block.east()?.permutation.getState("facing_direction") === 4) result.add(block.east())
    if (isBlockHopper(block.west()) && block.west()?.permutation.getState("facing_direction") === 5) result.add(block.west())
    if (isBlockHopper(block.south()) && block.south()?.permutation.getState("facing_direction") === 2) result.add(block.south())
    if (isBlockHopper(block.north()) && block.north()?.permutation.getState("facing_direction") === 3) result.add(block.north())
    if (isBlockHopper(block.above()) && block.above()?.permutation.getState("facing_direction") === 0) result.add(block.above())

    return new Set<Block>([...result].filter( block => block !== undefined) )
}

/**
 * Injects a CDisc music item from one of the nearby hoppers
 * @param jukebox
 */
export function hopperInjector( jukebox: Block | undefined ) {

    // Skip if checked block is not a jukebox
    if (!jukebox || !isBlockJukebox(jukebox)) return;

    // Run the injector for every hopper neighboring the jukebox
    for ( let hopper of getNeighborHoppers(jukebox) ) {

        // check if hopper is in cooldown, possibly get it into cooldown after operation and cancel other item's transport
        // lock hoppers around jukebox when disc starts playing. unlock them on disc eject, end or block break
        const container = hopper.getComponent("minecraft:inventory")?.container
        if (!container) continue;

        // Retrieve the first available CDisc music disc from the hopper
        const first_occupied_slot = container.firstItem()
        if (first_occupied_slot === undefined) continue;
        const first_item = container.getItem(first_occupied_slot)
        if (!first_item) continue;
        if (!isCDisc(first_item)) continue;

        // Remove the disc from the hopper
        container.setItem(first_occupied_slot, undefined)

        // Play song
        playDisc( jukebox, first_item )

        // Exit the loop, no need to check the rest of the hoppers
        break;
    }
}

/**
 * Check if block is a hopper:
 * a) It's a vanilla hopper
 * b) WIP tag for custom hoppers
 * @param hopper_block
 */
function isBlockHopper(hopper_block: Block | undefined) {
    return hopper_block?.typeId === "minecraft:hopper" || hopper_block?.hasTag(`${ADDON_NAMESPACE}:${HOPPER_TAG}`);
}

//8 tick polling speed by default
/**
 * Handles the ejection of a music disc in a hopper under the jukebox
 * @param jukebox
 */
// TODO finish documentation
function hopperEjector( jukebox: Block | undefined ) {

    // Skip if checked block is not a jukebox
    if (!jukebox || !isBlockJukebox(jukebox)) return;
    const jukeboxID = getBlockID(jukebox);

    // Cancel if jukebox has no CDisc item
    if ( !jukeboxRegistry.has(jukeboxID) ) {
        hopperJukeboxRegistry.delete(jukeboxID)
        return;
    }

    // Get the hopper block instance
    const hopper_block = jukebox.below()
    if(!hopper_block) return;
    if (!isBlockHopper(hopper_block)) return;

    // Check if hopper is blocked by redstone
    if (hopper_block.permutation.getState("toggle_bit")) return;

    // Get the hopper inventory
    const hopper_inv = hopper_block.getComponent("minecraft:inventory")?.container
    if (!hopper_inv) return;

    // If hopper has empty slots, eject the music disc there
    if(hopper_inv.emptySlotsCount > 0) {

        // Remove the disc from the jukebox
        const disc_item = removeDisc(jukebox);
        if (!disc_item) return;

        // TODO consider moving this inside removeDisc
        setDiscLore(disc_item)

        // Properly handle song stopping
        // TODO might not be necessary
        stopSongHandler(jukebox);

        // Insert the disc into the hopper
        const empty_slot = hopper_inv.firstEmptySlot();
        hopper_inv.setItem( empty_slot!, disc_item );

        // TODO might be necessary only in injector
        // hopperJukeboxRegistry.delete(jukeboxID);

        // Save updated jukebox contents registry
        saveWorldData( `${ADDON_NAMESPACE}:${JUKEBOX_DATA_NAME}`, jukeboxRegistry );

        // Try to inject a CDisc from nearby hopper
        hopperInjector(fromBlockID(jukeboxID));

        // Remove jukebox from hopper polling
        hopperJukeboxRegistry.delete(getBlockID(jukebox));
    }
}


// TODO document
export function registerHopperPolling() {

    // Initial world load push the discs into jukeboxes
    world.afterEvents.worldLoad.subscribe(() => {
        for ( let jukeboxID of jukeboxRegistry.keys() ) {
            hopperJukeboxRegistry.add(jukeboxID);
        }
    });

    // Regular hopper polling
    system.runInterval(() => {
        hopperJukeboxRegistry.forEach((jukeboxID) => {
            hopperEjector(fromBlockID(jukeboxID));
        })
    }, DEFAULT_HOPPER_POLLING_TIME*10);
}


