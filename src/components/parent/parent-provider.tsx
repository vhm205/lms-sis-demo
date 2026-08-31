'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface StudentProfile {
  id: string
  code: string
  name: string
  dob?: string | null
  phone?: string | null
  facility?: {
    id: string
    name: string
    address?: string
  }
  classes: Array<{
    id: string
    code: string
    name: string
    course: {
      id: string
      name: string
      code: string
      fee?: number | null
      duration: number
    }
    teacher?: {
      id: string
      name: string
    } | null
  }>
}

export interface ParentProfile {
  id: string
  name: string
  phone: string
  email?: string | null
  notes?: string | null
}

interface ParentContextType {
  parent: ParentProfile | null
  students: StudentProfile[]
  selectedStudent: StudentProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  setSelectedStudentId: (studentId: string) => void
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
}

const ParentContext = createContext<ParentContextType | undefined>(undefined)

export function ParentProvider({ children }: { children: React.ReactNode }) {
  const [parent, setParent] = useState<ParentProfile | null>(null)
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [selectedStudentId, setSelectedStudentIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/parent/auth/me', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include'
      })

      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.parent) {
          setParent(json.data.parent)
          const fetchedStudents: StudentProfile[] = json.data.students || []
          setStudents(fetchedStudents)
          
          // Select first student or restore stored studentId
          const savedStudentId = typeof window !== 'undefined' ? localStorage.getItem('parent_active_student_id') : null
          const found = fetchedStudents.find(s => s.id === savedStudentId)
          if (found) {
            setSelectedStudentIdState(found.id)
          } else if (fetchedStudents.length > 0) {
            setSelectedStudentIdState(fetchedStudents[0].id)
            if (typeof window !== 'undefined') {
              localStorage.setItem('parent_active_student_id', fetchedStudents[0].id)
            }
          }
          setIsLoading(false)
          return
        }
      }

      // If not authenticated and not on login page, redirect to login
      setParent(null)
      setStudents([])
      setSelectedStudentIdState(null)
      if (pathname && !pathname.includes('/parent/login')) {
        router.push('/parent/login')
      }
    } catch (err) {
      console.error('[ParentProvider] Failed to fetch session:', err)
      setParent(null)
      if (pathname && !pathname.includes('/parent/login')) {
        router.push('/parent/login')
      }
    } finally {
      setIsLoading(false)
    }
  }, [pathname, router])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  const setSelectedStudentId = (id: string) => {
    setSelectedStudentIdState(id)
    if (typeof window !== 'undefined') {
      localStorage.setItem('parent_active_student_id', id)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/parent/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // noop
    }
    setParent(null)
    setStudents([])
    setSelectedStudentIdState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('parent_active_student_id')
    }
    router.push('/parent/login')
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || (students.length > 0 ? students[0] : null)

  return (
    <ParentContext.Provider
      value={{
        parent,
        students,
        selectedStudent,
        isLoading,
        isAuthenticated: !!parent,
        setSelectedStudentId,
        refreshProfile,
        logout
      }}
    >
      {children}
    </ParentContext.Provider>
  )
}

export function useParent() {
  const context = useContext(ParentContext)
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider')
  }
  return context
}
