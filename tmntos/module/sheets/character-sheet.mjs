export class TMNTOSCharacterSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tmntos", "sheet", "actor", "character-sheet"],
      template: "systems/tmntos/templates/actor/character-sheet.hbs",
      width: 1200,
      height: 1500,
      resizable: true
    });
  }

  getData() {
    const context = super.getData();

    context.actor = this.actor;
    context.system = this.actor.system;
    context.items = this.#prepareItems(this.actor.items);
    context.cssClass = this.actor.isOwner ? "editable" : "locked";
    context.editable = this.isEditable;

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-action='roll-initiative']").on("click", () => this.#safeRoll("initiative"));
    html.find("[data-action='roll-strike']").on("click", () => this.#safeRoll("strike"));
    html.find("[data-action='roll-parry']").on("click", () => this.#safeRoll("parry"));
    html.find("[data-action='roll-dodge']").on("click", () => this.#safeRoll("dodge"));
    html.find("[data-action='roll-skill']").on("click", this.#onRollSkill.bind(this));

    if (!this.isEditable) return;

    html.find("[data-action='item-create']").on("click", this.#onItemCreate.bind(this));
    html.find("[data-action='item-edit']").on("click", this.#onItemEdit.bind(this));
    html.find("[data-action='item-delete']").on("click", this.#onItemDelete.bind(this));
  }

  async #safeRoll(type) {
    const actor = this.actor;

    const methodMap = {
      initiative: "rollInitiative",
      strike: "rollStrike",
      parry: "rollParry",
      dodge: "rollDodge"
    };

    const method = methodMap[type];

    if (typeof actor[method] === "function") {
      return actor[method]();
    }

    let bonus = 0;
    let label = type;

    if (type === "initiative") bonus = actor.system.combat.initiative;
    if (type === "strike") bonus = actor.system.combat.strike;
    if (type === "parry") bonus = actor.system.combat.parry;
    if (type === "dodge") bonus = actor.system.combat.dodge;

    const roll = await new Roll(`1d20 + ${Number(bonus) || 0}`).evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${actor.name} rolls ${label}`
    });
  }

  async #onRollSkill(event) {
    event.preventDefault();

    const itemId = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return;

    const item = this.actor.items.get(itemId);
    if (!item) return;

    if (typeof this.actor.rollSkill === "function") {
      return this.actor.rollSkill(itemId);
    }

    const percent = Number(item.system.percent) || 0;
    const bonus = Number(this.actor.system.bonuses.allSkills) || 0;
    const target = percent + bonus;
    const roll = await new Roll("1d100").evaluate();
    const success = roll.total <= target;

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${this.actor.name} rolls ${item.name} (${success ? "Success" : "Failure"})`
    });
  }

  #prepareItems(items) {
    const sections = {
      weapons: [],
      skills: [],
      proficiencies: [],
      powers: [],
      equipment: []
    };

    for (const item of items) {
      const entry = {
        id: item.id,
        name: item.name,
        type: item.type,
        img: item.img,
        system: item.system
      };

      if (item.type === "weapon") sections.weapons.push(entry);
      else if (item.type === "skill") sections.skills.push(entry);
      else if (item.type === "proficiency") sections.proficiencies.push(entry);
      else if (item.type === "power") sections.powers.push(entry);
      else if (item.type === "equipment") sections.equipment.push(entry);
    }

    return sections;
  }

  async #onItemCreate(event) {
    event.preventDefault();

    const type = event.currentTarget.dataset.type;
    if (!type) return;

    await this.actor.createEmbeddedDocuments("Item", [
      {
        name: `New ${type}`,
        type
      }
    ]);
  }

  #onItemEdit(event) {
    event.preventDefault();

    const itemId = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return;

    const item = this.actor.items.get(itemId);
    item?.sheet?.render(true);
  }

  async #onItemDelete(event) {
    event.preventDefault();

    const itemId = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return;

    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }
}