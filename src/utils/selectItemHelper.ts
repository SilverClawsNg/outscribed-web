import { ContentTypeDescriptions, CategoryDescriptions, CountryDescriptions,
  GeneralSortTypeDescriptions, SortTypeDescriptions, ActivityTypeDescriptions, TaleStatusDescriptions, 
  InsightStatusDescriptions, CommentStatusDescriptions, LimitedContentTypeDescriptions, FaqCategoryDescriptions
 } from '../utils/descriptors' // 🎯 Import your clean semantics
import type { ContentType, Category, Country, SortType, GeneralSortType, ActivityType,
  TaleStatus, InsightStatus, CommentStatus, LimitedContentType, FaqCategory
 } from './enumHelper' // 🎯 Import your clean semantics

interface SelectItem<T = string> {
  value: T
  label: string
}

// Transform the record into an array of SelectItem<ContentType> objects
export const ContentTypeSelectItems = (
  Object.keys(ContentTypeDescriptions) as ContentType[]
).map((key): SelectItem<ContentType> => ({
  value: key,
  label: ContentTypeDescriptions[key]
}))

// Transform the record into an array of SelectItem<ContentType> objects
export const LimitedContentTypeSelectItems = (
  Object.keys(LimitedContentTypeDescriptions) as LimitedContentType[]
).map((key): SelectItem<LimitedContentType> => ({
  value: key,
  label: LimitedContentTypeDescriptions[key]
}))

// Transform the record into an array of SelectItem<ContentType> objects
export const ActivityTypeSelectItems = (
  Object.keys(ActivityTypeDescriptions) as ActivityType[]
).map((key): SelectItem<ActivityType> => ({
  value: key,
  label: ActivityTypeDescriptions[key]
}))

// Transform the record into an array of SelectItem<ContentType> objects
export const CategorySelectItems = (
  Object.keys(CategoryDescriptions) as Category[]
).map((key): SelectItem<Category> => ({
  value: key,
  label: CategoryDescriptions[key]
}))

export const CountrySelectItems = (
  Object.keys(CountryDescriptions) as Country[]
).map((key): SelectItem<Country> => ({
  value: key,
  label: CountryDescriptions[key]
}))

export const SortTypeSelectItems = (
  Object.keys(SortTypeDescriptions) as SortType[]
).map((key): SelectItem<SortType> => ({
  value: key,
  label: SortTypeDescriptions[key]
}))

export const GeneralSortTypeSelectItems = (
  Object.keys(GeneralSortTypeDescriptions) as GeneralSortType[]
).map((key): SelectItem<GeneralSortType> => ({
  value: key,
  label: GeneralSortTypeDescriptions[key]
}))

export const TaleStatusSelectItems = (
  Object.keys(TaleStatusDescriptions) as TaleStatus[]
).map((key): SelectItem<TaleStatus> => ({
  value: key,
  label: TaleStatusDescriptions[key]
}))

export const InsightStatusSelectItems = (
  Object.keys(InsightStatusDescriptions) as InsightStatus[]
).map((key): SelectItem<InsightStatus> => ({
  value: key,
  label: InsightStatusDescriptions[key]
}))

export const CommentStatusSelectItems = (
  Object.keys(CommentStatusDescriptions) as CommentStatus[]
).map((key): SelectItem<CommentStatus> => ({
  value: key,
  label: CommentStatusDescriptions[key]
}))

export const FaqCategorySelectItems = (
  Object.keys(FaqCategoryDescriptions) as FaqCategory[]
).map((key): SelectItem<FaqCategory> => ({
  value: key,
  label: FaqCategoryDescriptions[key]
}))
