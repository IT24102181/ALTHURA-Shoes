import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
}: DashboardCardProps) {
  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1 tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center space-x-1 mt-1">
              <span className={`text-sm font-semibold ${changeColors[changeType]}`}>
                {change}
              </span>
              <span className="text-sm text-gray-400">from last month</span>
            </div>
          )}
        </div>
        <div className="bg-gray-100 p-3 rounded-xl ml-4">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
      </div>
    </Card>
  );
}