// CDISC

// Important constants
import {
	ADDON_NAMESPACE,
	JUKEBOX_DATA_NAME
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


class DiscStack {
	item: ItemStack;

	constructor(item_type: string | ItemStack) {
		if (item_type instanceof ItemStack) {
			this.item = item_type;
		}
		else {
			this.item = new ItemStack(item_type, 1);
		}

		setDiscLore( this.item )
	}
}


world.afterEvents.worldLoad.subscribe( () => {
	loadWorldData( `${ADDON_NAMESPACE}:${JUKEBOX_DATA_NAME}`, jukeboxRegistry );
	// CREATIVE_CONSUME = loadWorldData( `${ADDON_NAMESPACE}:consume_creative` );
});
registerRecordComponent();



//// bleh

//@@@ Settings
import {
	SettingsWrapper
} from "./settings"
const settings = new SettingsWrapper();
settings.header( "Gameplay" )
settings.toggle( `${ADDON_NAMESPACE}:consume_creative`, "Consume music discs even in creative mode")
settings.textField( `${ADDON_NAMESPACE}:jukebox_reach`, "Use distance for jukeboxes" )



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



// Tick all playing songs every second
export function subscribeEventSongDurationTicker() {
	system.runInterval(() => {
		currentPlayingRegistry.forEach( (duration, jukeboxID) => {
			if ( duration-1 <= 0 ) {
				currentPlayingRegistry.delete(jukeboxID);
				//TODO move to hopper if present
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