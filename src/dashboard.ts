import { TFile } from "obsidian";
import MemryPlugin from "./main";
import { NoteState } from "./dataManager";

const DASHBOARD_PATH: string = "memry dashboard.md";
export const DAY_TO_MILLIS = 24 * 60 * 60 * 1000;

export class Dashboard {
  plugin: MemryPlugin;

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
  }

  async init() {
    this.plugin.registerMarkdownCodeBlockProcessor(
      "memry-dashboard",
      async (source, el, ctx) => {
        el.empty();

        el.createEl("h2", { text: "📚 Notes" });

        const notes = this.plugin.srsManager.getAllNotes();
        const sets = this.plugin.srsManager.getAllSets();

        if (!Object.entries(notes).length) {
          el.createEl("p", { text: "No SRS notes yet." });
          return;
        }

        const notesBySet: Record<string, Record<string, NoteState>[]> = {};
        for (const [id, note] of Object.entries(notes)) {
          if (!notesBySet[note.setId]) notesBySet[note.setId] = [];
          notesBySet[note.setId].push({ [id]: note });
        }

        const sortedSetIds = Object.keys(sets).sort((a, b) =>
          sets[a].name.localeCompare(sets[b].name)
        );

        for (const setId of sortedSetIds) {
          const set = sets[setId];
          const setNotes = notesBySet[setId] || [];

          const setContainer = el.createEl("div", { cls: "srs-set" });
          setContainer.createEl("h3", { text: "🎯 " + set.name });

          if (set.description) {
            setContainer.createEl("p", {
              text: set.description,
              cls: "srs-set-desc",
            });
          }

          if (!setNotes.length) {
            setContainer.createEl("p", { text: "No notes in this set." });
            continue;
          }

          setNotes.sort(
            (a, b) =>
              a[Object.keys(a)[0]].nextReview - b[Object.keys(b)[0]].nextReview
          );

          const ul = setContainer.createEl("ul");
          for (const n of setNotes) {
            const note = Object.values(n)[0];
            const path = Object.keys(n)[0];
            const li = ul.createEl("li");

            if (!path) continue;
            li.createSpan().innerHTML = `
            <a href="obsidian://open?vault=${this.plugin.app.vault.getName()}&file=${path}">${this.plugin.srsManager.getNoteName(
              path
            )}</a> — 
            `;

            let info = `${
              note.lastReview === null
                ? "not reviewing yet."
                : "next review: " +
                  new Date(note.nextReview).toLocaleDateString() +
                  " (in " +
                  Math.round((note.nextReview - Date.now()) / DAY_TO_MILLIS) +
                  " day/s)" +
                  ", last review: " +
                  new Date(note.lastReview).toLocaleDateString()
            }`;
            info += `<br>
            S: ${note.stability.toFixed(1)}, D: ${note.difficulty.toFixed(
              1
            )}<br>
            reps: ${note.reps}, lapses: ${note.lapses}
            `;
            const span = li.createEl("span", { cls: "srs-note-info" });
            span.innerHTML = info;
            li.createEl("br");
            if (note.lastReview === null) {
              const b = li.createEl("button", {
                text: "✓ mark as learned",
                cls: "srs-btn srs-btn-learned",
              });
              b.onclick = async () => {
                await this.plugin.srsManager.markAsLearned({ [path]: note });
              };
            }
          }
        }
      }
    );

    this.plugin.app.workspace.onLayoutReady(async () => {
      await this.ensureDashboardNote();
    });
  }

  public async rerender() {
    const file = this.plugin.app.vault.getAbstractFileByPath(DASHBOARD_PATH);
    if (!(file instanceof TFile)) return;

    let content = await this.plugin.app.vault.read(file);

    content = content.replace(
      /```memry-dashboard[\s\S]*?```/,
      `\`\`\`memry-dashboard\n${Date.now()}\n\`\`\``
    );

    await this.plugin.app.vault.modify(file, content);
  }

  async ensureDashboardNote() {
    const existing =
      this.plugin.app.vault.getAbstractFileByPath(DASHBOARD_PATH);

    if (existing instanceof TFile) return existing;
    const content = `\n\`\`\`memry-dashboard\n${Date.now()}\n\`\`\``;

    return await this.plugin.app.vault.create(DASHBOARD_PATH, content);
  }
}
