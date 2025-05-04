import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

export const DepositsTableSection = (): JSX.Element => {
  // Data for the table rows
  const tableData = [
    {
      procedureType: "Freebet",
      quantity: "10",
      profit: "R$ 2.000,00",
    },
    {
      procedureType: "Cashback",
      quantity: "5",
      profit: "R$ 500,00",
    },
    {
      procedureType: "Super Odds",
      quantity: "3",
      profit: "R$ 1.500,00",
    },
  ];

  return (
    <div className="flex flex-col w-full items-start justify-center py-[0.5px]">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-slate-100 text-center font-bold text-gray-800 text-sm py-[13px]">
              Tipo de Procedimento
            </TableHead>
            <TableHead className="bg-slate-100 text-center font-bold text-gray-800 text-sm py-[13px]">
              Quantidade
            </TableHead>
            <TableHead className="bg-slate-100 text-center font-bold text-gray-800 text-sm py-[13px]">
              Lucro Gerado
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="text-center font-normal text-black text-sm py-[13px]">
                {row.procedureType}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm py-[13px]">
                {row.quantity}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm py-[13px]">
                {row.profit}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
