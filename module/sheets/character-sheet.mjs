const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class TMNTOSCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["tmntos", "sheet", "actor", "character-sheet"],
    position: {
      width: 1200,
      height: 950
    },
    window: {
      resizable: true
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  });

  static PARTS = {
    sheet: {
      template: "systems/tmntos/templates/actor/character-sheet.hbs"
    }
  };

  async _prepareContext(_options) {
    const context = await super._prepareContext(_options);

    context.actor = this.document;
    context.system = this.document.system;
    context.items = this.#prepareItems(this.document.items);
    context.cssClass = this.document.isOwner ? "editable" : "locked";
    context.editable = this.isEditable;

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);

    const root = this.#rootElement();
    if (!root) return;

    this.#activateTabs(root);
    this.#activateRollButtons(root);
    this.#activateItemControls(root);
  }

  #rootElement() {
    if (this.element instanceof HTMLElement) return this.element;
    if (this.element?.[0] instanceof HTMLElement) return this.element[0];
    return null;
  }

  #activateTabs(root) {
    const tabs = Array.from(root.querySelectorAll(".tmntos-tabs .item"));
    const panels = Array.from(root.querySelectorAll(".tmntos-tab-panels .tab"));
    if (!tabs.length || !panels.length) return;

    const initial = this._activeTab ?? tabs[0].dataset.tab;

    const setActive = (tabId) => {
      this._activeTab = tabId;

      for (const tab of tabs) {
        tab.classList.toggle("active", tab.dataset.tab === tabId);
      }

      for (const panel of panels) {
        panel.classList.toggle("active", panel.dataset.tab === tabId);
      }
    };

    for (const tab of tabs) {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        setActive(tab.dataset.tab);
      });
    }

    setActive(initial);
  }

  #activateRollButtons(root) {
    root.querySelector("[data-action='roll-initiative']")?.addEventListener("click", async (event) => {
      event.preventDefault();
      await this.document.rollInitiative();
    });

    root.querySelector("[data-action='roll-strike']")?.addEventListener("click", async (event) => {
      event.preventDefault();
      await this.document.rollStrike();
    });

    root.querySelector("[data-action='roll-parry']")?.addEventListener("click", async (event) => {
      event.preventDefault();
      await this.document.rollParry();
    });

    root.querySelector("[data-action='roll-dodge']")?.addEventListener("click", async (event) => {
      event.preventDefault();
      await this.document.rollDodge();
    });

    for (const button of root.querySelectorAll("[data-action='roll-skill']")) {
      button.addEventListener("click", (event) => this.#onRollSkill(event));
    }

    for (const button of root.querySelectorAll("[data-action='roll-weapon-attack']")) {
      button.addEventListener("click", (event) => this.#onRollWeaponAttack(event));
    }

    for (const button of root.querySelectorAll("[data-action='roll-weapon-damage']")) {
      button.addEventListener("click", (event) => this.#onRollWeaponDamage(event));
    }

    for (const button of root.querySelectorAll("[data-action='roll-power']")) {
      button.addEventListener("click", (event) => this.#onRollPower(event));
    }

    for (const button of root.querySelectorAll("[data-action='roll-spell']")) {
      button.addEventListener("click", (event) => this.#onRollSpell(event));
    }
  }

  #activateItemControls(root) {
    if (!this.isEditable) return;

    for (const button of root.querySelectorAll("[data-action='item-create']")) {
      button.addEventListener("click", (event) => this.#onItemCreate(event));
    }

    for (const button of root.querySelectorAll("[data-action='item-edit']")) {
      button.addEventListener("click", (event) => this.#onItemEdit(event));
    }

    for (const button of root.querySelectorAll("[data-action='item-delete']")) {
      button.addEventListener("click", (event) => this.#onItemDelete(event));
    }

    for (const button of root.querySelectorAll("[data-action='item-toggle-equip']")) {
      button.addEventListener("click", (event) => this.#onItemToggleEquip(event));
    }
  }

  async #onRollSkill(event) {
    event.preventDefault();
    const item = this.#getEventItem(event);
    if (!item) return;
    await this.document.rollSkill(item.id);
  }

  async #onRollWeaponAttack(event) {
    event.preventDefault();
    const item = this.#getEventItem(event);
    if (!item) return;
    await this.document.rollWeaponAttack(item.id);
  }

  async #onRollWeaponDamage(event) {
    event.preventDefault();
    const item = this.#getEventItem(event);
    if (!item) return;
    await this.document.rollWeaponDamage(item.id);
  }

  async #onRollPower(event) {
    event.preventDefault();
    const item = this.#getEventItem(event);
    if (!item) return;
    await this.document.rollPower(item.id);
  }

  async #onRollSpell(event) {
    event.preventDefault();
    const item = this.#getEventItem(event);
    if (!item) return;
    await this.document.rollSpell(item.id);
  }

  #prepareItems(items) {
    const sections = {
      weapons: [],
      armor: [],
      shields: [],
      skills: [],
      proficiencies: [],
      powers: [],
      spells: [],
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
      else if (item.type === "armor") sections.armor.push(entry);
      else if (item.type === "shield") sections.shields.push(entry);
      else if (item.type === "skill") sections.skills.push(entry);
      else if (item.type === "proficiency") sections.proficiencies.push(entry);
      else if (item.type === "power") sections.powers.push(entry);
      else if (item.type === "spell") sections.spells.push(entry);
      else if (item.type === "equipment") sections.equipment.push(entry);
    }

    return sections;
  }

  async #onItemCreate(event) {
    event.preventDefault();

    const type = event.currentTarget.dataset.type;
    if (!type) return;

    await this.document.createEmbeddedDocuments("Item", [
      {
        name: `New ${type}`,
        type
      }
    ]);
  }

  #onItemEdit(event) {
    event.preventDefault();

    const item = this.#getEventItem(event);
    item?.sheet?.render(true);
  }

  async #onItemDelete(event) {
    event.preventDefault();

    const item = this.#getEventItem(event);
    if (!item) return;

    await this.document.deleteEmbeddedDocuments("Item", [item.id]);
  }

  async #onItemToggleEquip(event) {
    event.preventDefault();

    const item = this.#getEventItem(event);
    if (!item) return;

    await this.document.toggleEquipItem(item.id);
    await this.render(true);
  }

  #getEventItem(event) {
    const itemId = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return null;
    return this.document.items.get(itemId) ?? null;
  }
}