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
import {
	registerHopperPolling
} from "./hopper";


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

// Hopper polling
registerHopperPolling()

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


// Play note particle
// TODO custom looping particle with tempo info launched in playDisc and ended by song end/block break
