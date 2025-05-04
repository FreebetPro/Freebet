import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const ActionItemsSection = (): JSX.Element => {
  // Financial data for the cards
  const financialData = [
    {
      title: "Lucro Acumulado (Ano)",
      value: "R$ 250.000,00",
    },
    {
      title: "Limite Isenção IR (R$ 1.694.400,00)",
      value: "R$ 1.444.400,00 Restantes",
    },
    {
      title: "Projeção de Lucro (Final do Ano)",
      value: "R$ 750.000,00",
    },
  ];

  return (
    <section className="flex flex-wrap w-full items-start justify-center gap-5">
      {financialData.map((item, index) => (
        <Card key={index} className="flex-1 min-w-[242px]">
          <CardContent className="flex flex-col gap-2 p-5">
            <div className="flex flex-col items-start w-full">
              <h3 className="w-full font-bold text-gray-500 text-sm">
                {item.title}
              </h3>
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="w-full font-normal text-gray-900 text-lg">
                {item.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};
