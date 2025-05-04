import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { 
  SunIcon, 
  MoonIcon, 
  MenuIcon, 
  BellIcon, 
  TrendingUpIcon, 
  SearchIcon
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type HeaderProps = {
  toggleSidebar: () => void;
};

export function Header({ toggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 bg-card z-20 border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2 md:mr-4 hover:bg-secondary"
            aria-label="Toggle sidebar"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center">
            <TrendingUpIcon className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl font-bold">
              StockInsight<span className="text-primary">.</span>
            </h1>
          </div>
          <div className="md:hidden flex items-center">
            <TrendingUpIcon className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="hidden md:flex relative mx-4 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <input 
            type="search" 
            placeholder="Search for stocks..."
            className="w-full py-2 pl-10 pr-4 bg-secondary/50 rounded-full text-sm border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-secondary"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-secondary relative" aria-label="Notifications">
                  <BellIcon className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]">
                    3
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Avatar className="h-8 w-8 bg-primary/90 text-primary-foreground hover:bg-primary transition-colors cursor-pointer">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
