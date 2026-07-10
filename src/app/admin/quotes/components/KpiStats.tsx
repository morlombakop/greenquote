import React from 'react';

type KpiStatsProps = {
  totalVolume: number;
  totalPipelineValue: number;
  totalFinancedValue: number;
  riskDistribution: { A: number; B: number; C: number };
};

export default function KpiStats({
  totalVolume,
  totalPipelineValue,
  totalFinancedValue,
  riskDistribution,
}: KpiStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Quotes Card */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Filtered Requests
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{totalVolume}</p>
      </div>

      {/* Pipeline Asset Valuation */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Gross Contract Value
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          €
          {totalPipelineValue.toLocaleString('de-DE', {
            maximumFractionDigits: 0,
          })}
        </p>
      </div>

      {/* Financed Volume Summary */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Total Portfolio Financing
        </p>
        <p className="mt-2 text-3xl font-bold text-green-600">
          €
          {totalFinancedValue.toLocaleString('de-DE', {
            maximumFractionDigits: 0,
          })}
        </p>
      </div>

      {/* Risk Allocation Portfolio Matrix */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Risk Band Demographics
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs font-bold">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            A: {riskDistribution.A}
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            B: {riskDistribution.B}
          </span>
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
            C: {riskDistribution.C}
          </span>
        </div>
      </div>
    </div>
  );
}
