import {Block, ItemStack, Player, world} from "@minecraft/server";
import {

    ADDON_NAMESPACE,

    RecordSong,
    RECORD_COMPONENT_NAME
} from "./default_const";

export function isMusicDisc( item: ItemStack | undefined ) {
    return item?.getComponent(`${ADDON_NAMESPACE}:${RECORD_COMPONENT_NAME}`) ?? false;
}

export function playersStopSound( sound_id: string ) {
    for (const player of world.getAllPlayers()) {
        player.runCommand(`stopsound @a ${sound_id}`);
    }
}
function playersStopMusic() {
    for (const player of world.getAllPlayers()) {
        player.stopMusic();
    }
}

function recordActionBar( player: Player, author: string, title: string ) {
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


    player.onScreenDisplay.setActionBar({
        rawtext: [
            {
                translate: `record.nowPlaying`,
                with: [` ${author} - ${title}`]
            }
        ]
    });

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


export function playDisc( player: Player, jukebox: Block, song: RecordSong ) {

    playersStopMusic();

    const sound_id = song.sound;
    const title = song.title ?? "Untitled";
    const author = song.author ?? "Unknown";
    // let disc_lang_key = "record." + disc_item.typeId.split(":")[1]

    if (sound_id) {
        jukebox.dimension.playSound(
            sound_id,
            jukebox.location
        );
        recordActionBar( player, author, title );
    }
    else {
        recordActionBar( player, `No sound found for ${author}`, title );
    }

}

export function ejectDisc( jukebox: Block, disc_item_id: string, song_id: number|undefined ) {
    const disc_item = new ItemStack( disc_item_id, 1 );
    const spawn_location = {
        x: jukebox.location.x + 0.5,
        y: jukebox.location.y + 1,
        z: jukebox.location.z + 0.5
    };

    disc_item.setDynamicProperty("song_id", song_id ?? 0);
    jukebox.dimension.spawnItem( disc_item, spawn_location );
}

/**
 *
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