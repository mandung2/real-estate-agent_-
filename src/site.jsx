import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './lib/api'

// 사무소 정보(설정)와 관리자 로그인 상태를 앱 전체에서 공유합니다.
const SiteContext = createContext(null)

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({})
  const [admin, setAdmin] = useState(null) // null = 확인 중

  const reloadSettings = useCallback(() => {
    api.get('/settings').then((d) => setSettings(d.settings)).catch(() => {})
  }, [])

  const checkSession = useCallback(() => {
    return api
      .get('/auth/session')
      .then((d) => setAdmin(!!d.admin))
      .catch(() => setAdmin(false))
  }, [])

  useEffect(() => {
    reloadSettings()
    checkSession()
  }, [reloadSettings, checkSession])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {})
    setAdmin(false)
  }, [])

  return (
    <SiteContext.Provider value={{ settings, reloadSettings, admin, setAdmin, checkSession, logout }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSite = () => useContext(SiteContext)
