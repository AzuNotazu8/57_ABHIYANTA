/**
 * Rule-based mitigation suggestion engine.
 * NOT an LLM — pure deterministic logic from simulation indices.
 */

export function getMitigations(data) {
  if (!data) return []

  const suggestions = []
  const flood = data.flood_risk ?? 0
  const tiger = data.tiger_migration_probability ?? 0
  const prey = data.prey_migration_probability ?? 0
  const zoonotic = data.zoonotic_risk_index ?? 0
  const glacier = data.glacier_amplification ?? 0
  const preyStress = data.prey_stress_index ?? 0
  const isProjection = data.is_projection ?? false

  /* ── FLOOD RISK ── */
  if (flood >= 75) {
    suggestions.push({
      severity: 'critical',
      category: 'Flood Management',
      icon: '🌊',
      title: 'Critical flood threshold exceeded',
      actions: [
        'Activate emergency embankment reinforcement along tidal channels',
        'Relocate low-lying village populations to pre-designated safe zones',
        'Deploy mobile flood barriers at delta entry points',
        'Accelerate mangrove reforestation to absorb storm surge energy',
      ],
    })
  } else if (flood >= 50) {
    suggestions.push({
      severity: 'high',
      category: 'Flood Management',
      icon: '🌊',
      title: 'Elevated flood risk — early intervention needed',
      actions: [
        'Construct raised earthen embankments along river deltas',
        'Establish inland ecological buffer zones covering 20km radius',
        'Restore degraded mangrove marshland to reduce salinity intrusion',
      ],
    })
  } else if (flood >= 25) {
    suggestions.push({
      severity: 'moderate',
      category: 'Flood Management',
      icon: '🌊',
      title: 'Moderate flood risk — monitoring advised',
      actions: [
        'Install early-warning water level sensors at delta mouths',
        'Begin mangrove nursery programs for long-term coastal resilience',
      ],
    })
  }

  /* ── TIGER MIGRATION ── */
  if (tiger >= 65) {
    suggestions.push({
      severity: 'critical',
      category: 'Tiger Conservation',
      icon: '🐅',
      title: 'Major Bengal tiger displacement underway',
      actions: [
        'Deploy smart perimeter fencing with AI camera traps along forest edge',
        'Establish emergency wildlife corridors connecting fragmented habitat patches',
        'Activate community conflict-mitigation rapid response teams in villages',
        'Create temporary refuge zones with supplementary prey in protected areas',
      ],
    })
  } else if (tiger >= 35) {
    suggestions.push({
      severity: 'high',
      category: 'Tiger Conservation',
      icon: '🐅',
      title: 'Tiger population shifting inland — action required',
      actions: [
        'Expand protected habitat corridors northward by minimum 15km',
        'Install non-lethal deterrent lighting in human settlement boundaries',
        'Fund community-based tiger guardianship programs in buffer villages',
      ],
    })
  } else if (tiger >= 15) {
    suggestions.push({
      severity: 'moderate',
      category: 'Tiger Conservation',
      icon: '🐅',
      title: 'Early signs of tiger territory shift',
      actions: [
        'Increase camera trap density in core migration corridors',
        'Survey habitat quality of adjacent forest areas for future refuge capacity',
      ],
    })
  }

  /* ── PREY / ECOSYSTEM ── */
  if (prey >= 60) {
    suggestions.push({
      severity: 'high',
      category: 'Ecosystem Balance',
      icon: '🦌',
      title: 'Prey species mass displacement — ecosystem destabilising',
      actions: [
        'Restore inland grassland and secondary forest for displaced ungulate populations',
        'Implement controlled habitat corridors to allow safe prey movement',
        'Reduce poaching pressure through ranger deployment in displacement zones',
      ],
    })
  } else if (preyStress >= 55) {
    suggestions.push({
      severity: 'moderate',
      category: 'Ecosystem Balance',
      icon: '🌿',
      title: 'High prey habitat stress — vegetation degrading',
      actions: [
        'Implement freshwater supplementation at key inland grazing areas',
        'Control invasive salt-tolerant species replacing native vegetation',
        'Establish community-managed eco-buffers around core forest areas',
      ],
    })
  }

  /* ── ZOONOTIC RISK ── */
  if (zoonotic >= 65) {
    suggestions.push({
      severity: 'critical',
      category: 'Public Health',
      icon: '⚕️',
      title: 'High human-wildlife interface exposure risk',
      actions: [
        'Deploy rapid-response veterinary surveillance teams to forest-edge communities',
        'Increase wildlife health monitoring for pathogen spillover indicators',
        'Establish sanitation and hand-hygiene infrastructure in conflict zones',
        'Train village health workers in zoonotic exposure recognition protocols',
      ],
    })
  } else if (zoonotic >= 40) {
    suggestions.push({
      severity: 'high',
      category: 'Public Health',
      icon: '⚕️',
      title: 'Elevated human-wildlife contact exposure',
      actions: [
        'Increase wildlife health surveillance in forest-adjacent settlements',
        'Educate communities on reducing direct animal contact during flood events',
      ],
    })
  }

  /* ── GLACIER MELT ── */
  if (glacier >= 60) {
    suggestions.push({
      severity: 'high',
      category: 'Climate Upstream',
      icon: '🧊',
      title: 'Accelerated glacier melt amplifying downstream risk',
      actions: [
        'Advocate for upstream watershed conservation in Himalayan headwaters',
        'Model and plan for sea-level rise exceeding current delta infrastructure limits',
        'Engage with national climate adaptation policy for long-term delta management',
      ],
    })
  }

  /* ── PROJECTION-SPECIFIC NOTE ── */
  if (isProjection && (flood > 60 || tiger > 50)) {
    suggestions.push({
      severity: 'info',
      category: 'Projection Note',
      icon: '📈',
      title: 'This is a future projection year',
      actions: [
        'Interventions taken now (2024 and earlier) can materially reduce these projected values',
        'Each 10% reduction in flood risk today correlates with delayed onset of animal displacement',
        'Policy action window is most effective before 2027 based on cascade model trajectory',
      ],
    })
  }

  /* ── POSITIVE CASE ── */
  if (suggestions.length === 0) {
    suggestions.push({
      severity: 'low',
      category: 'System Status',
      icon: '✅',
      title: 'All indices within manageable range',
      actions: [
        'Continue routine wildlife monitoring and habitat quality surveys',
        'Maintain existing mangrove conservation programs',
        'Monitor seasonal rainfall and upstream glacier reports for early warning',
      ],
    })
  }

  return suggestions
}

export const SEVERITY_META = {
  critical: { color: '#a84030', bg: 'rgba(168,64,48,0.12)', border: 'rgba(168,64,48,0.3)', label: 'Critical' },
  high:     { color: '#c47a2a', bg: 'rgba(196,122,42,0.12)', border: 'rgba(196,122,42,0.3)', label: 'High' },
  moderate: { color: '#7aac54', bg: 'rgba(122,172,84,0.12)', border: 'rgba(122,172,84,0.3)', label: 'Moderate' },
  low:      { color: '#5a8a6a', bg: 'rgba(90,138,106,0.1)',  border: 'rgba(90,138,106,0.25)', label: 'Low' },
  info:     { color: '#8bbcce', bg: 'rgba(139,188,206,0.1)', border: 'rgba(139,188,206,0.25)', label: 'Info' },
}
