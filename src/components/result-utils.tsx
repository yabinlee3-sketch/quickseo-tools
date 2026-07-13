import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

type StatusType = 'good' | 'warning' | 'bad' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { icon: React.ReactNode; className: string }> = {
  good: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: 'bg-green-100 text-green-700 border-green-200' },
  warning: { icon: <AlertTriangle className="h-3.5 w-3.5" />, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  bad: { icon: <XCircle className="h-3.5 w-3.5" />, className: 'bg-red-100 text-red-700 border-red-200' },
  info: { icon: null, className: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const text = label || status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      {config.icon}
      {text}
    </Badge>
  );
}

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  status?: StatusType;
}

export function ResultCard({ title, children, status }: ResultCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {title}
          {status && <StatusBadge status={status} />}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface IssueListProps {
  issues: string[];
  warnings: string[];
}

export function IssueList({ issues, warnings }: IssueListProps) {
  if (issues.length === 0 && warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {issues.map((issue, i) => (
        <div key={`i-${i}`} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-md p-3">
          <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{issue}</span>
        </div>
      ))}
      {warnings.map((warning, i) => (
        <div key={`w-${i}`} className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 rounded-md p-3">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{warning}</span>
        </div>
      ))}
    </div>
  );
}
