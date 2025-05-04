import React from "react";
import { Button } from "../../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

export const GeneralStatisticsTableSection = (): JSX.Element => {
  // Table data for mapping
  const tableData = [
    {
      id: 1,
      cpfName: "123.456.789-00 / Gabriel Henrique",
      totalBet: "R$ 50.000,00",
      totalWon: "R$ 55.000,00",
      profitLoss: "R$ 5.000,00",
      isProfitPositive: true,
      activationProfit: "R$ 3.000,00",
      irMargin: "21,00%",
      commission: "R$ 300,00",
    },
    {
      id: 2,
      cpfName: "456.789.123-00 / Rafael",
      totalBet: "R$ 50.000,00",
      totalWon: "R$ 54.000,00",
      profitLoss: "R$ 4.000,00",
      isProfitPositive: true,
      activationProfit: "R$ 2.500,00",
      irMargin: "18,00%",
      commission: "R$ 250,00",
    },
    {
      id: 3,
      cpfName: "321.654.987-00 / Lucas",
      totalBet: "R$ 50.000,00",
      totalWon: "R$ 53.000,00",
      profitLoss: "R$ 3.000,00",
      isProfitPositive: true,
      activationProfit: "R$ 2.000,00",
      irMargin: "15,00%",
      commission: "R$ 200,00",
    },
    {
      id: 4,
      cpfName: "654.321.987-00 / Ana Costa",
      totalBet: "R$ 50.000,00",
      totalWon: "R$ 52.000,00",
      profitLoss: "R$ 2.000,00",
      isProfitPositive: true,
      activationProfit: "R$ 1.500,00",
      irMargin: "12,00%",
      commission: "R$ 150,00",
    },
    {
      id: 5,
      cpfName: "987.654.321-00 / Isally dos Santos",
      totalBet: "R$ 50.000,00",
      totalWon: "R$ 49.000,00",
      profitLoss: "-R$ 1.000,00",
      isProfitPositive: false,
      activationProfit: "R$ 0,00",
      irMargin: "0,00%",
      commission: "R$ 0,00",
    },
  ];

  return (
    <div className="w-full flex flex-col">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-slate-100 font-bold text-gray-800 text-sm text-center">
              CPF / Nome
            </TableHead>
            <TableHead className="bg-slate-100 font-bold text-gray-800 text-sm text-center">
              Total Apostado
            </TableHead>
            <TableHead className="bg-slate-100 font-bold text-gray-800 text-sm text-center">
              Total Ganho
            </TableHead>
            <TableHead className="bg-slate-100 font-bold text-gray-800 text-sm text-center">
              Lucro/Prejuízo
            </TableHead>
            <TableHead className="bg-slate-100 font-bold text-gray-800 text-sm text-center">
              Lucro Ativações
            </TableHead>
            <TableHead className="bg-slate-100 font-bold text-gray-800 text-sm text-center">
              % Margem de IR
            </TableHead>
            <TableHead className="bg-slate-100 font-bold text-gray-800 text-sm text-center">
              Comissão (10%)
            </TableHead>
            <TableHead className="bg-slate-100 font-bold text-gray-800 text-sm text-center">
              Detalhes
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-normal text-black text-sm text-center">
                {row.cpfName}
              </TableCell>
              <TableCell className="font-normal text-black text-sm text-center">
                {row.totalBet}
              </TableCell>
              <TableCell className="font-normal text-black text-sm text-center">
                {row.totalWon}
              </TableCell>
              <TableCell
                className={`font-bold text-sm text-center ${row.isProfitPositive ? "text-green-600" : "text-red-600"}`}
              >
                {row.profitLoss}
              </TableCell>
              <TableCell className="font-normal text-black text-sm text-center">
                {row.activationProfit}
              </TableCell>
              <TableCell className="font-normal text-black text-sm text-center">
                {row.irMargin}
              </TableCell>
              <TableCell className="font-normal text-black text-sm text-center">
                {row.commission}
              </TableCell>
              <TableCell>
                <Button className="w-full bg-blue-900 text-white text-xs rounded-md py-1 px-2.5">
                  Ver Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
