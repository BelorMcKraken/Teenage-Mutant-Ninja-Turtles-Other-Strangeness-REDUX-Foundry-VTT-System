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
}