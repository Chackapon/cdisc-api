import {Block, ItemStack, Player, SoundInstance, system, world} from "@minecraft/server";
import {

    ADDON_NAMESPACE,

    RecordSong,
    RECORD_COMPONENT_NAME
} from "./default_const";
import {getBlockID} from "./utility/block_id";
import {jukeboxRegistry, soundInstanceRegistry} from "./registries";

/**
 * Checks if ItemStack is a CDisc disc item. Undefined items are treated as non discs
 * @param item
 */
export function isMusicDisc( item: ItemStack | undefined ) {
    return item?.getComponent(`${ADDON_NAMESPACE}:${RECORD_COMPONENT_NAME}`) ?? false;
}


// TODO document
export function getDiscSideID(disc_item: ItemStack) {
    // TODO refactor all usages to this function
    let song_id: number = disc_item.getDynamicProperty("song_id") as number;
    if (typeof song_id !== "number") song_id = 0;
    return song_id;
}


/**
 * Stops the game music
 */
function playersStopMusic() {
    for (const player of world.getAllPlayers()) {
        player.stopMusic(); //TODO stop only for players that are near the jukebox
    }
}


/**
 * Displays an action bar text with the song being player
 * @param player
 * @param song
 */
function recordActionBar( player: Player, song: RecordSong ) {
    /*player.sendMessage(`§eArtist: ${temp[0]}`);
    player.sendMessage(`§eSong: ${temp[1]}`);
    player.sendMessage( {
        rawtext: [
            {
                translate: `artist.${temp[0]}`
            },
            { text: " / " },
            {
                translate: `song.${temp[1]}`
            }
        ]
    } )*/

    if (song) {
        player.onScreenDisplay.setActionBar({
            rawtext: [
                {
                    translate: `record.nowPlaying`,
                    with: [` ${song.author ?? "Unknown"} - ${song.title ?? "Untitled"}`]
                }
            ]
        });
    }
    else {
        player.onScreenDisplay.setActionBar({
            rawtext: [
                {
                    // TODO add this text to localization
                    translate: `cdisc.songNotFound`,
                }
            ]
        })
    }


    /*
    player.onScreenDisplay.setActionBar({ //todo: check how vanilla displays nowPlaying in multiplayer
        rawtext: [
            {
            translate: "discapi.nowPlaying",
            with: { rawtext: [
                    { translate: `artist.${temp[0]}` },
                    { translate: `song.${temp[1]}` }
                ]}
            }
        ]
    });
    */
    /*
    player.onScreenDisplay.setActionBar({
        rawtext: [
            {
            translate: "record.nowPlaying",
            with: {
                    rawtext: [
                        { translate: `artist.${temp[0]}` },
                        { text: " - " },
                        { translate: `song.${temp[1]}` }
                    ]
                }
            }
        ]
    });
    */
}



// Add lore on inventory change
// TODO document
export function subscribeEventInventoryChangeLore() {
    world.afterEvents.playerInventoryItemChange.subscribe((event)=> {
        const disc_item = event.itemStack;
        if (!disc_item || !isMusicDisc(disc_item)) return;

        const inventory = event.player.getComponent("minecraft:inventory")?.container;
        if (!inventory) return;

        setDiscLore(disc_item);
        inventory.setItem(event.slot, disc_item);
    })
}


// Add lore to dropped item
// TODO document
export function subscribeEventItemEntityLore() {
    world.afterEvents.entitySpawn.subscribe(({ entity }) => {

        if (entity.typeId !== "minecraft:item") return;

        const itemComponent = entity.getComponent("minecraft:item");
        if (!itemComponent) return;

        const oldItem = itemComponent.itemStack;
        if (!isMusicDisc(oldItem)) return;

        // Already has lore
        if (oldItem.getLore().length > 0) return;

        const newItem = oldItem.clone();

        setDiscLore( newItem );

        const dimension = entity.dimension;
        const location = entity.location;

        entity.remove();
        dimension.spawnItem(newItem, location);
    });
}


// TODO refactor
export function setDiscLore( disc_item: ItemStack ) {
    //const disc_lang_key = "record." + disc_item.typeId.split(":")[1] // refactor to item type
    const song = getSong( disc_item );
    const title = song.title ?? "Untitled";
    const author = song.author ?? "Unknown";

    disc_item.setLore([{ rawtext: [
            { text: "§r§7" },
            { text: `${author} - ${title}` }
            // { translate: disc_lang_key }
        ]}]);
} //todo: fix this


// TODO refactor
export function playDisc( player: Player, jukebox: Block, song: RecordSong ): SoundInstance | undefined {

    // TODO remove this
    // playersStopMusic();

    // let disc_lang_key = "record." + disc_item.typeId.split(":")[1]
    if (!player) return undefined;

    // TODO check if action bar is shown to only one player or all in a radius
    recordActionBar( player, song );
    const sound_event = jukebox.dimension.playSound(
        song.sound,
        jukebox.location
    );

    jukebox.dimension.spawnParticle("minecraft:cdisc:note", { // TODO add a custom particle that actually changes color
        x: jukebox.location.x + 0.5,
        y: jukebox.location.y + 1.2,
        z: jukebox.location.z + 0.5
    });

    // Add a callback handling song end
    console.log("Registering the song end handler")
    system.runTimeout(()=>{
        console.log(`Sound event with id ${sound_event.id} has ended after ${song.duration}s`);

        // TODO refactor into a separate under hopper method
        // Get the hopper block underneath the jukebox
        const under_juke_location = {
            x: jukebox.location.x,
            y: jukebox.location.y - 1,
            z: jukebox.location.z
        }
        const hopper_block = jukebox.dimension.getBlock(under_juke_location);
        if ( hopper_block?.typeId === "minecraft:hopper" ) {
            console.log("Hopper found under a jukebox where a song ended")
            const hopper_inv = hopper_block.getComponent("minecraft:inventory")
            if ( hopper_inv?.container ) {
                const container = hopper_inv.container;
                console.log(`Hopper size: ${container.size}`);
                console.log(`Empty slots: ${container.emptySlotsCount}`);

                // TODO handle full hoppers
                if(container.emptySlotsCount > 0) {
                    const disc_item = removeDisc(jukebox);
                    if (!disc_item) return;
                    container.addItem(disc_item);
                }
            }
        }

    }, 20 * song.duration );

    return sound_event

}

/**
 * Removes the disc from the jukebox and stops the sound. Jukebox is also removed from the registry
 * @param jukebox - Block object
 * @returns undefined if no addon disc was present, otherwise ItemStack object of that disc
 */
export function removeDisc( jukebox: Block ) {
    const jukeboxID = getBlockID(jukebox);
    const jukeboxEntry = jukeboxRegistry.get(jukeboxID);

    if (!jukeboxEntry) return;

    // Stop sound only if record is still playing
    const song_instance = soundInstanceRegistry.get(jukeboxID);
    if (!song_instance) return; //TODO consider changing to an error - this might cause a broken sound to not return the disc item
    console.log(`This jukebox hosted song_instance id=${song_instance?.id}`)
    song_instance.stop()
    soundInstanceRegistry.delete(jukeboxID);

    // Remove playing jukebox from the registry
    jukeboxRegistry.delete(jukeboxID);

    // Return the disc in item form
    const disc_item = new ItemStack( jukeboxEntry.disc_id, 1 );
    disc_item.setDynamicProperty("song_id", jukeboxEntry.song_id ?? 0); // TODO conflicts with the no dyn property handling of single sided discs
    return disc_item;
}

/**
 * Wrapper around removeDisc function; spawns the removed disc on top of the jukebox
 * @param jukebox
 */
export function ejectDisc( jukebox: Block ) {
    const disc_item = removeDisc(jukebox);
    if (!disc_item) return;

    const spawn_location = {
        x: jukebox.location.x + 0.5,
        y: jukebox.location.y + 1,
        z: jukebox.location.z + 0.5
    };
    jukebox.dimension.spawnItem( disc_item, spawn_location );
}

/**
 * Retrieves the song properties from a disc ItemStack
 * @param disc_item - a specific disc ItemStack
 * @returns RecordSong - a song entry from the item definition
 */
export function getSong( disc_item: ItemStack ): RecordSong {

    // Get item component
    const properties: any = disc_item.getComponent(
        `${ADDON_NAMESPACE}:${RECORD_COMPONENT_NAME}`
    )?.customComponentParameters.params;


    // If it's a multi disc
    const songs_list = properties["songs"];
    if (songs_list && Array.isArray(songs_list)) {

        if (songs_list.length > 1) {
            // Get current side of the disc item
            let song_id = disc_item.getDynamicProperty("song_id");
            if (typeof song_id !== "number") {
                song_id = 0;
                disc_item.setDynamicProperty("song_id", song_id);
            }

            const song_key = properties["songs"][song_id];
            return properties[song_key];
        }
        else return properties["songs"][0];
    }

    // If it's a single disc
    else {
        return properties;
    }
}