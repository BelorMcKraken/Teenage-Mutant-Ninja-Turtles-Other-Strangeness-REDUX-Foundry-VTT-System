function sortByName(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export class TMNTOSActorSheetData {
  static prepare(actor) {
    const items = {
      all: [...actor.items]
    };

    const skills = sortByName(actor.items.filter((item) => item.type === "skill"));
    const proficiencies = sortByName(actor.items.filter((item) => item.type === "proficiency"));
    const weapons = sortByName(actor.items.filter((item) => item.type === "weapon"));
    const equipment = sortByName(actor.items.filter((item) => item.type === "equipment"));
    const powers = sortByName(actor.items.filter((item) => item.type === "power"));

    return {
      items,
      skills: {
        all: skills,
        professional: skills.filter((item) => item.system.category === "professional"),
        amateur: skills.filter((item) => item.system.category === "amateur")
      },
      proficiencies,
      weapons,
      equipment,
      powers
    };
  }
}