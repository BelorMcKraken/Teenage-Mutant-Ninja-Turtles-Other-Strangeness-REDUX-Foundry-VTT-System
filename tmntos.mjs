import { TMNTOSActor } from "./module/documents/actor.mjs";
import { TMNTOSItem } from "./module/documents/item.mjs";
import {
  TMNTOSCharacterDataModel,
  TMNTOSWeaponDataModel,
  TMNTOSArmorDataModel,
  TMNTOSShieldDataModel,
  TMNTOSSkillDataModel,
  TMNTOSProficiencyDataModel,
  TMNTOSPowerDataModel,
  TMNTOSSpellDataModel,
  TMNTOSEquipmentDataModel,
  TMNTOSAnimalDataModel,
  TMNTOSVehicleDataModel,
  TMNTOSFeatureDataModel
} from "./module/data-models.mjs";
import { TMNTOSCharacterSheet } from "./module/sheets/character-sheet.mjs";
import { TMNTOSItemSheet } from "./module/sheets/item-sheet.mjs";

function getActorSpeaker(actor) {
  return ChatMessage.getSpeaker({ actor });
}

async function tmntosRollCheck({
  actor,
  label,
  formula,
  cardTitle = "",
  subtitle = "",
  tags = []
}) {
  const roll = await new Roll(formula).evaluate();

  return roll.toMessage({
    speaker: getActorSpeaker(actor),
    flavor: actor.buildChatCardHtml({
      title: cardTitle || label,
      subtitle,
      tags: [...tags, `Formula ${formula}`]
    })
  });
}

async function tmntosRollPercentCheck({
  actor,
  label,
  target,
  cardTitle = "",
  subtitle = "",
  tags = []
}) {
  const clampedTarget = Math.max(0, Math.min(98, Math.round(Number(target) || 0)));
  const roll = await new Roll("1d100").evaluate();
  const total = roll.total ?? 0;
  const success = total <= clampedTarget;
  const resultText = success ? "Success" : "Failure";

  return roll.toMessage({
    speaker: getActorSpeaker(actor),
    flavor: actor.buildChatCardHtml({
      title: cardTitle || label,
      subtitle: subtitle || resultText,
      tags: [...tags, `Rolled ${total}`, `Result ${resultText}`]
    })
  });
}

function applyActorMethodFallbacks() {
  const methods = {
    applyDamage: async function applyDamage(amount, { to = "sdc" } = {}) {
      const damage = Math.max(0, Math.round(Number(amount) || 0));
      if (!damage) return this;

      if (to === "hp") {
        const current = Number(this.system.resources.hp.value) || 0;
        return this.update({
          "system.resources.hp.value": Math.max(0, current - damage)
        });
      }

      const currentSDC = Number(this.system.resources.sdc.value) || 0;
      return this.update({
        "system.resources.sdc.value": Math.max(0, currentSDC - damage)
      });
    },

    rollCheck: async function rollCheck({
      label,
      formula,
      cardTitle = "",
      subtitle = "",
      tags = []
    }) {
      return tmntosRollCheck({
        actor: this,
        label,
        formula,
        cardTitle,
        subtitle,
        tags
      });
    },

    rollPercentCheck: async function rollPercentCheck({
      label,
      target,
      cardTitle = "",
      subtitle = "",
      tags = []
    }) {
      return tmntosRollPercentCheck({
        actor: this,
        label,
        target,
        cardTitle,
        subtitle,
        tags
      });
    },

    rollInitiative: async function rollInitiative() {
      const bonus = Number(this.system.combat.initiative) || 0;
      return this.rollCheck({
        label: "Initiative",
        formula: `1d20 + ${bonus}`,
        cardTitle: "Initiative Roll",
        tags: [`Bonus ${this.formatSigned(bonus)}`]
      });
    },

    rollStrike: async function rollStrike() {
      const bonus = Number(this.system.combat.strike) || 0;
      return this.rollCheck({
        label: "Strike",
        formula: `1d20 + ${bonus}`,
        cardTitle: "Strike Roll",
        tags: [`Bonus ${this.formatSigned(bonus)}`]
      });
    },

    rollParry: async function rollParry() {
      const baseParry = Number(this.system.combat.parry) || 0;
      const shieldParry = this.getEquippedShieldParryBonus();
      const totalParry = baseParry + shieldParry;

      return this.rollCheck({
        label: "Parry",
        formula: `1d20 + ${totalParry}`,
        cardTitle: "Parry Roll",
        tags: [
          `Base ${this.formatSigned(baseParry)}`,
          `Shield ${this.formatSigned(shieldParry)}`
        ]
      });
    },

    rollDodge: async function rollDodge() {
      const bonus = Number(this.system.combat.dodge) || 0;
      return this.rollCheck({
        label: "Dodge",
        formula: `1d20 + ${bonus}`,
        cardTitle: "Dodge Roll",
        tags: [`Bonus ${this.formatSigned(bonus)}`]
      });
    },

    rollSkill: async function rollSkill(itemId) {
      const item = this.items.get(itemId);
      if (!item || item.type !== "skill") return null;

      const percent = Number(item.system.percent) || 0;
      const globalBonus = Number(this.system.bonuses.allSkills) || 0;
      const target = percent + globalBonus;

      return this.rollPercentCheck({
        label: `${item.name} Skill Check`,
        target,
        cardTitle: item.name,
        tags: [
          `Target ${Math.max(0, Math.min(98, Math.round(target)))}%`,
          `Base ${percent}%`,
          `Global ${this.formatSigned(globalBonus)}`
        ]
      });
    },

    rollWeaponAttack: async function rollWeaponAttack(itemId) {
      const item = this.items.get(itemId);
      if (!item || item.type !== "weapon") return null;

      const isRanged = this.isRangedWeapon(item);
      const attackType = isRanged ? "Ranged" : "Melee";
      const combatBonus = Number(this.system.combat.strike) || 0;
      const proficiencyField = isRanged ? "rangedStrike" : "meleeStrike";
      const proficiencyBonus = this.getWeaponProficiencyBonus(item, proficiencyField);

      return this.rollCheck({
        label: `${item.name} Attack`,
        formula: `1d20 + ${combatBonus} + ${proficiencyBonus}`,
        cardTitle: `${item.name} Attack`,
        subtitle: attackType,
        tags: [
          `Range ${item.system.range || (isRanged ? "Ranged" : "Melee")}`,
          `Strike ${this.formatSigned(combatBonus)}`,
          `Prof ${this.formatSigned(proficiencyBonus)}`
        ]
      });
    },

    rollWeaponDamage: async function rollWeaponDamage(itemId) {
      const item = this.items.get(itemId);
      if (!item || item.type !== "weapon") return null;

      const baseFormula = this.normalizeFormula(item.system.damage, "1d4");
      const damageBonus = Number(this.system.bonuses.meleeHurledDamage) || 0;
      const formula = damageBonus ? `${baseFormula} + ${damageBonus}` : baseFormula;

      return this.rollCheck({
        label: `${item.name} Damage`,
        formula,
        cardTitle: `${item.name} Damage`,
        subtitle: this.isRangedWeapon(item) ? "Ranged Weapon" : "Melee Weapon",
        tags: [
          `Base ${baseFormula}`,
          `Bonus ${this.formatSigned(damageBonus)}`
        ]
      });
    },

    rollPower: async function rollPower(itemId) {
      const item = this.items.get(itemId);
      if (!item || item.type !== "power") return null;

      return this.rollCheck({
        label: `${item.name} Power`,
        formula: "1d20",
        cardTitle: item.name,
        subtitle: "Psionic Power",
        tags: [
          item.system.category ? `Type ${item.system.category}` : null,
          Number.isFinite(Number(item.system.bioECost)) ? `Bio-E ${Number(item.system.bioECost) || 0}` : null,
          item.system.range ? `Range ${item.system.range}` : null,
          item.system.duration ? `Duration ${item.system.duration}` : null,
          item.system.savingThrow ? `Save ${item.system.savingThrow}` : null
        ].filter(Boolean)
      });
    },

    rollSpell: async function rollSpell(itemId) {
      const item = this.items.get(itemId);
      if (!item || item.type !== "spell") return null;

      return this.rollCheck({
        label: `${item.name} Spell`,
        formula: "1d20",
        cardTitle: item.name,
        subtitle: "Spell",
        tags: [
          item.system.range ? `Range ${item.system.range}` : null,
          item.system.duration ? `Duration ${item.system.duration}` : null,
          item.system.savingThrow ? `Save ${item.system.savingThrow}` : null
        ].filter(Boolean)
      });
    },

    toggleEquipItem: async function toggleEquipItem(itemId) {
      const item = this.items.get(itemId);
      if (!item || !["armor", "shield"].includes(item.type)) return null;

      const equipped = !Boolean(item.system.equipped);
      await item.update({ "system.equipped": equipped });
      await this.syncEquippedDefense();

      return item;
    },

    syncEquippedDefense: async function syncEquippedDefense() {
      const equippedArmor = this.items.filter((item) => item.type === "armor" && item.system.equipped);
      const equippedShields = this.items.filter((item) => item.type === "shield" && item.system.equipped);

      const armorName = equippedArmor.map((item) => item.name).join(" + ");
      const shieldName = equippedShields.map((item) => item.name).join(" + ");
      const names = [armorName, shieldName].filter(Boolean).join(" + ");

      const armorAR = equippedArmor.length
        ? Math.max(...equippedArmor.map((item) => Number(item.system.ar) || 0))
        : 0;

      const totalArmorSDC = equippedArmor.reduce((sum, item) => sum + (Number(item.system.sdc) || 0), 0);
      const totalShieldSDC = equippedShields.reduce((sum, item) => sum + (Number(item.system.sdc) || 0), 0);
      const totalSDC = totalArmorSDC + totalShieldSDC;

      const weights = [...equippedArmor, ...equippedShields]
        .map((item) => String(item.system.weight || "").trim())
        .filter(Boolean)
        .join(" + ");

      const properties = [...equippedArmor, ...equippedShields]
        .map((item) => String(item.system.details || item.system.properties || "").trim())
        .filter(Boolean)
        .join("; ");

      return this.update({
        "system.armor.name": names,
        "system.armor.ar": armorAR,
        "system.armor.sdc": totalSDC,
        "system.armor.weight": weights,
        "system.armor.properties": properties
      });
    },

    getEquippedShieldParryBonus: function getEquippedShieldParryBonus() {
      return this.items
        .filter((item) => item.type === "shield" && item.system.equipped)
        .reduce((sum, item) => sum + (Number(item.system.parry) || 0), 0);
    },

    isRangedWeapon: function isRangedWeapon(item) {
      const range = String(item.system.range || "").trim().toLowerCase();
      if (!range) return false;

      const meleeTerms = ["melee", "touch", "self", "hand to hand", "hth"];
      return !meleeTerms.some((term) => range.includes(term));
    },

    getWeaponProficiencyBonus: function getWeaponProficiencyBonus(item, field) {
      const proficiencyName = String(item.system.proficiency || "").trim().toLowerCase();
      if (!proficiencyName) return 0;

      const proficiency = this.items.find((ownedItem) => {
        if (ownedItem.type !== "proficiency") return false;
        return ownedItem.name.trim().toLowerCase() === proficiencyName;
      });

      return Number(proficiency?.system?.[field]) || 0;
    },

    normalizeFormula: function normalizeFormula(value, fallback) {
      const formula = String(value || "").trim();
      return formula || fallback;
    },

    formatSigned: function formatSigned(value) {
      const n = Number(value) || 0;
      return n >= 0 ? `+${n}` : `${n}`;
    },

    buildTagsHtml: function buildTagsHtml(tags) {
      if (!tags?.length) return "";
      return `
        <div class="tmntos-chat-tags">
          ${tags.map((tag) => `<span class="tmntos-chat-tag">${tag}</span>`).join("")}
        </div>
      `;
    },

    buildChatCardHtml: function buildChatCardHtml({ title, subtitle = "", tags = [] }) {
      return `
        <div class="tmntos-chat-card">
          <div class="tmntos-chat-card__title">${title}</div>
          ${subtitle ? `<div class="tmntos-chat-card__subtitle">${subtitle}</div>` : ""}
          ${this.buildTagsHtml(tags)}
        </div>
      `;
    }
  };

  for (const [name, implementation] of Object.entries(methods)) {
    if (typeof TMNTOSActor.prototype[name] !== "function") {
      Object.defineProperty(TMNTOSActor.prototype, name, {
        value: implementation,
        writable: true,
        configurable: true
      });
    }

    if (typeof Actor.prototype[name] !== "function") {
      Object.defineProperty(Actor.prototype, name, {
        value: implementation,
        writable: true,
        configurable: true
      });
    }
  }
}

Hooks.once("init", () => {
  CONFIG.Actor.documentClass = TMNTOSActor;
  CONFIG.Item.documentClass = TMNTOSItem;

  CONFIG.Actor.dataModels = {
    character: TMNTOSCharacterDataModel
  };

  CONFIG.Item.dataModels = {
    weapon: TMNTOSWeaponDataModel,
    armor: TMNTOSArmorDataModel,
    shield: TMNTOSShieldDataModel,
    skill: TMNTOSSkillDataModel,
    proficiency: TMNTOSProficiencyDataModel,
    power: TMNTOSPowerDataModel,
    spell: TMNTOSSpellDataModel,
    equipment: TMNTOSEquipmentDataModel,
    animal: TMNTOSAnimalDataModel,
    vehicle: TMNTOSVehicleDataModel,
    feature: TMNTOSFeatureDataModel
  };

  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["resources.hp", "resources.sdc"],
      value: [
        "identity.xp",
        "identity.level",
        "combat.actions",
        "combat.initiative"
      ]
    }
  };

  applyActorMethodFallbacks();

  const ActorsCollection = foundry.documents.collections.Actors;
  const ItemsCollection = foundry.documents.collections.Items;

  ActorsCollection.registerSheet("tmntos", TMNTOSCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "TMNTOS Character Sheet"
  });

  ItemsCollection.registerSheet("tmntos", TMNTOSItemSheet, {
    types: [
      "weapon",
      "armor",
      "shield",
      "skill",
      "proficiency",
      "power",
      "spell",
      "equipment",
      "animal",
      "vehicle",
      "feature"
    ],
    makeDefault: true,
    label: "TMNTOS Item Sheet"
  });

  console.log("TMNTOS | Init complete");
});