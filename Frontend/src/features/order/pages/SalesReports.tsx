import { Download, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { salesData, topProducts } from "@/utils/mockData";

export function SalesReports() {
  const categoryData = [
    { name: "Running", value: 35 },
    { name: "Basketball", value: 25 },
    { name: "Lifestyle", value: 20 },
    { name: "Training", value: 20 },
  ];

  const COLORS = ["#000000", "#4B5563", "#9CA3AF", "#D1D5DB"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Sales Reports & Analytics</h1>
          <p className="text-gray-600">Insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold mb-1">Rs 108,500</p>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12.5% from last period
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Total Orders</p>
            <ShoppingBag className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold mb-1">395</p>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +8.2% from last period
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Average Order Value</p>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold mb-1">Rs 274.68</p>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +3.8% from last period
          </div>
        </Card>
      </div>

      {/* Sales Over Time */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6">Sales Trend (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#000"
              strokeWidth={2}
              name="Sales (Rs)"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#9CA3AF"
              strokeWidth={2}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6">Top 5 Products by Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sales by Category */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Sales Table */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6">Monthly Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Month</th>
                <th className="text-left py-3 px-4">Total Sales</th>
                <th className="text-left py-3 px-4">Orders</th>
                <th className="text-left py-3 px-4">Avg Order Value</th>
                <th className="text-left py-3 px-4">Growth</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((data, index) => {
                const prevSales = index > 0 ? salesData[index - 1].sales : data.sales;
                const growth = ((data.sales - prevSales) / prevSales) * 100;

                return (
                  <tr key={data.month} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{data.month} 2024</td>
                    <td className="py-3 px-4">Rs {data.sales.toLocaleString()}</td>
                    <td className="py-3 px-4">{data.orders}</td>
                    <td className="py-3 px-4">
                      Rs {(data.sales / data.orders).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          growth >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {growth >= 0 ? "+" : ""}
                        {index === 0 ? "0" : growth.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
