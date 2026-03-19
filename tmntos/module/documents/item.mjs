export class TMNTOSItem extends Item {
  get summary() {
    switch (this.type) {
      case "weapon":
        return `${this.system.damage || "-"} / ${this.system.range || "-"}`;
      case "skill":
        return `${this.system.category}: ${this.system.percent}%`;
      case "proficiency":
        return `RS ${this.system.rangedStrike}, MS ${this.system.meleeStrike}, P ${this.system.parry}`;
      case "power":
        return `${this.system.category} (${this.system.bioECost} Bio-E)`;
      case "equipment":
        return `x${this.system.quantity}`;
      default:
        return "";
    }
  }
}