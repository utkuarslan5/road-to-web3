import { defineConfig } from "@lapidist/design-lint"

const buttonVariants = [
  "default",
  "arcade",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
  "week1",
  "week2",
  "week3",
  "week4",
]

const badgeVariants = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "success",
  "week1",
  "week2",
  "week3",
  "week4",
  "player1",
  "level",
  "score",
]

const cardVariants = [
  "default",
  "arcade",
  "score",
  "week1",
  "week2",
  "week3",
  "week4",
  "ghost",
  "glass",
]

const fieldVariants = ["default", "week1", "week2", "week3", "week4"]

export default defineConfig({
  rules: {
    "design-system/import-path": [
      "error",
      {
        packages: ["@road/shared"],
        components: [
          "AppShell",
          "Badge",
          "Button",
          "Card",
          "CardContent",
          "CardDescription",
          "CardFooter",
          "CardHeader",
          "CardTitle",
          "Input",
          "Label",
          "Textarea",
          "Tabs",
          "TabsContent",
          "TabsList",
          "TabsTrigger",
          "Toaster",
        ],
      },
    ],
    "design-system/variant-prop": [
      "error",
      {
        components: {
          Badge: badgeVariants,
          Button: buttonVariants,
          Card: cardVariants,
          Input: fieldVariants,
          Label: ["default", "eyebrow"],
          Textarea: fieldVariants,
        },
      },
    ],
    "design-system/no-inline-styles": [
      "error",
      {
        importOrigins: ["@road/shared"],
        ignoreClassName: true,
      },
    ],
  },
})
