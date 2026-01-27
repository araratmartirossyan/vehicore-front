import { useState } from 'react'
import { Copy, Check, Eye, EyeOff } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../utils/helpers'

interface CodeBlockProps {
  code?: string
  title?: string
  language?: string
  tabs?: Array<{ label: string; code: string; maskedCode?: string }>
  className?: string
  allowHide?: boolean
  maskedCode?: string
}

export function CodeBlock({ code = '', title, language, tabs, className, allowHide = false, maskedCode }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(tabs && tabs.length > 0 ? tabs[0]?.label : null)
  const [showKey, setShowKey] = useState(false)

  const activeTabData = tabs && activeTab ? tabs.find((t) => t.label === activeTab) : null
  const displayCode = activeTabData?.code || code
  const maskedTabCode = activeTabData?.maskedCode

  const actualCode = allowHide && !showKey 
    ? (tabs && maskedTabCode ? maskedTabCode : maskedCode || displayCode)
    : displayCode
  const isMasked = displayCode.includes('•••') || (allowHide && (maskedCode || maskedTabCode) && !showKey)

  const onCopy = async () => {
    try {
      // Copy the actual displayed code, not the masked version
      await navigator.clipboard.writeText(displayCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className={cn('rounded-lg border overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b bg-[#1e1e1e] px-4 py-2.5">
        <div className="flex items-center gap-3">
          {tabs && tabs.length > 0 && (
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(tab.label)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-t transition-colors',
                    activeTab === tab.label
                      ? 'bg-[#252526] text-white'
                      : 'text-[#cccccc] hover:text-white hover:bg-[#2d2d30]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          {!tabs && (
            <div className="text-xs text-[#cccccc] font-medium">{title || language || 'Code'}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {allowHide && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#2d2d30]"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          {isMasked && !allowHide && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#2d2d30]"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? 'Hide' : 'Show'}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[#cccccc] hover:text-white hover:bg-[#2d2d30]"
            onClick={onCopy}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <pre className="overflow-auto bg-[#1e1e1e] p-4 text-sm">
        <code className="font-mono text-[#d4d4d4] leading-relaxed whitespace-pre">
          {actualCode}
        </code>
      </pre>
    </div>
  )
}

