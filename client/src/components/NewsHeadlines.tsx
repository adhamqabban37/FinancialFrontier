import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type NewsItem = {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source?: string;
};

type NewsHeadlinesProps = {
  symbol: string;
  news: NewsItem[] | null;
  isLoading: boolean;
};

export function NewsHeadlines({ symbol, news, isLoading }: NewsHeadlinesProps) {
  // Format relative time (e.g., "2h ago")
  const formatRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-border pb-3">
                <div className="flex justify-between mb-1">
                  <div className="h-5 w-48 bg-muted rounded"></div>
                  <div className="h-4 w-12 bg-muted rounded"></div>
                </div>
                <div className="h-12 bg-muted rounded mt-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no news or empty array, show empty state
  if (!news || !Array.isArray(news) || news.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent News</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No recent news available for {symbol}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Open news link in new tab
  const openNewsLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Make sure we have the expected structure for news items
  const validNewsItems = news.filter(item => item.title && item.url).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Recent News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validNewsItems.map((item, index) => (
            <div key={index} className={`${index < validNewsItems.length - 1 ? "border-b border-border pb-3" : ""}`}>
              <div className="flex justify-between mb-1">
                <h4 className="font-medium cursor-pointer hover:text-primary transition-colors" 
                  onClick={() => openNewsLink(item.url)}>
                  {item.title}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(item.publishedAt)}
                </span>
              </div>
              <p className="text-sm text-foreground/80">
                {item.summary || "No summary available"}
              </p>
            </div>
          ))}
          {validNewsItems.length === 0 && (
            <p className="text-muted-foreground">No recent news available for {symbol}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="link" className="text-primary w-full" 
          onClick={() => validNewsItems[0]?.url && openNewsLink(validNewsItems[0].url)}>
          View All News
        </Button>
      </CardFooter>
    </Card>
  );
}
