import React from "react";
import { Button } from "../../../components/ui/button";

export const StatisticsSection = (): JSX.Element => {
  return (
    <div className="flex w-full items-center justify-between py-4">
      <div className="flex flex-col items-start">
        <h1 className="font-bold text-blue-900 text-2xl">
          Métricas Financeiras - Lucro Certo - CPF Analytics
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        <Button className="bg-blue-900 text-white hover:bg-blue-800 text-sm">
          Exportar para Excel
        </Button>

        <Button className="bg-blue-900 text-white hover:bg-blue-800 text-sm">
          Exportar para PDF
        </Button>
      </div>
    </div>
  );
};
