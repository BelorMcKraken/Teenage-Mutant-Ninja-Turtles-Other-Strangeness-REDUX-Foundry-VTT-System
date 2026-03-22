const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class TMNTOSItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["tmntos", "sheet", "item"],
    position: {
      width: 700,
      height: 680
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
      template: "systems/tmntos/templates/item/item-sheet.hbs"
    }
  };

  async _prepareContext(_options) {
    const context = await super._prepareContext(_options);

    context.item = this.document;
    context.system = this.document.system;
    context.editable = this.isEditable;
    context.itemType = this.document.type;

    context.isWeapon = this.document.type === "weapon";
    context.isArmor = this.document.type === "armor";
    context.isShield = this.document.type === "shield";
    context.isSkill = this.document.type === "skill";
    context.isProficiency = this.document.type === "proficiency";
    context.isPower = this.document.type === "power";
    context.isSpell = this.document.type === "spell";
    context.isEquipment = this.document.type === "equipment";

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);

    const root = this.#rootElement();
    if (!root) return;

    this.#activateTabs(root);
  }

  #rootElement() {
    if (this.element instanceof HTMLElement) return this.element;
    if (this.element?.[0] instanceof HTMLElement) return this.element[0];
    return null;
  }

  #activateTabs(root) {
    const tabs = Array.from(root.querySelectorAll(".tmntos-item-tabs .item"));
    const panels = Array.from(root.querySelectorAll(".tmntos-item-tab-panels .tab"));
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
}