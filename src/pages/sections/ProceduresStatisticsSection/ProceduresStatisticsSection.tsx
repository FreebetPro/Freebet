import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

export const ProceduresStatisticsSection = (): JSX.Element => {
  // Data for the table rows
  const tableData = [
    {
      casa: "Betano",
      depositosValor: "R$ 25.000,00",
      depositosQuantidade: "20",
      saquesValor: "R$ 22.000,00",
      saquesQuantidade: "5",
      freebetsQuantidade: "10",
      lucroPrejuizo: "R$ 3.000,00",
      isProfit: true,
    },
    {
      casa: "Bet365",
      depositosValor: "R$ 15.000,00",
      depositosQuantidade: "15",
      saquesValor: "R$ 13.000,00",
      saquesQuantidade: "3",
      freebetsQuantidade: "5",
      lucroPrejuizo: "R$ 2.000,00",
      isProfit: true,
    },
    {
      casa: "Vai de Bet",
      depositosValor: "R$ 10.000,00",
      depositosQuantidade: "8",
      saquesValor: "R$ 10.000,00",
      saquesQuantidade: "2",
      freebetsQuantidade: "3",
      lucroPrejuizo: "-R$ 500,00",
      isProfit: false,
    },
  ];

  // Table headers
  const headers = [
    "Casa",
    "Depósitos (Valor)",
    "Depósitos (Quantidade)",
    "Saques (Valor)",
    "Saques (Quantidade)",
    "Freebets (Quantidade)",
    "Lucro/Prejuízo",
  ];

  return (
    <div className="w-full py-[0.5px]">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead
                key={index}
                className="bg-slate-100 font-bold text-gray-800 text-sm text-center"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.casa}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.depositosValor}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.depositosQuantidade}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.saquesValor}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.saquesQuantidade}
              </TableCell>
              <TableCell className="text-center font-normal text-black text-sm">
                {row.freebetsQuantidade}
              </TableCell>
              <TableCell
                className={`text-center font-bold ${row.isProfit ? "text-green-600" : "text-red-600"} text-sm`}
              >
                {row.lucroPrejuizo}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
