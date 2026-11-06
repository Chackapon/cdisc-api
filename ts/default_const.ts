// DEV SETTINGS - DON'T CHANGE, UNLESS YOU KNOW WHAT YOU'RE DOING

export const ADDON_NAMESPACE = "cdisc";
export const ADDON_NAME = "CDisc API"
export const RECORD_COMPONENT_NAME = "record"
export const JUKEBOX_COMPONENT_NAME = "jukebox"
export const JUKEBOX_DATA_NAME = "jukebox_data";

export const MAX_JUKEBOX_INTERACT_DISTANCE = 10;
export const DEFAULT_CREATIVE_CONSUME = false;
export const DEFAULT_JUKEBOX_INTERACTION_COOLDOWN = 5;

export type RecordSong = {
    sound: string;
    title: string;
    author: string;
    duration: number;
};

export type JukeboxEntry = {
    disc_id: string
    song_id: number
    // "sound": string
};

export type RecordComponent = {
    audio: RecordSong[]; // TODO make accept single song
}
