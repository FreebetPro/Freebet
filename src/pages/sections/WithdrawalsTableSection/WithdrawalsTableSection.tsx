import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

export const WithdrawalsTableSection = (): JSX.Element => {
  // Data for the table rows
  const withdrawalData = [
    {
      date: "13/04/2025 18:15",
      type: "Super Odds",
      profit: "R$ 500,00",
      house: "Betano",
    },
    {
      date: "12/04/2025 14:30",
      type: "Freebet",
      profit: "R$ 200,00",
      house: "Bet365",
    },
    {
      date: "11/04/2025 09:00",
      type: "Cashback",
      profit: "R$ 100,00",
      house: "Vai de Bet",
    },
  ];

  return (
    <div className="flex flex-col w-full items-start justify-center py-[0.5px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-slate-100 text-center font-bold text-gray-800 text-sm">
              Data
            </TableHead>
            <TableHead className="bg-slate-100 text-center font-bold text-gray-800 text-sm">
              Tipo
            </TableHead>
            <TableHead className="bg-slate-100 text-center font-bold text-gray-800 text-sm">
              Lucro Gerado
            </TableHead>
            <TableHead className="bg-slate-100 text-center font-bold text-gray-800 text-sm">
              Casa
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawalData.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.date}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.type}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.profit}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.house}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
