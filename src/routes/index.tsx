import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/calculator/Calculator";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "LuminaCalc — A premium calculator" },
      { name: "description", content: "LuminaCalc is a beautiful, modern calculator with glassmorphism, history, keyboard support, and dark/light themes." },
    ],
  }),
});

function Index() {
  return <Calculator />;
}
