import { Notice } from "obsidian";

export function memryNotice(message: string, duration?: number) {
  new Notice("memry: " + message, duration ? duration : undefined);
}

export function errorNotice(message: string) {
  new Notice("[ERROR] memry: " + message, 0);
}
