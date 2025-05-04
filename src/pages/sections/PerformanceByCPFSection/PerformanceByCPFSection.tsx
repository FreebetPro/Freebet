import { CalendarIcon } from "lucide-react";
import React from "react";

export const PerformanceByCPFSection = (): JSX.Element => {
  // Date range data
  const dateRange = {
    title: "Detalhes por Casa (01/04/2025 - 13/04/2025)",
    startDate: {
      day: "04",
      month: "01",
      year: "2025",
    },
    endDate: {
      day: "04",
      month: "13",
      year: "2025",
    },
  };

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col items-start">
        <h2 className="font-normal text-blue-900 text-lg">{dateRange.title}</h2>
      </div>

      <div className="flex items-start gap-2.5">
        {/* Start Date Input */}
        <div className="flex flex-col w-[200px] items-start relative bg-white rounded-lg overflow-hidden border border-solid border-gray-300">
          <div className="flex items-center w-full p-[9px]">
            <div className="flex items-start gap-px pl-px pr-[74.95px] pt-0.5 pb-[3px] flex-1">
              <span className="font-normal text-black text-[13.3px]">
                {dateRange.startDate.day}
              </span>
              <span className="font-normal text-black text-sm">/</span>
              <span className="font-normal text-black text-sm">
                {dateRange.startDate.month}
              </span>
              <span className="font-normal text-black text-sm">/</span>
              <span className="font-normal text-black text-[13.8px]">
                {dateRange.startDate.year}
              </span>
            </div>
            <div className="flex w-[18px] h-[18px] items-center justify-center">
              <CalendarIcon className="w-3.5 h-[13.12px]" />
            </div>
          </div>
        </div>

        {/* End Date Input */}
        <div className="flex flex-col w-[200px] items-start relative bg-white rounded-lg overflow-hidden border border-solid border-gray-300">
          <div className="flex items-center w-full p-[9px]">
            <div className="flex items-start gap-px pl-px pr-[74.95px] pt-0.5 pb-[3px] flex-1">
              <span className="font-normal text-black text-[13.3px]">
                {dateRange.endDate.day}
              </span>
              <span className="font-normal text-black text-sm">/</span>
              <span className="font-normal text-black text-sm">
                {dateRange.endDate.month}
              </span>
              <span className="font-normal text-black text-sm">/</span>
              <span className="font-normal text-black text-[13.8px]">
                {dateRange.endDate.year}
              </span>
            </div>
            <div className="flex w-[18px] h-[18px] items-center justify-center">
              <CalendarIcon className="w-3.5 h-[13.12px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
