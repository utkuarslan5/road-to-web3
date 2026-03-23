#!/usr/bin/env node
import { spawn } from "node:child_process"

const [, , task] = process.argv
const weekArg = process.argv.find(arg => arg.startsWith("--week="))
const weekValue = weekArg ? weekArg.split("=")[1] : undefined

if (!task) {
  console.error("Usage: pnpm week:<dev|contracts|test> --week=<1-10>")
  process.exit(1)
}

if (!weekValue || Number.isNaN(Number(weekValue))) {
  console.error("Missing or invalid --week=<1-10>")
  process.exit(1)
}

const id = Number(weekValue)
if (id < 1 || id > 10) {
  console.error("Week must be between 1 and 10")
  process.exit(1)
}

const weekPadded = id.toString().padStart(2, "0")

let commandArgs = []
if (task === "dev") {
  commandArgs = ["--filter", "@road/web", "dev"]
} else if (task === "contracts") {
  commandArgs = ["--filter", `@road/contracts-week-${weekPadded}`, "dev"]
} else if (task === "test") {
  commandArgs = ["--filter", `@road/contracts-week-${weekPadded}`, "test"]
} else {
  console.error(`Unknown task: ${task}`)
  process.exit(1)
}

const child = spawn("pnpm", commandArgs, {
  stdio: "inherit",
  env: {
    ...process.env,
    ROAD_DEFAULT_WEEK: String(id),
    ROAD_TARGET_WEEK: String(id),
  },
})

child.on("exit", code => process.exit(code ?? 0))
