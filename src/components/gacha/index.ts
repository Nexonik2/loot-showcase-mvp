// src/components/gacha/index.ts

// Primary Altar & Shrine Components (Consumed by Gacha.tsx)
export { default as PackTierSelector } from './PackTierSelector';
export { default as AffiliationBiasSelector } from './AffiliationBiasSelector';
export { default as UnsealAltar } from './UnsealAltar';
export { default as BatchLootSummary } from './BatchLootSummary';
export { default as PackOpeningStage } from './PackOpeningStage';

// Stage Lifecycle Primitives (Interactive Visuals & Particles)
export { default as FoilPackFissure } from './FoilPackFissure';
export { default as UnsealParticleCanvas } from './UnsealParticleCanvas';
export { default as LootRevealGrid } from './LootRevealGrid';

// Theme Configurations
export * from './gachaTheme';