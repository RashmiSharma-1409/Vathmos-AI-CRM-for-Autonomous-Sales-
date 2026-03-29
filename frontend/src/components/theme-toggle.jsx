import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

export function ThemeToggle() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  return (
    <Button variant="secondary" size="sm" onClick={toggleTheme}>
      {theme === "dark" ? <SunMedium className="mr-2 h-4 w-4" /> : <MoonStar className="mr-2 h-4 w-4" />}
      {theme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}
