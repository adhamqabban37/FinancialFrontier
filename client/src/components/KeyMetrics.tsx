import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full animate-pulse flex flex-col space-y-2">
            <div className="h-8 bg-muted rounded w-full"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base font-medium">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Sector Avg</TableHead>
                <TableHead className="text-right">Assessment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono">
              {metricsToDisplay.map((metric, index) => (
                <TableRow key={index} className="hover:bg-secondary/50">
                  <TableCell>{metric.name}</TableCell>
                  <TableCell className="text-right">{metric.value}</TableCell>
                  <TableCell className="text-right">{metric.sectorAvg || "-"}</TableCell>
                  <TableCell className={`text-right ${getAssessmentColor(metric.assessment)}`}>
                    {metric.assessment || "-"}
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
