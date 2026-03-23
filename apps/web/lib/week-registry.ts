import { ROAD_TO_WEB3_ROADMAP, type WeekId, type WeekModule } from "@road/config"
import { week01Module } from "@road/week-01"
import { week02Module } from "@road/week-02"
import { week03Module } from "@road/week-03"
import { week04Module } from "@road/week-04"
import { week05Module } from "@road/week-05"
import { week06Module } from "@road/week-06"
import { week07Module } from "@road/week-07"
import { week08Module } from "@road/week-08"
import { week09Module } from "@road/week-09"
import { week10Module } from "@road/week-10"

const WEEK_MODULES: WeekModule[] = [
  week01Module,
  week02Module,
  week03Module,
  week04Module,
  week05Module,
  week06Module,
  week07Module,
  week08Module,
  week09Module,
  week10Module,
]

const WEEK_MODULES_BY_ID = new Map<WeekId, WeekModule>(
  WEEK_MODULES.map(module => [module.id, module])
)

export function getWeekModule(id: number): WeekModule | undefined {
  return WEEK_MODULES_BY_ID.get(id as WeekId)
}

export function getWeekModules(): WeekModule[] {
  return WEEK_MODULES
}

export const WEEK_CATALOG = ROAD_TO_WEB3_ROADMAP.map(item => ({
  ...item,
  module: WEEK_MODULES_BY_ID.get(item.id as WeekId),
}))
