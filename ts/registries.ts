/**
 * Stores jukeboxes actively used by CDisc along with their disc item it, used disc side and sound name
 */
export const jukeboxRegistry = new Map();

/**
 * Stores actively playing jukeboxes with their playing duration
 */
export const currentPlayingRegistry = new Map<string, number>();

/**
 * Used specifically to handle multiple discs of the same sound playing
 * NOTE: this behavior was corrected in 26.60, so i should fix that
 */
export const discOwners = new Map<string, string>();