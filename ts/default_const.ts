// DEV SETTINGS - DON'T CHANGE, UNLESS YOU KNOW WHAT YOU'RE DOING

import {ItemStack, SoundInstance} from "@minecraft/server";
import {setDiscLore} from "./disc_handler";

export const ADDON_NAMESPACE = "cdisc";
export const ADDON_NAME = "CDisc API"
export const RECORD_COMPONENT_NAME = "record"
export const JUKEBOX_COMPONENT_NAME = "jukebox"
export const HOPPER_TAG = "hopper"
export const JUKEBOX_DATA_NAME = "jukebox_data";
export const RECORD_SIDE_DATA_NAME = "song_id"

export const MAX_JUKEBOX_INTERACT_DISTANCE = 10;
export const DEFAULT_CREATIVE_CONSUME = false;
export const DEFAULT_JUKEBOX_INTERACTION_COOLDOWN = 5;
export const DEFAULT_HOPPER_POLLING_TIME = 8;

export type RecordSong = {
    sound: string;
    title: string;
    author: string;
    duration: number;
    bpm?: number;
};

export type JukeboxEntry = {
    disc_id: string
    song_id: number
    // "sound": string
};

export type SoundEntry = {
    sound: SoundInstance;
    particleEmitter: number
    songEnder: number
}


class DiscStack {
    item: ItemStack;

    constructor(item_type: string | ItemStack) {
        if (item_type instanceof ItemStack) {
            this.item = item_type;
        }
        else {
            this.item = new ItemStack(item_type, 1);
        }

        if ( this.item.getLore().length === 0 ) setDiscLore( this.item )
    }
}
