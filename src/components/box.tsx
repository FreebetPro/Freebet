import { PlusIcon } from "lucide-react";
import React from "react";
import { Badge } from "../components/ui/bread";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export const Box = (): JSX.Element => {
  // Data for general indicators
  const indicators = {
    totalActive: 3,
    totalBalance: "R$ 45.162,61",
    globalROI: "10.00%",
    negativeROI: 1,
    zeroBalance: 2,
  };

  // Data for active accounts
  const activeAccounts = [
    {
      id: 1,
      name: "Lucro Certo",
      icon: "🔶",
      initialCapital: "R$ 10.000,00",
      profit: "R$ 2.500,00",
      roi: "25.00%",
      roiStatus: "positive",
      bets: 50,
    },
    {
      id: 2,
      name: "Maria - Betano (Protected)",
      icon: "🔸",
      initialCapital: "R$ 5.000,00",
      profit: "R$ 200,00",
      roi: "-6.67%",
      roiStatus: "negative",
      bets: 20,
    },
    {
      id: 3,
      name: "Spock - Betfair Exchange",
      icon: "🟢",
      initialCapital: "R$ 30.000,00",
      profit: "R$ 2.000,00",
      roi: "10.00%",
      roiStatus: "positive",
      bets: 30,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-background p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Minhas Bancas</p>
          <h1 className="text-2xl font-semibold">Minhas Bancas</h1>
        </div>
        <Button variant="default">Exportar Dados</Button>
      </header>

      {/* General Indicators */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Indicadores Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Total de Bancas Ativas
              </p>
              <p className="text-2xl font-bold">{indicators.totalActive}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground">Saldo Total</p>
              <p className="text-2xl font-bold">{indicators.totalBalance}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground">ROI Médio Global</p>
              <p className="text-2xl font-bold">{indicators.globalROI}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Bancas com ROI Negativo
              </p>
              <p className="text-2xl font-bold">{indicators.negativeROI}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Bancas com Saldo Zerado
              </p>
              <p className="text-2xl font-bold">{indicators.zeroBalance}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Active Accounts */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Bancas Ativas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeAccounts.map((account) => (
            <div
              key={account.id}
              className="border-l-4 rounded-md overflow-hidden shadow-sm"
              style={{
                borderLeftColor:
                  account.roiStatus === "positive"
                    ? "#22c55e"
                    : account.roiStatus === "negative"
                      ? "#ef4444"
                      : "#f59e0b",
              }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{account.icon}</span>
                    <h3 className="font-medium">{account.name}</h3>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Capital Inicial:
                      </span>
                      <span className="text-sm">{account.initialCapital}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Lucro:
                      </span>
                      <span className="text-sm">{account.profit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        ROI - Progressão:
                      </span>
                      <Badge
                        variant={
                          account.roiStatus === "positive"
                            ? "success"
                            : "destructive"
                        }
                        className={`${
                          account.roiStatus === "positive"
                            ? "bg-green-500"
                            : account.roiStatus === "negative"
                              ? "bg-red-500"
                              : ""
                        }`}
                      >
                        {account.roi}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Quantidade de Apostas:
                      </span>
                      <span className="text-sm">{account.bets}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      Registrar Operação
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-amber-500 text-white hover:bg-amber-600 border-0"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-500 text-white hover:bg-red-600 border-0"
                    >
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Floating action button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 bg-blue-500 hover:bg-blue-600"
        size="icon"
      >
        <PlusIcon className="h-6 w-6" />
      </Button>
    </div>
  );
};
