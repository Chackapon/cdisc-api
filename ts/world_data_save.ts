/**
 * Functions that handle saving and loading of world dynamic properties
 */

import {
   world,
} from "@minecraft/server";
import { log, warn } from "./logger.js";

/**
 * Saves a collection (either a Set or a Map) as a world dynamic property by converting it into string
 * ! Important: string size limit is 32,767 bytes
 * @param id
 * @param save_data
 */
export function saveWorldData( id: string, save_data: any ) {

	// Handle depending on collection type
	if ( save_data instanceof Set  ) {
		world.setDynamicProperty(id, JSON.stringify([...save_data]));
	}

	else if ( save_data instanceof Map  ) {
		world.setDynamicProperty(id, JSON.stringify( Object.fromEntries( save_data ) ) );
	}
	
	else {
		world.setDynamicProperty(id, save_data);
	}
}

/**
 * Loads a dynamic property into a collection (either a Set or a Map)
 * @param id
 * @param destination Map|Set
 */
export function loadWorldData( id: string, destination?: any ) {

	// Get dynamic property and check if it exists
	const property = world.getDynamicProperty(id);
	if ( !property ) {
		warn(`No saved data found for id=${id}`);
		return;
	}

	log(`Loading data from dyn. property with id=${id}`);

	// If target is a collection
	if (destination) {
		// Pre-load clean up
		destination.clear();

		// Handle depending on collection type
		if ( destination instanceof Set  ) {
			const loaded_data = new Set(JSON.parse(property as string));
			for (let entry of loaded_data) destination.add(entry);
		}

		else if ( destination instanceof Map  ) {
			const loaded_data = new Map(Object.entries(JSON.parse(property as string)));
			for (const [key,value] of loaded_data) destination.set(key, value);
		}
	}

	// If target is a simple variable
	else return property;


}
