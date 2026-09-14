const ADDON_NAME = "Tree Nests";
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
export function loadWorldData( id: string, destination: any ) {

	// Pre-load clean up
	try {
		destination.clear(); //TODO handle for non collections
	} catch {
		
	}

	// Get dynamic property and check if it exists
	const property = world.getDynamicProperty(id);
	if (property) {
		log(`Loading data from dyn. property with id=${id}`);

		// Handle depending on collection type
		if ( destination instanceof Set  ) {
			const loaded_data = new Set(JSON.parse(property as string));
			for (let entry of loaded_data) destination.add(entry);
		}
		
		else if ( destination instanceof Map  ) {
			const loaded_data = new Map(Object.entries(JSON.parse(property as string)));
			for (const [key,value] of loaded_data) destination.set(key, value);
		} 
		
		else {
			//destination = property;
			//console.log(typeof(property), property, typeof(destination), destination);
			return property; // TODO handle this more elegantly

		}
		
	}

	// If no dynamic property with id found
	else {
		warn(`No saved data found for id=${id}`);
	}
}

