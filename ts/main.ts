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

// Data registries
import {
	jukeboxRegistry,
} from "./registries";

// Script API
import {
	world,
} from "@minecraft/server";

// CDisc item component
import {
	registerRecordComponent
} from "./record_component";

// Event subscribers
import {
	subscribeEventInventoryChangeLore
} from "./disc_handler";
import {
	subscribeJukeboxBreakHandler
} from "./jukebox_handler";


// Load the jukebox registry world data
world.afterEvents.worldLoad.subscribe( () => {
	loadWorldData( `${ADDON_NAMESPACE}:${JUKEBOX_DATA_NAME}`, jukeboxRegistry );
});

// Register the cdisc:record item component
registerRecordComponent();

// Add lore to dropped item
// subscribeEventItemEntityLore();

// Add lore on inventory change
subscribeEventInventoryChangeLore();

// Spawn disc on block break
subscribeJukeboxBreakHandler();

//@@@ Settings
import {
	SettingsWrapper
} from "./settings"
const settings = new SettingsWrapper();
settings.header( "Gameplay" )
settings.toggle( `${ADDON_NAMESPACE}:consume_creative`, "Consume music discs even in creative mode")
settings.textField( `${ADDON_NAMESPACE}:jukebox_reach`, "Use distance for jukeboxes" )



// Tick all playing songs every second
// TODO remove duration ticking, just on song end stop particle, send to lower hopper, check side and top hoppers (possibly unlock them when there was a previous lock)
/*
export function subscribeEventSongDurationTicker() {
	system.runInterval(() => {

		currentPlayingRegistry.forEach( (duration, jukeboxID) => {
			if ( duration-1 <= 0 ) {
				currentPlayingRegistry.delete(jukeboxID);

				//TODO move to hopper if present
				const from_id = fromJukeboxID(jukeboxID);
				if (from_id) {
					const under_juke_location = {
						x: from_id.location.x,
						y: from_id.location.y - 1,
						z: from_id.location.z
					}
					const hopper_block = from_id.dimension.getBlock(under_juke_location);
					if ( hopper_block?.typeId === "minecraft:hopper" ) {
						console.log("Hopper found under a jukebox where a song ended")
						const hopper_inv = hopper_block.getComponent("minecraft:inventory")
						if ( hopper_inv?.container ) {
							const container = hopper_inv.container;
							console.log(`Hopper size: ${container.size}`);
							console.log(`Empty slots: ${container.emptySlotsCount}`);

							// TODO handle full hoppers
							// TODO rethink some of the code and registries
							if(container.emptySlotsCount > 0) {
								const jukebox_entry = jukeboxRegistry.get(jukeboxID);
								if (!jukebox_entry) return;

								const item_id = jukebox_entry["id"];
								const disc_item = new ItemStack(item_id, 1);
								disc_item.setDynamicProperty("song_id", jukebox_entry["song_id"])
								container.addItem(disc_item);

								jukeboxRegistry.delete(jukeboxID);
							}

							//container.addItem(ItemStack)

						}
					}
				}

			}
			else currentPlayingRegistry.set(jukeboxID, duration-1);
		} );
	}, 20);
}
subscribeEventSongDurationTicker();
*/

// Play note particle
// TODO custom looping particle with tempo info launched in playDisc and ended by song end/block break
/*
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
*/

/*
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
*/