import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon, MenuIcon, BellIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type HeaderProps = {
  toggleSidebar: () => void;
};

export function Header({ toggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 bg-card z-20 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-4"
            aria-label="Toggle sidebar"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">
            StockInsight<span className="text-primary">.</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <BellIcon className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8 bg-primary text-white">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
