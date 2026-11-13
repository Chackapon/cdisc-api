import {Block, system, world} from "@minecraft/server";
import {hopperJukeboxRegistry, jukeboxRegistry} from "./registries";
import {fromBlockID, getBlockID} from "./utility/block";
import {isBlockJukebox, isJukeboxFull} from "./jukebox_handler";
import {isMusicDisc, removeDisc, setDiscLore, stopSongHandler} from "./disc_handler";
import {ADDON_NAMESPACE, DEFAULT_HOPPER_POLLING_TIME, HOPPER_TAG, JUKEBOX_DATA_NAME} from "./default_const";
import {saveWorldData} from "./world_data_save";

function getNeighborHoppers( block: Block ): Set<Block> {
    const result = new Set<Block | undefined>()

    if (block.east() && block.east()?.permutation.getState("facing_direction") == 4) result.add(block.east())
    if (block.west()?.permutation.getState("facing_direction") == 5) result.add(block.east())
    if (block.south()?.permutation.getState("facing_direction") == 2) result.add(block.east())
    if (block.north()?.permutation.getState("facing_direction") == 3) result.add(block.east())
    if (block.above()?.permutation.getState("facing_direction") == 0) result.add(block.east())

    return new Set<Block>([...result].filter( block => block !== undefined) )
}

function hopperInjector( jukebox: Block | undefined ) {
    if (!jukebox || !isBlockJukebox(jukebox)) return;
    if (isJukeboxFull(jukebox)) return;

    getNeighborHoppers( jukebox ).forEach( hopper => {
        // check if hopper is in cooldown, possibly get it into cooldown after operation and cancel other item's transport
        // lock hoppers around jukebox when disc starts playing. unlock them on disc eject, end or block break
        const container = hopper.getComponent("minecraft:inventory")?.container
        if (!container) return; //break

        const first_occupied_slot = container.firstItem()
        if (!first_occupied_slot) return;

        const first_item = container.getItem(first_occupied_slot)
        if (!first_item) return;

        if (!isMusicDisc(first_item)) return;

        console.log(`Polled hopper ${getBlockID(hopper)}`)
        console.log(`Ready to transport item ${first_item.typeId} at slot ${first_occupied_slot}`)
    })
}

//8 tick polling speed by default
/**
 * Handles the ejection of a music disc in a hopper under the jukebox
 * @param jukebox
 */
// TODO finish documentation
function hopperEjector( jukebox: Block | undefined ) {
    if (!jukebox || !isBlockJukebox(jukebox)) return;
    const jukeboxID = getBlockID(jukebox);

    // Get the hopper block instance
    const hopper_block = jukebox.below()
    if (hopper_block?.typeId !== "minecraft:hopper" || hopper_block.hasTag(`${ADDON_NAMESPACE}:${HOPPER_TAG}`)) return;

    // Check if hopper is blocked by redstone
    if (hopper_block.permutation.getState("powered_bit")) return;

    // Get the hopper inventory
    const hopper_inv = hopper_block.getComponent("minecraft:inventory")?.container
    if (!hopper_inv) return;



    // If hopper has empty slots, eject the music disc there
    if(hopper_inv.emptySlotsCount > 0) {

        const disc_item = removeDisc(jukebox);
        // TODO consider moving this inside removeDisc
        if (disc_item) setDiscLore(disc_item)

        stopSongHandler(jukebox);
        if (!disc_item) return;
        hopper_inv.addItem(disc_item);
        hopperJukeboxRegistry.delete(jukeboxID);

        // TODO launch hopperInjector

        // Save updated jukebox contents registry
        saveWorldData( `${ADDON_NAMESPACE}:${JUKEBOX_DATA_NAME}`, jukeboxRegistry );
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
            hopperInjector(fromBlockID(jukeboxID));
        })
    }, DEFAULT_HOPPER_POLLING_TIME*10);
}


