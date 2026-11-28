import { computed } from 'vue'
import useCasesJson from '@/features/support/data/useCases.json'

export interface UseCaseDto {
  id: number
  slug: string
  title: string
  avatar?: string
  situation: string
  approach: string
  whyItWorks: string
}

const HOMEPAGE_USE_CASE_IDS = [5, 1, 2] as const

export function useUseCases() {
  const allUseCases = useCasesJson as UseCaseDto[]

  const featuredUseCases = computed(() =>
    HOMEPAGE_USE_CASE_IDS
      .map((id) => allUseCases.find((item) => item.id === id))
      .filter((item): item is UseCaseDto => Boolean(item))
  )

  const resolveAvatarUrl = (filename?: string) => {
    if (!filename) return ''
    return new URL(`../assets/images/avatars/${filename}`, import.meta.url).href
  }

  return {
    allUseCases,
    featuredUseCases,
    resolveAvatarUrl,
  }
}