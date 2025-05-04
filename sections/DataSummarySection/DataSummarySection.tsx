import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const DataSummarySection = (): JSX.Element => {
  // Data for summary cards
  const summaryData = [
    {
      title: "Total Apostado (50 CPFs)",
      value: "R$ 2.500.000,00",
    },
    {
      title: "Total Ganho (50 CPFs)",
      value: "R$ 2.750.000,00",
    },
    {
      title: "Lucro/Prejuízo Total",
      value: "R$ 250.000,00",
    },
    {
      title: "Lucro Ativações",
      value: "R$ 150.000,00",
    },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-4 gap-5">
        {summaryData.map((item, index) => (
          <Card key={index} className="border rounded-lg">
            <CardContent className="p-5 space-y-2">
              <div className="w-full">
                <p className="font-bold text-sm text-gray-500 font-['Inter',Helvetica]">
                  {item.title}
                </p>
              </div>
              <div className="w-full">
                <p className="font-normal text-lg text-gray-900 font-['Inter',Helvetica]">
                  {item.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border rounded-lg w-full">
        <CardContent className="p-5 space-y-2">
          <div className="w-full">
            <p className="font-bold text-sm text-gray-500 font-['Inter',Helvetica]">
              Comissão Total a Pagar (10%)
            </p>
          </div>
          <div className="w-full">
            <p className="font-normal text-lg text-gray-900 font-['Inter',Helvetica]">
              R$ 15.000,00
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
