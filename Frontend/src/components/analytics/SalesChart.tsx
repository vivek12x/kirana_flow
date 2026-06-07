"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/useStore";

export function SalesChart() {
    const { sales } = useStore();

    // Take last 7 items
    const data = sales.slice(-7);

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Sales & Profit Overview</CardTitle>
                <CardDescription>
                    Revenue analysis for the past week.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="sales" name="Total Sales" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="profit" name="Net Profit" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
