import {
    system,
    CommandPermissionLevel,
    Player,
} from "@minecraft/server";

import {
    ModalFormData, ModalFormDataSliderOptions, ModalFormDataTextFieldOptions, ModalFormDataToggleOptions
} from "@minecraft/server-ui";

import {DEBUG_MODE, setDebugMode} from "./logger";

import {saveWorldData} from "./world_data_save";
import {ADDON_NAME, ADDON_NAMESPACE} from "./default_const";

enum SettingType {
    slider,
    toggle,
    textField,
    divider,
    header
}

interface SettingsEntry {
    type: SettingType
    settings_id?: string
    label?: string
    options?: ModalFormDataTextFieldOptions | ModalFormDataToggleOptions | ModalFormDataSliderOptions | undefined
}



export class SettingsWrapper {

    element_iterator: number
    settings_entries: SettingsEntry[]

    constructor() {
        this.settings_entries = []
        this.element_iterator = 0;
    }

    slider( settings_id: string, label: string, options?: ModalFormDataSliderOptions ) {
        console.log("registering a slider")
        this.settings_entries.push(
            {
                type: SettingType.slider,
                settings_id: settings_id,
                label: label,
                options: options
            }
        )
    }

    toggle( settings_id: string, label: string, options?: ModalFormDataToggleOptions ) {
        console.log("registering a toggle")
        this.settings_entries.push(
            {
                type: SettingType.toggle,
                settings_id: settings_id,
                label: label,
                options: options
            }
        )
    }

    textField( settings_id: string, label: string, options?: ModalFormDataTextFieldOptions ) {
        console.log("registering a slider")
        this.settings_entries.push(
            {
                type: SettingType.textField,
                settings_id: settings_id,
                label: label,
                options: options
            }
        )
    }

    divider() {
        console.log("registering a divider")
        this.settings_entries.push(
            {
                type: SettingType.divider
            }
        )
    }

    header( label: string ) {
        console.log("registering a header")
        this.settings_entries.push(
            {
                type: SettingType.header,
                label: label
            }
        )
    }




    registerCommand() {
        system.beforeEvents.startup.subscribe(({customCommandRegistry}) => {
            customCommandRegistry.registerCommand(
                {
                    name: ADDON_NAMESPACE + ":settings",
                    description: `Opens the settings menu for the ${ADDON_NAME} addon`,
                    permissionLevel: CommandPermissionLevel.Admin, //must be non opener,
                    cheatsRequired: false
                },
                (origin) => {
                    const player = origin.sourceEntity as Player;

                    system.run(() => {
                        let settings_form = new ModalFormData();
                        settings_form.title(`${ADDON_NAME} Settings`); //


                        // Register user defined entries
                        this.settings_entries.forEach( entry => {
                            switch (entry.type) {

                                case SettingType.divider:
                                    settings_form.divider()
                                    break

                                case SettingType.header:
                                    settings_form.header(
                                        entry.label as string
                                    )
                                    break

                                case SettingType.toggle:
                                    settings_form.toggle(
                                        entry.label as string,
                                        entry.options as ModalFormDataToggleOptions
                                    )
                                    break

                                case SettingType.slider:
                                    settings_form.slider(
                                        entry.label as string,
                                        0, //TODO make data driven
                                        100, //TODO make data driven
                                        entry.options as ModalFormDataSliderOptions
                                    )
                                    break

                                case SettingType.textField:
                                    settings_form.textField(
                                        entry.label as string,
                                        "" //TODO make data driven
                                    )
                                    break
                            }
                        } )


                        settings_form.divider(); //n-3
                        settings_form.header("Developer"); //n-2
                        settings_form.toggle("Debug logging", { //n-1
                            defaultValue: DEBUG_MODE
                        });

                        settings_form.show(player).then(result => {

                            if ( !result || result.canceled ) return;
                            if ( !result.formValues?.length ) return;

                            console.log( typeof(result.formValues) );
                            console.log( JSON.stringify(result.formValues) );


                            for ( let i = 0; i < result.formValues.length; i+=1 ) {
                                let entry = this.settings_entries[i];
                                if ( entry.type !== SettingType.header && entry.type !== SettingType.divider ) continue;
                                console.log(`> ${entry.label} (setting id ${entry.settings_id})`)
                                console.log(`* Result: ${result.formValues[i]}`)
                            }

                            // SAVE SETTINGS

                            // setHollowChance(  (result.formValues?.at(1) as number ?? 0) / 100 );
                            // saveWorldData(`${ADDON_NAMESPACE}:hollow_chance`, HOLLOW_CHANCE);

                            setDebugMode(result.formValues?.at( result.formValues.length - 1 ) as boolean);
                            saveWorldData(`${ADDON_NAMESPACE}:debug_mode`, DEBUG_MODE);
                        });
                    });
                }
            );
        });
    }
}

/*
export function registerSettingsCommand() {
    system.beforeEvents.startup.subscribe(({customCommandRegistry}) => {

        customCommandRegistry.registerCommand(
            {
                name: ADDON_NAMESPACE + ":settings",
                description: `Opens the settings menu for the ${ADDON_NAME} addon`,
                permissionLevel: CommandPermissionLevel.Host, //must be non opener,
                cheatsRequired: false
            },
            (origin) => {
                const player = origin.sourceEntity as Player;

                system.run(() => {

                    let settings_form = new ModalFormData();
                    // DISPLAY SETTINGS


                    const elementsList = [
                        ["title", ]
                    ]

                    for (let entry in elementsList) {
                        switch (entry[0]) {
                            case "textField":
                                settings_form.textField( entry[1] );
                        }
                    }



                    settings_form.slider("Nest inhabitant spawn rate [%%]", 0, 100, {
                        defaultValue: INHABITANT_CHANCE * 100,
                        tooltip: "Chance for a nest to have a mob in it when it is generated."
                    });
                    settings_form.divider();

                    settings_form.header("Developer");
                    settings_form.toggle("Debug logging", {
                        defaultValue: DEBUG_MODE
                    });

                    settings_form.show(player).then(result => {

                        if ( !result || result.canceled ) return;

                        // SAVE SETTINGS

                        setHollowChance(  (result.formValues?.at(1) as number ?? 0) / 100 );
                        saveWorldData(`${ADDON_NAMESPACE}:hollow_chance`, HOLLOW_CHANCE);

                        setInhabitantChance( (result.formValues?.at(2) as number ?? 0) / 100 );
                        saveWorldData(`${ADDON_NAMESPACE}:inhabitant_chance`, INHABITANT_CHANCE);

                        setDebugMode(result.formValues?.at(5) as boolean);
                        saveWorldData(`${ADDON_NAMESPACE}:debug_mode`, DEBUG_MODE);


                    });
                });


                /*return {
                    CustomCommandStatus.Success,
                    message: "Opened the settings menu"
                };
            }
        );
    });
}
*/