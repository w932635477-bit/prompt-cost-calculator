interface Props {
  callsPerMonth: number
  onCallsChange: (value: number) => void
  expectedOutputTokens: number
  onOutputTokensChange: (value: number) => void
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export function UsageSlider({ callsPerMonth, onCallsChange, expectedOutputTokens, onOutputTokensChange }: Props) {
  const logMin = Math.log10(10)
  const logMax = Math.log10(1_000_000)
  const logValue = Math.log10(callsPerMonth)
  const percentage = ((logValue - logMin) / (logMax - logMin)) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <label className="text-sm font-medium text-[#1d1d1f]">
            API calls per month
          </label>
          <span className="text-sm font-semibold text-[#0071E3] tabular-nums">
            {formatNumber(callsPerMonth)}
          </span>
        </div>
        <input
          type="range"
          min={logMin}
          max={logMax}
          step={0.01}
          value={logValue}
          onChange={(e) => onCallsChange(Math.round(Math.pow(10, parseFloat(e.target.value))))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #0071E3 0%, #0071E3 ${percentage}%, #d2d2d7 ${percentage}%, #d2d2d7 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-[#86868b] mt-2">
          <span>10</span>
          <span>1M</span>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <label className="text-sm font-medium text-[#1d1d1f]">
            Expected output tokens
          </label>
          <span className="text-sm font-semibold text-[#0071E3] tabular-nums">
            {formatNumber(expectedOutputTokens)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={16384}
          step={256}
          value={expectedOutputTokens}
          onChange={(e) => onOutputTokensChange(parseInt(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #0071E3 0%, #0071E3 ${(expectedOutputTokens / 16384) * 100}%, #d2d2d7 ${(expectedOutputTokens / 16384) * 100}%, #d2d2d7 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-[#86868b] mt-2">
          <span>0</span>
          <span>16K</span>
        </div>
      </div>
    </div>
  )
}
