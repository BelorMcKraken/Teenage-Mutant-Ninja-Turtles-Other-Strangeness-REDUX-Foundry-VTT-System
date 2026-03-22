const {
  ArrayField,
  BooleanField,
  HTMLField,
  NumberField,
  ObjectField,
  SchemaField,
  StringField
} = foundry.data.fields;

function integerField(initial = 0, min = 0, max = null) {
  return new NumberField({
    required: true,
    integer: true,
    min,
    max,
    initial
  });
}

function numberField(initial = 0, min = null, max = null) {
  return new NumberField({
    required: true,
    min,
    max,
    initial
  });
}

function textField(initial = "") {
  return new StringField({
    required: true,
    blank: true,
    initial
  });
}

function htmlField() {
  return new HTMLField({
    required: true,
    blank: true
  });
}

function resourceField(initialValue = 0, initialMax = 0) {
  return new SchemaField({
    value: integerField(initialValue, 0),
    max: integerField(initialMax, 0)
  });
}

class TMNTOSBaseItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      notes: textField("")
    };
  }
}

export class TMNTOSWeaponDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      damage: textField(""),
      range: textField(""),
      proficiency: textField(""),
      isNatural: new BooleanField({ required: true, initial: false })
    };
  }
}

export class TMNTOSArmorDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      cost: textField(""),
      ar: integerField(0, 0),
      sdc: integerField(0, 0),
      weight: textField(""),
      details: textField(""),
      properties: textField(""),
      equipped: new BooleanField({ required: true, initial: false })
    };
  }
}

export class TMNTOSShieldDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      cost: textField(""),
      parry: integerField(0, -20, 20),
      sdc: integerField(0, 0),
      weight: textField(""),
      details: textField(""),
      properties: textField(""),
      equipped: new BooleanField({ required: true, initial: false })
    };
  }
}

export class TMNTOSSkillDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      category: new StringField({
        required: true,
        blank: false,
        initial: "amateur",
        options: ["professional", "amateur"]
      }),
      percent: integerField(0, 0, 98)
    };
  }
}

export class TMNTOSProficiencyDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      rangedStrike: integerField(0, -20, 20),
      meleeStrike: integerField(0, -20, 20),
      parry: integerField(0, -20, 20)
    };
  }
}

export class TMNTOSPowerDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      category: new StringField({
        required: true,
        blank: false,
        initial: "psionic",
        options: ["psionic", "spell", "mutation", "other"]
      }),
      bioECost: integerField(0, 0),
      range: textField(""),
      duration: textField(""),
      savingThrow: textField(""),
      effect: htmlField()
    };
  }
}

export class TMNTOSSpellDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      range: textField(""),
      duration: textField(""),
      savingThrow: textField(""),
      effect: htmlField()
    };
  }
}

export class TMNTOSEquipmentDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      quantity: integerField(1, 0),
      weight: numberField(0, 0),
      value: integerField(0, 0)
    };
  }
}

export class TMNTOSAnimalDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      canonicalName: textField(""),
      aliasGroup: textField(""),
      bioE: integerField(0, 0),
      original: new SchemaField({
        sizeLevel: integerField(0, 0, 20),
        lengthIn: numberField(0, 0),
        weightLbs: numberField(0, 0),
        build: textField("Medium")
      }),
      mutantChangesText: textField(""),
      attributeBonuses: new ObjectField({ required: true, initial: {} }),
      naturalWeapons: new ArrayField(new ObjectField(), {
        required: true,
        initial: []
      }),
      abilities: new ArrayField(new ObjectField(), {
        required: true,
        initial: []
      }),
      sizeLevelEffects: new ObjectField({ required: true, initial: {} }),
      sizeLevelFormulas: new ObjectField({ required: true, initial: {} }),
      encounterTables: new ArrayField(new ObjectField(), {
        required: true,
        initial: []
      }),
      sourceNotes: htmlField()
    };
  }
}

export class TMNTOSVehicleDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      category: textField(""),
      range: textField(""),
      topSpeed: textField(""),
      sdc: integerField(0, 0),
      cost: textField(""),
      crew: textField(""),
      passengers: textField(""),
      cargo: textField(""),
      details: textField("")
    };
  }
}

export class TMNTOSFeatureDataModel extends TMNTOSBaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      group: textField(""),
      option: textField(""),
      bioECost: integerField(0, 0),
      details: textField("")
    };
  }
}

export class TMNTOSCharacterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      identity: new SchemaField({
        animal: textField(""),
        alignment: textField(""),
        disposition: textField(""),
        age: integerField(0, 0),
        gender: textField(""),
        weight: textField(""),
        height: textField(""),
        size: textField(""),
        xp: integerField(0, 0),
        level: integerField(1, 1)
      }),

      attributes: new SchemaField({
        iq: integerField(8, 1),
        me: integerField(8, 1),
        ma: integerField(8, 1),
        ps: integerField(8, 1),
        pp: integerField(8, 1),
        pe: integerField(8, 1),
        pb: integerField(8, 1),
        spd: integerField(8, 1)
      }),

      bonuses: new SchemaField({
        allSkills: integerField(0, -99, 99),
        saveVsPsionics: integerField(0, -99, 99),
        charismaTrust: integerField(0, -99, 99),
        meleeHurledDamage: integerField(0, -99, 99),
        strikeParryDodge: integerField(0, -99, 99),
        saveVsComaToxinMagic: integerField(0, -99, 99),
        charmImpress: integerField(0, -99, 99)
      }),

      resources: new SchemaField({
        hp: resourceField(10, 10),
        sdc: resourceField(20, 20)
      }),

      armor: new SchemaField({
        name: textField(""),
        ar: integerField(0, 0),
        sdc: integerField(0, 0),
        weight: textField(""),
        properties: textField("")
      }),

      combat: new SchemaField({
        style: textField(""),
        actions: integerField(2, 0),
        initiative: integerField(0, -20, 20),
        strike: integerField(0, -20, 20),
        parry: integerField(0, -20, 20),
        dodge: integerField(0, -20, 20),
        roll: integerField(0, -20, 20),
        damage: integerField(0, -50, 50),
        critical: textField("")
      }),

      movement: new SchemaField({
        speed: integerField(0, 0),
        yardsMeters: integerField(0, 0),
        tabletopInches: integerField(0, 0),
        moveAction: integerField(0, 0),
        fullRound: integerField(0, 0),
        minuteSprint: integerField(0, 0)
      }),

      combatActions: new SchemaField({
        attack: new BooleanField({ required: true, initial: true }),
        disarm: new BooleanField({ required: true, initial: false }),
        tackle: new BooleanField({ required: true, initial: false }),
        throw: new BooleanField({ required: true, initial: false }),
        hold: new BooleanField({ required: true, initial: false }),
        leapAttack: new BooleanField({ required: true, initial: false }),
        criticalOrStunWithSneakAttack: new BooleanField({ required: true, initial: false }),
        criticalStrikeAllAttacks: new BooleanField({ required: true, initial: false }),
        criticalOrStunWithMelee: new BooleanField({ required: true, initial: false }),
        deathBlowOnNatural20: new BooleanField({ required: true, initial: false })
      }),

      combatReactions: new SchemaField({
        parry: new BooleanField({ required: true, initial: true }),
        dodge: new BooleanField({ required: true, initial: true }),
        roll: new BooleanField({ required: true, initial: true }),
        autoParry: new BooleanField({ required: true, initial: false }),
        entangle: new BooleanField({ required: true, initial: false }),
        disarm: new BooleanField({ required: true, initial: false }),
        throw: new BooleanField({ required: true, initial: false })
      }),

      mutation: new SchemaField({
        mutantOrigin: textField(""),
        animalAbilities: htmlField(),
        naturalWeapons: htmlField(),
        humanFeatures: htmlField(),
        originalAnimal: textField(""),
        originalAnimalSize: textField(""),
        sizeLevel: integerField(0, -10, 20),
        startingBioE: integerField(0, 0),
        sizeCosts: integerField(0, -999, 999),
        finalBioE: integerField(0, -999, 999)
      }),

      powers: new SchemaField({
        spellsPerDay: integerField(0, 0),
        spellsPerRound: integerField(0, 0),
        spellCombat: textField(""),
        spellStrength: integerField(0, 0),
        saveVsSpellMagic: integerField(0, -99, 99),
        saveVsCircleMagic: integerField(0, -99, 99),
        saveVsPsionics: integerField(0, -99, 99),
        savesVsStrangeness: textField("")
      }),

      notes: new SchemaField({
        general: htmlField(),
        combat: htmlField(),
        equipment: htmlField(),
        mutantBuild: htmlField()
      })
    };
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.resources.hp.value = Math.clamp(
      this.resources.hp.value,
      0,
      this.resources.hp.max
    );

    this.resources.sdc.value = Math.clamp(
      this.resources.sdc.value,
      0,
      this.resources.sdc.max
    );

    this.identity.level = Math.max(1, this.identity.level);

    const spd = this.attributes.spd ?? 0;
    this.movement.moveAction = spd;
    this.movement.fullRound = spd * 2;
    this.movement.minuteSprint = spd * 10;
    this.movement.tabletopInches = Math.max(1, Math.floor(spd / 11));
    this.movement.yardsMeters = spd * 3;
  }
}