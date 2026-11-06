import {JukeboxEntry} from "./default_const";
import {SoundInstance} from "@minecraft/server";

/**
 * Stores jukeboxes actively used by CDisc along with their disc item it, used disc side and sound name
 * This is the registry that is saved and handles item storage
 */
export const jukeboxRegistry = new Map<string, JukeboxEntry>();

/**
 * Stores actively playing jukeboxes with their playing duration
 */
// export const currentPlayingRegistry = new Map<string, number>();

/**
 * Stores actively playing sound instances mapped to jukebox id
 * This registry is not to be saved and handles the sound playback
 */
export const soundInstanceRegistry = new Map<string, SoundInstance>();

/**
 * Used specifically to handle multiple discs of the same sound playing
 * NOTE: this behavior was corrected in 26.60, so i should fix that
 */
export const discOwners = new Map<string, string>();