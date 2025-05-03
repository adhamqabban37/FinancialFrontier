import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";

type CompanyDetails = {
  description?: string;
  sector?: string;
  industry?: string;
  employees?: number | string;
  founded?: number | string;
  ceo?: string;
  headquarters?: string;
};

type CompanyInfoProps = {
  symbol: string;
  companyInfo: CompanyDetails | null;
  isLoading: boolean;
};

export function CompanyInfo({ symbol, companyInfo, isLoading }: CompanyInfoProps) {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!companyInfo || typeof companyInfo !== 'object') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No company information available for {symbol}
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    description = "No description available",
    sector = "N/A",
    industry = "N/A",
    employees = "N/A",
    founded = "N/A",
    ceo = "N/A",
    headquarters = "N/A"
  } = companyInfo;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base font-medium">Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Sector</div>
              <div>{sector}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Industry</div>
              <div>{industry}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Employees</div>
              <div>{employees}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Founded</div>
              <div>{founded}</div>
            </div>
            <div>
              <div className="text-muted-foreground">CEO</div>
              <div>{ceo}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Headquarters</div>
              <div>{headquarters}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
