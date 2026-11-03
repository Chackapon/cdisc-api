import {
    JUKEBOX_DATA_NAME,
    ADDON_NAMESPACE,
    MAX_JUKEBOX_INTERACT_DISTANCE,

    RecordComponent, RECORD_COMPONENT_NAME, DEFAULT_CREATIVE_CONSUME
} from "./default_const";

import {
    jukeboxRegistry,
    currentPlayingRegistry,
    discOwners
} from "./registries";

// Dynamic world data handler library
import {
    loadWorldData,
    saveWorldData
} from './world_data_save.js';

import {
    GameMode,
    system, world
} from "@minecraft/server";

import {
    playDisc,
    ejectDisc,
    playersStopSound,
    getSong, setDiscLore
} from "./disc_handler";

import {
    getJukeboxID,
    isBlockJukebox
} from "./jukebox_handler"




export function registerRecordComponent() {
    system.beforeEvents.startup.subscribe( ({itemComponentRegistry}) => {
        itemComponentRegistry.registerCustomComponent(`${ADDON_NAMESPACE}:${RECORD_COMPONENT_NAME}`, {

            // Change disc side
            onUse(event, params) {
                // Ignore if trying to interact with a jukebox
                const looking_block = event.source.getBlockFromViewDirection(
                    {
                        maxDistance: MAX_JUKEBOX_INTERACT_DISTANCE
                    }
                );
                if ( isBlockJukebox( looking_block?.block ) ) {
                }
                else {
                    // Get disc songs list
                    const disc_item = event.itemStack;
                    if (!disc_item) return;

                    // Get item properties

                    // const properties = item.getComponent(
                    //     `${MOD_NAMESPACE}:record`
                    // )?.customComponentParameters.params as RecordComponent;
                    const properties: any = params.params;
                    if (!properties) return;

                    const songs_list: string[] = properties["songs"];
                    if ( !songs_list || !Array.isArray(songs_list) || songs_list.length <= 1) {
                        return;
                    }
                    const songs_amount = songs_list.length;

                    // Get current side of the disc item
                    let song_id = disc_item.getDynamicProperty("song_id");
                    if (typeof song_id !== "number") song_id = 0;

                    // Set the new side
                    song_id = (song_id + 1) % songs_amount;
                    disc_item.setDynamicProperty("song_id", song_id);
                    setDiscLore(disc_item);

                    const inventory = event.source.getComponent("minecraft:inventory")?.container;

                    if (inventory) {
                        inventory.setItem(event.source.selectedSlotIndex, disc_item);
                    }

                }


            },
        });
    });

    world.afterEvents.playerInteractWithBlock.subscribe((event) => {
        const { player } = event;
        const disc_item = event.itemStack;
        const jukebox = event.block;

        if ( !isBlockJukebox(jukebox) ) return;


        const jukeboxID = getJukeboxID(jukebox);



        if ( !jukeboxRegistry.has(jukeboxID) ) {

            if ( !disc_item?.hasComponent(`${ADDON_NAMESPACE}:${RECORD_COMPONENT_NAME}`)) return;
            const song = getSong(disc_item);
            // Remove item from player
            const CREATIVE_CONSUME = loadWorldData( `${ADDON_NAMESPACE}:consume_creative` ) ?? DEFAULT_CREATIVE_CONSUME; // TODO move to special place for afterload
            if ( player.getGameMode() !== GameMode.Creative && CREATIVE_CONSUME ) {
                const inventory = player.getComponent("minecraft:inventory");
                inventory?.container?.setItem(player.selectedSlotIndex, undefined);
            }


            // Insert disc into jukebox and play
            jukeboxRegistry.set(jukeboxID, {
                "id": disc_item.typeId,
                "song_id": disc_item.getDynamicProperty("song_id"),
                "sound": song.sound
            }); // TODO consider saving disc side as well

            // Add to current playing
            const oldJukeboxID = discOwners.get(disc_item.typeId);
            if (oldJukeboxID !== undefined) {
                currentPlayingRegistry.delete( oldJukeboxID );
            }
            discOwners.set( disc_item.typeId, jukeboxID );






            const duration = song.duration;

            currentPlayingRegistry.set(jukeboxID, duration);

            playDisc( player, jukebox, song);


        }
        else { // todo: this must work regardless of item used

            // If jukebox has a disc inside of it, eject it
            const jukeboxData = jukeboxRegistry.get(jukeboxID);

            if ( jukeboxData ) {
                jukeboxRegistry.delete(jukeboxID);


                // Stop sound only if record is still playing
                if ( currentPlayingRegistry.get(jukeboxID) ) {
                    playersStopSound( jukeboxData["sound"] );
                    currentPlayingRegistry.delete(jukeboxID);
                }

                // Eject disc item
                ejectDisc( jukebox, jukeboxData["id"], jukeboxData["song_id"] );
            }

            // tODO remove f
        }

        // Save updated jukebox contents registry
        // saveJukeboxData();
        saveWorldData( `${ADDON_NAMESPACE}:${JUKEBOX_DATA_NAME}`, jukeboxRegistry );
        // player.sendMessage(`registry size: ${jukeboxRegistry.size}`);
    });
}