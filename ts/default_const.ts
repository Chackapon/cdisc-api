// DEV SETTINGS - DON'T CHANGE, UNLESS YOU KNOW WHAT YOU'RE DOING

export const MOD_NAMESPACE = "cdisc";
export const RECORD_COMPONENT_NAME = "record"
export const JUKEBOX_DATA_NAME = "jukebox_data";
export const INHABITANT_STATE_NAME = "inhabitant"
export const EMPTY_STATE_NAME = "is_empty"

export const JUKEBOX_BLOCK_TYPES = new Set([
    "minecraft:jukebox"
]);
export const MAX_JUKEBOX_INTERACT_DISTANCE = 10;

export type RecordSong = {
    sound: string;
    title: string;
    author: string;
    duration: number;
};

export type RecordComponent = {
    audio: RecordSong[]; // TODO make accept single song
}

// USER SETTINGS
export const DEFAULT_HOLLOW_CHANCE = 0.05; // Chance for a tree to generate with a nest
export const DEFAULT_INHABITANT_CHANCE = 1; // Chance for a nest to contain mob
