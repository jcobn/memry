import { TFile } from "obsidian";
import MemryPlugin from "./main";
import { NoteState } from "./managers/DataManager";
import { daysBetween, daysLate } from "./utils/time";
import {
  getKnowledgeScore,
  getNoteName,
  getReviewQueue,
  isDue,
  isFragile,
  isLearned,
  isNotLearnedYet,
} from "./utils/srsLogic";

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

        el.createEl("h2", { text: "📊 stats" });
        el.createEl("p", { text: "tracked notes / learning: " }).createEl(
          "code",
          {
            text:
              Object.keys(
                this.plugin.noteManager.getAllNotes()
              ).length.toString() +
              " / " +
              Object.values(this.plugin.noteManager.getAllNotes()).filter(
                (n) => {
                  return n.lastReview !== null;
                }
              ).length,
          }
        );
        el.createEl("p", { text: "due today / overdue: " }).createEl("code", {
          text: `${
            getReviewQueue(this.plugin.noteManager.getAllNotes()).length
          } / ${
            Object.values(this.plugin.noteManager.getAllNotes()).filter((a) => {
              return daysLate(a) > 0;
            }).length
          }`,
        });

        el.createEl("h2", { text: "📚 all notes" });

        const notes = this.plugin.noteManager.getAllNotes();
        const sets = this.plugin.noteManager.getAllSets();

        if (!Object.entries(notes).length) {
          el.createEl("p", { text: "no notes yet." });
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
            setContainer.createEl("p", { text: "no notes in this set." });
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
            if (!isNotLearnedYet(note)) {
              if (isDue(note)) {
                li.createSpan({
                  text: daysLate(note) >= 1 ? "‼️ " : "❗ ",
                  attr: { title: "due" },
                });
              }
              const badge = isFragile(note)
                ? { text: "🔴", attr: { title: "fragile" } }
                : isLearned(note)
                ? { text: "🟢", attr: { title: "learned" } }
                : { text: "🟡", attr: { title: "learning" } };
              li.createSpan(badge);
              li.createEl("code", {
                text: ` ${Math.round(getKnowledgeScore(note))}% `,
              });
            }
            li.createSpan().innerHTML = `
            <a href="obsidian://open?vault=${this.plugin.app.vault.getName()}&file=${path}">${getNoteName(
              path
            )}</a> — 
            `;

            let info = `${
              isNotLearnedYet(note)
                ? "not reviewing yet."
                : "next review in " +
                  daysBetween(Date.now(), note.nextReview) +
                  " day(s)" +
                  ", last review " +
                  (daysBetween(note.lastReview!, Date.now()) === 0
                    ? "today"
                    : daysBetween(note.lastReview!, Date.now()) + " day(s) ago")
            }`;
            info += `<br>
            S: ${note.stability.toFixed(1)}, D: ${note.difficulty.toFixed(1)}, 
            reps: ${note.reps}
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
                await this.plugin.noteManager.markAsLearned({ [path]: note });
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
    const file = this.plugin.app.vault.getAbstractFileByPath(
      this.plugin.dataManager.settings.dashboardPath
    );
    if (!(file instanceof TFile)) return;

    let content = await this.plugin.app.vault.read(file);

    content = content.replace(
      /```memry-dashboard[\s\S]*?```/,
      `\`\`\`memry-dashboard\n${Date.now()}\n\`\`\``
    );

    await this.plugin.app.vault.modify(file, content);
  }

  async ensureDashboardNote() {
    const existing = this.plugin.app.vault.getAbstractFileByPath(
      this.plugin.dataManager.settings.dashboardPath
    );

    if (existing instanceof TFile) return existing;
    const content = `\n\`\`\`memry-dashboard\n${Date.now()}\n\`\`\``;

    return await this.plugin.app.vault.create(
      this.plugin.dataManager.settings.dashboardPath,
      content
    );
  }
}
