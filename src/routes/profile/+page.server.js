import { loadContent, orderedCases } from '../../../scripts/content.mjs';
import { phases } from '../../model.js';

export function load() {
  const { profile, cases } = loadContent();
  return {
    title: 'Professional summary',
    description: `${profile.data.name}: documented infrastructure projects and the lessons behind them.`,
    section: 'profile',
    studies: orderedCases(cases).map(item => ({ data: item.data, phase: phases.find(phase => phase.cases.includes(item.data.id))?.name ?? null }))
  };
}
