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