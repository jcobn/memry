import { Modal } from "obsidian";
import MemryPlugin from "./main";

export default class Commands {
    plugin: MemryPlugin;

    constructor(plugin: MemryPlugin) {
        this.plugin = plugin
    }

    addCommands() {
        const plugin = this.plugin;

        plugin.addCommand({id: "test",
            name: "Test",
            callback: () => {
                console.log("test command");
            }
        })
    }
}