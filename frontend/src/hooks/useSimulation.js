import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export function useSimulation() {
  const [timeline, setTimeline] = useState([])
  const [validation, setValidation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const [tl, val] = await Promise.all([
        api.getTimeline(),
        api.getValidation(),
      ])
      setTimeline(tl)
      setValidation(val)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await loadData()
      setLoading(false)
    }
    init()
  }, [loadData])

  const runAll = useCallback(async (scenario = 'baseline') => {
    setRunning(true)
    try {
      await api.runAll(scenario)
      await loadData()
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }, [loadData])

  const historical = timeline.filter(r => !r.is_projection)
  const projections = timeline.filter(r => r.is_projection)

  return { timeline, historical, projections, validation, loading, running, error, runAll }
}
