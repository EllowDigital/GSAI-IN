import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, LayoutDashboard, BookOpen, Newspaper, Image, BadgeDollarSign } from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$25,678",
    icon: DollarSign,
    description: "From all courses and programs",
  },
  {
    title: "Active Students",
    value: "124",
    icon: Users,
    description: "Currently enrolled",
  },
  {
    title: "Total Courses",
    value: "8",
    icon: BookOpen,
    description: "Different programs offered",
  },
  {
    title: "Latest News",
    value: "3",
    icon: Newspaper,
    description: "News items published",
  },
  {
    title: "Gallery Images",
    value: "45",
    icon: Image,
    description: "Images in the gallery",
  },
];

export default function StatsHome() {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center gap-3 text-yellow-400">
        <LayoutDashboard className="w-8 h-8" />
        Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((item, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {item.icon && <item.icon className="w-4 h-4 text-muted-foreground" />}
                {item.title}
              </CardTitle>
              {/* <MoreHorizontal className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-4">
        <a
          href="/admin/dashboard/fees"
          className="inline-flex items-center gap-2 border border-yellow-400 px-4 py-2 rounded-full bg-yellow-50 text-yellow-700 font-semibold hover:bg-yellow-200 transition"
        >
          <BadgeDollarSign className="w-5 h-5" />
          Fees Manager
        </a>
      </div>
    </div>
  );
}
