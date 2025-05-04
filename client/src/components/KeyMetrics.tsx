import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { BarChart2Icon, TrendingUpIcon, TrendingDownIcon, AlertCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Metric = {
  name: string;
  value: string | number;
  sectorAvg?: string | number;
  assessment?: string;
  assessmentColor?: string;
};

type KeyMetricsProps = {
  metrics: Metric[] | null;
  isLoading: boolean;
};

export function KeyMetrics({ metrics, isLoading }: KeyMetricsProps) {
  if (isLoading) {
    return (
      <Card className="mb-6 shadow-card border border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart2Icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-medium">Key Metrics</CardTitle>
            </div>
          </div>
          <CardDescription>Financial indicators and sector comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full animate-pulse flex flex-col space-y-3">
            <div className="h-8 bg-muted rounded-md w-full"></div>
            <div className="h-8 bg-muted rounded-md w-full"></div>
            <div className="h-8 bg-muted rounded-md w-full"></div>
            <div className="h-8 bg-muted rounded-md w-full"></div>
            <div className="h-8 bg-muted rounded-md w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default metrics if none are provided
  const defaultMetrics: Metric[] = [
    { 
      name: "Market Cap", 
      value: "N/A", 
      sectorAvg: "N/A", 
      assessment: "N/A" 
    },
    { 
      name: "P/E Ratio", 
      value: "N/A", 
      sectorAvg: "N/A", 
      assessment: "N/A" 
    },
    { 
      name: "EPS (TTM)", 
      value: "N/A", 
      sectorAvg: "N/A", 
      assessment: "N/A" 
    },
    { 
      name: "Dividend Yield", 
      value: "N/A", 
      sectorAvg: "N/A", 
      assessment: "N/A" 
    },
    { 
      name: "52W High", 
      value: "N/A", 
      assessment: "N/A" 
    },
    { 
      name: "52W Low", 
      value: "N/A", 
      assessment: "N/A" 
    },
    { 
      name: "Volume (Avg)", 
      value: "N/A", 
      sectorAvg: "N/A", 
      assessment: "N/A" 
    }
  ];

  // Make sure metrics is an array
  const metricsToDisplay = Array.isArray(metrics) ? metrics : defaultMetrics;

  const getAssessmentColor = (assessment: string | undefined): string => {
    if (!assessment) return "text-muted-foreground";
    
    if (assessment.includes("Strong") || assessment.includes("+")) {
      return "text-profit";
    } else if (assessment.includes("High") && !assessment.includes("Low")) {
      return "text-profit";
    } else if (assessment.includes("Low") && !assessment.includes("High")) {
      return "text-muted-foreground";
    } else if (assessment.includes("-")) {
      return "text-loss";
    }
    
    return "text-muted-foreground";
  };

  const getAssessmentBadge = (assessment: string | undefined) => {
    if (!assessment || assessment === "N/A") return null;

    if (assessment.includes("Strong") || assessment === "High") {
      return (
        <Badge variant="outline" className="ml-2 bg-profit/10 text-profit border-profit/20">
          <TrendingUpIcon className="h-3 w-3 mr-1" />
          {assessment}
        </Badge>
      );
    } else if (assessment.includes("+")) {
      // For percentage increases
      return (
        <Badge variant="outline" className="ml-2 bg-profit/10 text-profit border-profit/20">
          {assessment}
        </Badge>
      );
    } else if (assessment.includes("-")) {
      // For percentage decreases
      return (
        <Badge variant="outline" className="ml-2 bg-loss/10 text-loss border-loss/20">
          {assessment}
        </Badge>
      );
    } else if (assessment === "Low") {
      return (
        <Badge variant="outline" className="ml-2 bg-loss/10 text-loss border-loss/20">
          <TrendingDownIcon className="h-3 w-3 mr-1" />
          {assessment}
        </Badge>
      );
    } else if (assessment === "Moderate" || assessment === "Normal") {
      return (
        <Badge variant="outline" className="ml-2 bg-muted text-muted-foreground">
          {assessment}
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <Card className="mb-6 shadow-card border border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart2Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium">Key Metrics</CardTitle>
          </div>
        </div>
        <CardDescription>Financial indicators and sector comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 hover:bg-transparent">
                <TableHead className="w-[25%] text-muted-foreground">Metric</TableHead>
                <TableHead className="text-right text-muted-foreground">Value</TableHead>
                <TableHead className="text-right text-muted-foreground">Sector Avg</TableHead>
                <TableHead className="text-right text-muted-foreground">Assessment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-sm">
              {metricsToDisplay.map((metric, index) => (
                <TableRow 
                  key={index} 
                  className={`border-b border-border/40 hover:bg-secondary/30 transition-colors ${
                    index % 2 === 0 ? 'bg-secondary/10' : ''
                  }`}
                >
                  <TableCell className="font-medium">{metric.name}</TableCell>
                  <TableCell className="text-right font-medium">{metric.value}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{metric.sectorAvg || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {getAssessmentBadge(metric.assessment) || 
                        <span className="text-muted-foreground">{metric.assessment || "-"}</span>
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
