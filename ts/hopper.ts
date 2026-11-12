import {Block, system, world} from "@minecraft/server";
import {hopperJukeboxRegistry, jukeboxRegistry} from "./registries";
import {fromBlockID, getBlockID} from "./utility/block";
import {isBlockJukebox} from "./jukebox_handler";
import {removeDisc, stopSongHandler} from "./disc_handler";
import {ADDON_NAMESPACE, DEFAULT_HOPPER_POLLING_TIME, HOPPER_TAG, JUKEBOX_DATA_NAME} from "./default_const";
import {saveWorldData} from "./world_data_save";

//8 tick polling speed by default
/**
 * Handles the ejection of a music disc in a hopper under the jukebox
 * @param jukebox
 */
// TODO finish documentation
function hopperEjecter( jukebox: Block | undefined ) {
    if (!jukebox || !isBlockJukebox(jukebox)) return;
    const jukeboxID = getBlockID(jukebox);

    // Get the hopper block instance
    const under_juke_location = {
        x: jukebox.location.x,
        y: jukebox.location.y - 1,
        z: jukebox.location.z
    }
    const hopper_block = jukebox.dimension.getBlock(under_juke_location);
    if (hopper_block?.typeId !== "minecraft:hopper" || hopper_block.hasTag(`${ADDON_NAMESPACE}:${HOPPER_TAG}`)) return;

    // Get the hopper inventory
    const hopper_inv = hopper_block.getComponent("minecraft:inventory")?.container
    if (!hopper_inv) return;

    // If hopper has empty slots, eject the music disc there
    if(hopper_inv.emptySlotsCount > 0) {

        const disc_item = removeDisc(jukebox);
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
            hopperEjecter(fromBlockID(jukeboxID));
        })
    }, DEFAULT_HOPPER_POLLING_TIME*10);
}


