import React from "react";
import { Input } from "../../../components/ui/input";

export const DetailsTableSection = (): JSX.Element => {
  return (
    <div className="flex w-full items-center justify-between mb-4">
      <div className="flex flex-col">
        <h2 className="text-lg font-normal text-blue-900 font-inter">
          Desempenho por CPF (Top 5)
        </h2>
      </div>

      <div className="flex items-center">
        <Input
          className="w-[200px] text-[13.5px] text-[#757575] p-[9px] rounded-lg border-gray-300"
          placeholder="Buscar por Nome ou CPF"
        />
      </div>
    </div>
  );
};
