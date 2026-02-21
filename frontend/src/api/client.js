const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

async function post(path, body = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json()
}

export const api = {
  runAll: (scenario = 'baseline') =>
    post(`/analysis/run-all?scenario=${scenario}`),

  getTimeline: () => get('/analysis/timeline'),

  getProjections: () => get('/analysis/project/results'),

  getValidation: () => get('/analysis/validate'),

  getClimate: () => get('/climate/'),

  runSimulation: (year_start = 2014, year_end = 2023, scenario = 'baseline') =>
    post('/simulation/run', { year_start, year_end, scenario }),

  runProjection: (scenario = 'baseline') =>
    post(`/analysis/project?scenario=${scenario}`),
}
