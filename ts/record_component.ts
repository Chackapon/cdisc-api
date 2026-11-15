import {
    ADDON_NAMESPACE,
    MAX_JUKEBOX_INTERACT_DISTANCE,


    RECORD_COMPONENT_NAME, DEFAULT_CREATIVE_CONSUME, DEFAULT_JUKEBOX_INTERACTION_COOLDOWN, RECORD_SIDE_DATA_NAME,
} from "./default_const";

import {
    jukeboxRegistry,
} from "./registries";

// Dynamic world data handler library
import {
    loadWorldData
} from './world_data_save.js';

import {
    GameMode, ItemStack,
    system, world
} from "@minecraft/server";

import {
    playDisc,
    ejectDisc,
    setDiscLore,
    isMusicDisc,
    getDiscSideID
} from "./disc_handler";

import {
    isBlockJukebox, vanillaDiscInJukebox
} from "./jukebox_handler"

import {
    getBlockID
} from "./utility/block"
import {hopperInjector} from "./hopper";


const playerInteractionCooldown = new Set<string>;


// TODO document
// TODO if returns undefined then it was a single disc
function nextSong(disc_item: ItemStack) {

    if (!disc_item) return;

    const properties: any = disc_item.getComponent("cdisc:record")?.customComponentParameters.params;
    if (!properties) return;

    // Continue only if multi disc
    const songs_list: string[] = properties["songs"];
    if (!songs_list || !Array.isArray(songs_list) || songs_list.length <= 1) {
        return;
    }

    // Get current side of the disc item
    let song_id = getDiscSideID(disc_item);

    // Set the new side
    song_id = (song_id + 1) % songs_list.length;
    disc_item.setDynamicProperty(`${RECORD_SIDE_DATA_NAME}`, song_id);
    setDiscLore(disc_item);
    return disc_item;
}

export function registerRecordComponent() {

    // TODO refactor and document
    system.beforeEvents.startup.subscribe( ({itemComponentRegistry}) => {
        itemComponentRegistry.registerCustomComponent(`${ADDON_NAMESPACE}:${RECORD_COMPONENT_NAME}`, {

            // Change disc side
            onUse(event) {

                // Ignore if trying to interact with a jukebox
                const looking_block = event.source.getBlockFromViewDirection(
                    {
                        maxDistance: MAX_JUKEBOX_INTERACT_DISTANCE
                    }
                )?.block;
                if (isBlockJukebox(looking_block)) return;

                // Get disc item
                const disc_item = event.itemStack;
                if (!disc_item) return;

                // Get player's inventory
                const inventory = event.source.getComponent("minecraft:inventory")?.container;

                if (inventory) {

                    // Try to change to next side
                    const new_disc = nextSong(disc_item) ?? disc_item;
                    inventory.setItem(event.source.selectedSlotIndex, new_disc);

                    // Visual side flipping
                    event.source.playSound("game.player.attack.strong");
                    // event.source.playAnimation();
                    event.source.onScreenDisplay.setActionBar("Flipped the disc side")
                    // event.source.onScreenDisplay.setActionBar({
                    //     rawtext: [
                    //         { translate: "cdisc.disc_flipped"}
                    //     ]
                    // });
                }

            },

        });
    });


    // TODO refactor and document
    world.beforeEvents.playerInteractWithBlock.subscribe((event) => {

        // Cancel interaction fully if player is sneaking
        if ( event.player.isSneaking ) return;

        const jukebox = event.block;
        if ( !isBlockJukebox(jukebox) ) return;

        // Cancel the interaction if jukebox contains a vanilla music disc
        if ( vanillaDiscInJukebox(jukebox) ) return;


        // Handle per player interaction cooldown
        const player = event.player;
        if (playerInteractionCooldown.has(player.id)) {
            return;
        }else{
            playerInteractionCooldown.add(player.id);
            system.runTimeout(()=>{
                playerInteractionCooldown.delete(player.id);
            }, DEFAULT_JUKEBOX_INTERACTION_COOLDOWN);
        }


        // console.log(`Is jukebox clicked: ${jukebox.typeId}, ${isBlockJukebox(jukebox)}`)

        const jukeboxID = getBlockID(jukebox);


        // Jukebox doesn't have a CDisc yet
        if ( !jukeboxRegistry.has(getBlockID(jukebox)) ) {

            // TODO isnt that the same check and why cant i remove one of them
            const disc_item = event.itemStack;
            if (!isMusicDisc(disc_item)) return;
            if ( !disc_item?.hasComponent(`${ADDON_NAMESPACE}:${RECORD_COMPONENT_NAME}`)) return;


            // Remove item from player
            const CREATIVE_CONSUME = loadWorldData( `${ADDON_NAMESPACE}:consume_creative` ) ?? DEFAULT_CREATIVE_CONSUME; // TODO move to special place for afterload
            if ( player.getGameMode() !== GameMode.Creative || CREATIVE_CONSUME ) {
                const inventory = player.getComponent("minecraft:inventory");
                system.run(()=>{
                    inventory?.container?.setItem(player.selectedSlotIndex, undefined);
                })
            }

            // Play the disc
            system.run(()=> {
                playDisc( jukebox, disc_item);
            });


        }
        else {
            event.cancel = true
            system.run(()=>{
                ejectDisc(jukebox);
                hopperInjector(jukebox);
            })
        }

    })
}
