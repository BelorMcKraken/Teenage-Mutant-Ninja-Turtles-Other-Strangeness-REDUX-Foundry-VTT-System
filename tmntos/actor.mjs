export class TMNTOSActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  async applyDamage(amount, { to = "sdc" } = {}) {
    const damage = Math.max(0, Math.round(Number(amount) || 0));
    if (!damage) return this;

    if (to === "hp") {
      const current = this.system.resources.hp.value;
      return this.update({
        "system.resources.hp.value": Math.max(0, current - damage)
      });
    }

    const currentSDC = this.system.resources.sdc.value;
    return this.update({
      "system.resources.sdc.value": Math.max(0, currentSDC - damage)
    });
  }

  async rollInitiative() {
    const bonus = Number(this.system.combat.initiative) || 0;
    return this.rollCheck({
      label: "Initiative",
      formula: `1d20 + ${bonus}`
    });
  }

  async rollStrike() {
    const bonus = Number(this.system.combat.strike) || 0;
    return this.rollCheck({
      label: "Strike",
      formula: `1d20 + ${bonus}`
    });
  }

  async rollParry() {
    const bonus = Number(this.system.combat.parry) || 0;
    return this.rollCheck({
      label: "Parry",
      formula: `1d20 + ${bonus}`
    });
  }

  async rollDodge() {
    const bonus = Number(this.system.combat.dodge) || 0;
    return this.rollCheck({
      label: "Dodge",
      formula: `1d20 + ${bonus}`
    });
  }

  async rollSkill(itemId) {
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

  async rollCheck({ label, formula }) {
    const roll = await new Roll(formula).evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${this.name} rolls ${label}`
    });
  }

  async rollPercentCheck({ label, target }) {
    const clampedTarget = Math.max(0, Math.min(98, Math.round(target)));
    const roll = await new Roll("1d100").evaluate();
    const total = roll.total ?? 0;
    const success = total <= clampedTarget;
    const resultText = success ? "Success" : "Failure";

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${this.name} rolls ${label} (${resultText}: ${total} vs ${clampedTarget}%)`
    });
  }

  async rollWeaponAttack(itemId) {
    const item = this.items.get(itemId);
    if (!item) return;

    const strike = Number(this.system.combat.strike) || 0;

    return this.rollCheck({
      label: `${item.name} Attack`,
      formula: `1d20 + ${strike}`
    });
  }

async rollWeaponDamage(itemId) {
    const item = this.items.get(itemId);
    if (!item) return;

    const damage = item.system.damage || "1d6";

    const roll = await new Roll(damage).evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${this.name} deals damage with ${item.name}`
    });
  }

}