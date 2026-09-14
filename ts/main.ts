// TAG DISC

// Important constants
import {
	MOD_NAMESPACE,
	JUKEBOX_DATA_NAME,
	JUKEBOX_BLOCK_TYPES
} from "./default_const";

// Dynamic world data handler library
import {
	loadWorldData
} from './world_data_save.js';

//
import {
	jukeboxRegistry,
	currentPlayingRegistry,
} from "./registries";

import {
	ItemStack,
	world,
	system
} from "@minecraft/server";

import {
	registerRecordComponent
} from "./record_component";
import {isMusicDisc, setDiscLore} from "./disc_handler";
import {fromJukeboxID, getJukeboxID, isBlockJukebox} from "./jukebox_handler";


world.afterEvents.worldLoad.subscribe((event) => {
	loadWorldData( `${MOD_NAMESPACE}:${JUKEBOX_DATA_NAME}`, jukeboxRegistry );
});
registerRecordComponent();

//// bleh




class DiscStack {
	private item: ItemStack;
	constructor(item_type: string) {
		this.item = new ItemStack(item_type);
		const disc_lang_key = "record." + this.item.typeId.split(":")[1] // refactor
		this.item.setLore([{ rawtext: [
			{ "text": "§r§7" },
			{ translate: disc_lang_key }
		]}]);
	}
}










// Add lore to dropped item
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
subscribeEventItemEntityLore();

// Add lore to inventory
// world.afterEvents.playerInventoryItemChange.subscribe((event) => {
//     const item = event.itemStack;
//
//     if (!item) return;
//     if (!isMusicDisc(item)) return;
//     if (item.getLore().length > 0) return;
//
//     setDiscLore(item);
//
// 	const inventory = event.player.getComponent("minecraft:inventory")?.container;
// 	if (inventory) {
// 		inventory.setItem(event.player.selectedSlotIndex, item);
// 	}
//
// });

// Tick all playing songs every second
export function subscribeEventSongDurationTicker() {
	system.runInterval(() => {
		currentPlayingRegistry.forEach( (duration, jukeboxID) => {
			if ( duration-1 <= 0 ) {
				// console.log(jukeboxID, "has stopped playing");
				currentPlayingRegistry.delete(jukeboxID);
			
			}
			else currentPlayingRegistry.set(jukeboxID, duration-1);
		} );
	}, 20);
}
subscribeEventSongDurationTicker();

// Play note particle
export function subscribeEventNoteParticles() {
	system.runInterval(() => {
		currentPlayingRegistry.forEach( (value, jukeboxID) => {
			const jukeboxData = fromJukeboxID( jukeboxID )
			if (jukeboxData) {
				const { location, dimension } = jukeboxData;
				dimension.spawnParticle("minecraft:note_particle", { // TODO add a custom particle that actually changes color
					x: location.x + 0.5,
					y: location.y + 1.2,
					z: location.z + 0.5
				});
			}
		});
	}, 20);
}
subscribeEventNoteParticles();

// Spawn disc on block break
world.beforeEvents.playerBreakBlock.subscribe((event) => {
	const jukebox = event.block
	if (!isBlockJukebox(jukebox)) return;
	const jukeboxID = getJukeboxID(jukebox);
	const jukebox_entry = jukeboxRegistry.get(jukeboxID);
	if (!jukebox_entry) return;

	const disc_item = new ItemStack( jukebox_entry["id"], 1 );

	disc_item.setDynamicProperty("song_id", jukebox_entry["song_id"] ?? 0);


	system.run(() => {
		jukebox.dimension.spawnItem( disc_item, jukebox.location );
	});

	jukeboxRegistry.delete(jukeboxID);
	currentPlayingRegistry.delete(jukeboxID);

});

/// debug
/*
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (!player.isSneaking) continue;
			player.sendMessage(
            `§ejukeboxRegistry: ${JSON.stringify(Object.fromEntries(jukeboxRegistry))}`
        );

			
			if (player.getComponent("minecraft:equippable")
    ?.getEquipment("Offhand")?.typeId !== "minecraft:arrow") return;

        const container = player.getComponent("minecraft:inventory")?.container;
        if (!container) continue;

        const item = container.getItem(player.selectedSlotIndex);
        if (!item) continue;

        const tags = item.getTags();

        player.sendMessage(
            `§e${item.typeId}\n§7Tags: ${tags.length ? tags.join(", ") : "None"}`
        );
    }
}, 5);
*/