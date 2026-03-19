import { TMNTOSActor } from "./module/documents/actor.mjs";
import { TMNTOSItem } from "./module/documents/item.mjs";
import {
  TMNTOSCharacterDataModel,
  TMNTOSWeaponDataModel,
  TMNTOSSkillDataModel,
  TMNTOSProficiencyDataModel,
  TMNTOSPowerDataModel,
  TMNTOSEquipmentDataModel
} from "./module/data-models.mjs";
import { TMNTOSCharacterSheet } from "./module/sheets/character-sheet.mjs";

function getActorSpeaker(actor) {
  return ChatMessage.getSpeaker({ actor });
}

async function tmntosRollCheck({ actor, label, formula }) {
  const roll = await new Roll(formula).evaluate();

  return roll.toMessage({
    speaker: getActorSpeaker(actor),
    flavor: `${actor.name} rolls ${label}`
  });
}

async function tmntosRollPercentCheck({ actor, label, target }) {
  const clampedTarget = Math.max(0, Math.min(98, Math.round(Number(target) || 0)));
  const roll = await new Roll("1d100").evaluate();
  const total = roll.total ?? 0;
  const success = total <= clampedTarget;
  const resultText = success ? "Success" : "Failure";

  return roll.toMessage({
    speaker: getActorSpeaker(actor),
    flavor: `${actor.name} rolls ${label} (${resultText}: ${total} vs ${clampedTarget}%)`
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

    rollCheck: async function rollCheck({ label, formula }) {
      return tmntosRollCheck({ actor: this, label, formula });
    },

    rollPercentCheck: async function rollPercentCheck({ label, target }) {
      return tmntosRollPercentCheck({ actor: this, label, target });
    },

    rollInitiative: async function rollInitiative() {
      const bonus = Number(this.system.combat.initiative) || 0;
      return this.rollCheck({
        label: "Initiative",
        formula: `1d20 + ${bonus}`
      });
    },

    rollStrike: async function rollStrike() {
      const bonus = Number(this.system.combat.strike) || 0;
      return this.rollCheck({
        label: "Strike",
        formula: `1d20 + ${bonus}`
      });
    },

    rollParry: async function rollParry() {
      const bonus = Number(this.system.combat.parry) || 0;
      return this.rollCheck({
        label: "Parry",
        formula: `1d20 + ${bonus}`
      });
    },

    rollDodge: async function rollDodge() {
      const bonus = Number(this.system.combat.dodge) || 0;
      return this.rollCheck({
        label: "Dodge",
        formula: `1d20 + ${bonus}`
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
        target
      });
    }
  };

  for (const [name, implementation] of Object.entries(methods)) {
    if (typeof TMNTOSActor.prototype[name] !== "function") {
      Object.defineProperty(TMNTOSActor.prototype, name, {
        value: implementation,
        writable: true,
        configurable: true
      });
      console.warn(`TMNTOS | Injected missing TMNTOSActor.prototype.${name}`);
    }

    if (typeof Actor.prototype[name] !== "function") {
      Object.defineProperty(Actor.prototype, name, {
        value: implementation,
        writable: true,
        configurable: true
      });
      console.warn(`TMNTOS | Injected missing Actor.prototype.${name}`);
    }
  }

  console.log(
    "TMNTOS | Prototype methods:",
    Object.getOwnPropertyNames(TMNTOSActor.prototype)
  );
}

Hooks.once("init", () => {
  console.log("TMNTOS | Init starting...");

  CONFIG.Actor.documentClass = TMNTOSActor;
  CONFIG.Item.documentClass = TMNTOSItem;

  CONFIG.Actor.dataModels = {
    character: TMNTOSCharacterDataModel
  };

  CONFIG.Item.dataModels = {
    weapon: TMNTOSWeaponDataModel,
    skill: TMNTOSSkillDataModel,
    proficiency: TMNTOSProficiencyDataModel,
    power: TMNTOSPowerDataModel,
    equipment: TMNTOSEquipmentDataModel
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
  const BaseActorSheet = foundry.appv1.sheets.ActorSheet;

  try {
    ActorsCollection.unregisterSheet("core", BaseActorSheet);
  } catch (err) {
    console.warn("TMNTOS | Core sheet unregister skipped:", err);
  }

  ActorsCollection.registerSheet("tmntos", TMNTOSCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "TMNTOS Character Sheet"
  });

  console.log("TMNTOS | Init complete");
});

Hooks.once("ready", () => {
  console.log("TMNTOS | Ready");

  const actor = game.actors?.contents?.[0];
  if (!actor) {
    console.warn("TMNTOS | No actors found for debug");
    return;
  }

  console.log("TMNTOS | Actor constructor:", actor.constructor.name);
  console.log("TMNTOS | rollInitiative:", typeof actor.rollInitiative);
  console.log("TMNTOS | rollStrike:", typeof actor.rollStrike);
  console.log("TMNTOS | rollParry:", typeof actor.rollParry);
  console.log("TMNTOS | rollDodge:", typeof actor.rollDodge);
  console.log(
    "TMNTOS | Runtime prototype methods:",
    Object.getOwnPropertyNames(Object.getPrototypeOf(actor))
  );
});