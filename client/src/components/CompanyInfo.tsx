import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Building2Icon, 
  BriefcaseIcon, 
  MapPinIcon, 
  UsersIcon, 
  TagIcon, 
  CalendarIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type CompanyDetails = {
  description?: string;
  sector?: string;
  industry?: string;
  employees?: number | string;
  founded?: number | string;
  ceo?: string;
  headquarters?: string;
  website?: string;
};

type CompanyInfoProps = {
  symbol: string;
  companyInfo: CompanyDetails | null;
  isLoading: boolean;
};

export function CompanyInfo({ symbol, companyInfo, isLoading }: CompanyInfoProps) {
  if (isLoading) {
    return (
      <Card className="mb-6 shadow-card border border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Building2Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium">Company Overview</CardTitle>
          </div>
          <CardDescription>Corporate information and business details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded-md"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted rounded-md"></div>
              <div className="h-10 bg-muted rounded-md"></div>
              <div className="h-10 bg-muted rounded-md"></div>
              <div className="h-10 bg-muted rounded-md"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!companyInfo || typeof companyInfo !== 'object') {
    return (
      <Card className="mb-6 shadow-card border border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Building2Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium">Company Overview</CardTitle>
          </div>
          <CardDescription>Corporate information and business details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Building2Icon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No company information available for {symbol}
            </p>
          </div>
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
    headquarters = "N/A",
    website
  } = companyInfo;

  return (
    <Card className="mb-6 shadow-card border border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium">Company Overview</CardTitle>
          </div>
          {sector !== "N/A" && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {sector}
            </Badge>
          )}
        </div>
        <CardDescription>Corporate information and business details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm leading-relaxed text-foreground/90 bg-secondary/20 p-3 rounded-md border border-border/30 max-h-40 overflow-y-auto">
            {description}
          </div>

          <Separator className="my-3" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start">
              <TagIcon className="h-4 w-4 mt-0.5 mr-2 text-primary/70" />
              <div>
                <div className="text-muted-foreground font-medium mb-1">Industry</div>
                <div>{industry}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <UsersIcon className="h-4 w-4 mt-0.5 mr-2 text-primary/70" />
              <div>
                <div className="text-muted-foreground font-medium mb-1">Employees</div>
                <div>{employees}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <CalendarIcon className="h-4 w-4 mt-0.5 mr-2 text-primary/70" />
              <div>
                <div className="text-muted-foreground font-medium mb-1">Founded</div>
                <div>{founded}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <BriefcaseIcon className="h-4 w-4 mt-0.5 mr-2 text-primary/70" />
              <div>
                <div className="text-muted-foreground font-medium mb-1">CEO</div>
                <div className="font-medium">{ceo}</div>
              </div>
            </div>
            
            <div className="flex items-start md:col-span-2">
              <MapPinIcon className="h-4 w-4 mt-0.5 mr-2 text-primary/70" />
              <div>
                <div className="text-muted-foreground font-medium mb-1">Headquarters</div>
                <div>{headquarters}</div>
              </div>
            </div>
            
            {website && website !== "N/A" && (
              <div className="md:col-span-2">
                <a 
                  href={website.startsWith('http') ? website : `https://${website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center text-sm"
                >
                  Visit corporate website
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
