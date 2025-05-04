import React from "react";
import { Card, CardContent } from "../../../components/ui/card";

export const RevenueProjectionSection = (): JSX.Element => {
  // Data for the revenue projection cards
  const revenueData = [
    {
      title: "Lucro Acumulado (Ano)",
      value: "R$ 5.000,00",
    },
    {
      title: "Limite Isenção IR (R$ 33.888,00)",
      value: "R$ 28.888,00 Restantes",
    },
    {
      title: "Projeção de Lucro (Final do Ano)",
      value: "R$ 15.000,00",
    },
  ];

  return (
    <div className="flex flex-wrap w-full items-start justify-center gap-5">
      {revenueData.map((item, index) => (
        <Card key={index} className="flex-1 min-w-[242px]">
          <CardContent className="p-5">
            <div className="flex flex-col gap-2">
              <div className="font-bold text-sm text-gray-500">
                {item.title}
              </div>
              <div className="font-normal text-lg text-gray-900">
                {item.value}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
