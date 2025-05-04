import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const MetricsOverviewSection = (): JSX.Element => {
  // Data for metrics cards
  const topRowMetrics = [
    { title: "Total Apostado", value: "R$ 50.000,00" },
    { title: "Total Ganho", value: "R$ 55.000,00" },
    { title: "Lucro/Prejuízo Total", value: "R$ 5.000,00" },
    { title: "Lucro Ativações", value: "R$ 3.000,00" },
  ];

  const bottomRowMetrics = [
    { title: "Comissão Total (10%)", value: "R$ 300,00" },
    { title: "ROI", value: "10,00%" },
  ];

  return (
    <section className="w-full py-4">
      <div className="grid grid-cols-4 gap-5 mb-5">
        {topRowMetrics.map((metric, index) => (
          <Card key={index} className="border rounded-lg">
            <CardContent className="p-5">
              <div className="flex flex-col gap-2">
                <div className="font-bold text-sm text-gray-500 font-['Inter',Helvetica]">
                  {metric.title}
                </div>
                <div className="font-normal text-lg text-gray-900 font-['Inter',Helvetica]">
                  {metric.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {bottomRowMetrics.map((metric, index) => (
          <Card key={index} className="border rounded-lg">
            <CardContent className="p-5">
              <div className="flex flex-col gap-2">
                <div className="font-bold text-sm text-gray-500 font-['Inter',Helvetica]">
                  {metric.title}
                </div>
                <div className="font-normal text-lg text-gray-900 font-['Inter',Helvetica]">
                  {metric.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
