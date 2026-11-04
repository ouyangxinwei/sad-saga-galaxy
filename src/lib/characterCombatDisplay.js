const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

/**
 * Build the chance values shown in character details from the same battle-unit
 * values used by combat. Conditional formation bonuses remain separate.
 */
export function getCharacterCombatChanceDisplay({
  definition,
  equipmentCrit = 0,
  fortuneCrit = 0,
  desperateRates,
  formationBonus = {},
  battleUnit = null,
}) {
  const baseCrit = Number(definition?.stats?.crit) || 0.08;
  const effectiveEquipmentCrit = Math.min(
    Math.max(0, Number(equipmentCrit) || 0),
    Math.max(0, 0.75 - baseCrit),
  );
  const characterCrit = Math.min(0.75, baseCrit + effectiveEquipmentCrit);
  const activeFortuneCrit = Number(fortuneCrit) || 0;
  const formationCrit = Number(formationBonus.criticalPp) || 0;
  const calculatedCrit = clamp(characterCrit + activeFortuneCrit + formationCrit, 0, 0.75);

  const baseDesperateCrit = Number(desperateRates?.desperateCritRate) || 0;
  const formationDesperateCrit = Number(formationBonus.desperateCritPp) || 0;
  const calculatedDesperateCrit = clamp(baseDesperateCrit + formationDesperateCrit, 0, 0.35);

  const baseDesperateDodge = Number(desperateRates?.desperateDodgeRate) || 0;
  const formationDodge = Number(formationBonus.dodgePp) || 0;
  const highSpeedDodge = Number(
    formationBonus.conditionalHighSpeedDodgePp ?? formationBonus.highSpeedDodgePp,
  ) || 0;
  const highSpeedActive = Boolean(battleUnit?.isHighSpeed && highSpeedDodge > 0);
  const calculatedDesperateDodge = clamp(
    baseDesperateDodge + formationDodge + (highSpeedActive ? highSpeedDodge : 0),
    0,
    0.45,
  );

  return {
    critical: {
      base: baseCrit,
      equipment: effectiveEquipmentCrit,
      fortune: activeFortuneCrit,
      formation: formationCrit,
      rate: Number.isFinite(battleUnit?.crit) ? clamp(battleUnit.crit, 0, 0.75) : calculatedCrit,
      cap: 0.75,
    },
    desperateCritical: {
      base: baseDesperateCrit,
      formation: formationDesperateCrit,
      rate: Number.isFinite(battleUnit?.desperateCritRate)
        ? clamp(battleUnit.desperateCritRate, 0, 0.35)
        : calculatedDesperateCrit,
      cap: 0.35,
      hpThreshold: 0.2,
    },
    desperateDodge: {
      base: baseDesperateDodge,
      formation: formationDodge,
      highSpeed: highSpeedDodge,
      highSpeedActive,
      rate: Number.isFinite(battleUnit?.desperateDodgeRate)
        ? clamp(battleUnit.desperateDodgeRate, 0, 0.45)
        : calculatedDesperateDodge,
      cap: 0.45,
      hpThreshold: 0.1,
    },
    followUpCriticalPp: Number(formationBonus.followUpCriticalPp) || 0,
  };
}
