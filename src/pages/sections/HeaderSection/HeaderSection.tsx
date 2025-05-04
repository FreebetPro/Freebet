import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export const HeaderSection = (): JSX.Element => {
  // User data that could be mapped in a real application
  const userData = {
    cpf: "123.456.789-00",
    name: "Gabriel Henrique",
  };

  return (
    <div className="flex items-center gap-2.5 w-full mt-8">
      <label
        htmlFor="cpf-select"
        className="font-normal text-sm text-gray-700 font-sans"
      >
        Selecionar CPF:
      </label>

      <Select defaultValue={userData.cpf}>
        <SelectTrigger
          id="cpf-select"
          className="w-[200px] bg-[#efefef] text-[13px] font-normal py-[9px] border-gray-300"
        >
          <SelectValue placeholder="Selecione um CPF" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={userData.cpf}>
            {`${userData.cpf} - ${userData.name}`}
          </SelectItem>
          {/* Additional items would be mapped here in a real application */}
        </SelectContent>
      </Select>
    </div>
  );
};
