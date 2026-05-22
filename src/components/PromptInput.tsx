import { useState } from 'react'

interface Props {
  prompt: string
  onPromptChange: (value: string) => void
  isLoading: boolean
}

export function PromptInput({ prompt, onPromptChange, isLoading }: Props) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="w-full">
      <div
        className={`relative rounded-2xl transition-all duration-300 ${
          isFocused
            ? 'ring-2 ring-[#0071E3]/30 shadow-[0_0_0_1px_#0071E3]'
            : 'shadow-[0_0_0_1px_#e8e8ed] hover:shadow-[0_0_0_1px_#d2d2d7]'
        }`}
      >
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste your AI prompt here to calculate costs across different models..."
          className="w-full h-52 p-5 rounded-2xl resize-none text-[#1d1d1f] placeholder-[#86868b]/60 focus:outline-none text-[15px] leading-relaxed bg-white"
        />
        {isLoading && (
          <div className="absolute top-4 right-4">
            <div className="animate-spin h-5 w-5 border-2 border-[#0071E3] border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      <div className="mt-2 px-1">
        <span className="text-xs text-[#86868b]">
          {prompt.length > 0 ? `${prompt.length.toLocaleString()} characters` : 'Type or paste your prompt above'}
        </span>
      </div>
    </div>
  )
}
