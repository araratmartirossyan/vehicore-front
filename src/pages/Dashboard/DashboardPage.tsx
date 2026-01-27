import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { CodeBlock } from '../../components/ui/code-block'
import { useApiKeys } from '../../hooks/useApiKeys'
import { API_BASE_URL } from '../../utils/constants'

const ONBOARDING_KEY_ID = 'onboarding_api_key_id'
const ONBOARDING_KEY_VALUE = 'onboarding_api_key'

export function DashboardPage() {
  const navigate = useNavigate()
  const { apiKeys, loading, listApiKeys } = useApiKeys()
  const hasLoadedRef = useRef(false)

  const storedApiKey = typeof window !== 'undefined' ? sessionStorage.getItem(ONBOARDING_KEY_VALUE) : null

  const hasAnyUsedKey = useMemo(() => {
    return apiKeys.some((k) => !!k.lastUsedAt)
  }, [apiKeys])

  const hasAnyKey = apiKeys.length > 0

  // If any key has been used at least once -> go to Usage
  // Only redirect if we've finished loading and checked keys
  useEffect(() => {
    if (!loading && hasAnyUsedKey) {
      try {
        sessionStorage.removeItem(ONBOARDING_KEY_ID)
        sessionStorage.removeItem(ONBOARDING_KEY_VALUE)
      } catch {
        // ignore
      }
      navigate('/usage', { replace: true })
    }
  }, [loading, hasAnyUsedKey, navigate])

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      listApiKeys()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apiKeyToShow = storedApiKey || ''
  const maskedApiKey = '••••••••••••••••••••••••••••••••••••••••'

  const envExample = apiKeyToShow
    ? `VEHICORE_API_KEY=${apiKeyToShow}`
    : `VEHICORE_API_KEY=<YOUR_API_KEY>`
  
  const envExampleMasked = `VEHICORE_API_KEY=${maskedApiKey}`

  const curlExample = apiKeyToShow
    ? `curl -X POST "${API_BASE_URL}/api/ocr/plate" \\\n  -H "X-API-Key: ${apiKeyToShow}" \\\n  -F "image=@/path/to/image.jpg" \\\n  -F "userLanguage=en"`
    : `curl -X POST "${API_BASE_URL}/api/ocr/plate" \\\n  -H "X-API-Key: <YOUR_API_KEY>" \\\n  -F "image=@/path/to/image.jpg" \\\n  -F "userLanguage=en"`
  
  const curlExampleMasked = `curl -X POST "${API_BASE_URL}/api/ocr/plate" \\\n  -H "X-API-Key: ${maskedApiKey}" \\\n  -F "image=@/path/to/image.jpg" \\\n  -F "userLanguage=en"`

  const nodeExample = apiKeyToShow
    ? `const response = await fetch('${API_BASE_URL}/api/ocr/plate', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': '${apiKeyToShow}'\n  },\n  body: formData\n})`
    : `const response = await fetch('${API_BASE_URL}/api/ocr/plate', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': process.env.VEHICORE_API_KEY\n  },\n  body: formData\n})`
  
  const nodeExampleMasked = `const response = await fetch('${API_BASE_URL}/api/ocr/plate', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': '${maskedApiKey}'\n  },\n  body: formData\n})`

  const pythonExample = apiKeyToShow
    ? `import requests\n\nheaders = {\n    'X-API-Key': '${apiKeyToShow}'\n}\nfiles = {'image': open('image.jpg', 'rb')}\ndata = {'userLanguage': 'en'}\nresponse = requests.post('${API_BASE_URL}/api/ocr/plate', headers=headers, files=files, data=data)`
    : `import requests\nimport os\n\nheaders = {\n    'X-API-Key': os.getenv('VEHICORE_API_KEY')\n}\nfiles = {'image': open('image.jpg', 'rb')}\ndata = {'userLanguage': 'en'}\nresponse = requests.post('${API_BASE_URL}/api/ocr/plate', headers=headers, files=files, data=data)`
  
  const pythonExampleMasked = `import requests\n\nheaders = {\n    'X-API-Key': '${maskedApiKey}'\n}\nfiles = {'image': open('image.jpg', 'rb')}\ndata = {'userLanguage': 'en'}\nresponse = requests.post('${API_BASE_URL}/api/ocr/plate', headers=headers, files=files, data=data)`

  const shouldShowOnboarding = !hasAnyUsedKey

  if (!shouldShowOnboarding) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8 px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Get started with VehiCore AI</h1>
        <p className="text-muted-foreground text-lg">
          Follow these steps to set up your API key and make your first request.
        </p>
      </div>

      {/* Step 1: Your API key */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-base">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">Your API key</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <p className="text-muted-foreground">
              This key was automatically generated for you. Copy it and store it securely. You can retrieve or create new keys anytime from the{' '}
              <button
                type="button"
                onClick={() => navigate('/api-keys')}
                className="text-primary font-medium underline underline-offset-4 hover:text-primary/80"
              >
                API keys page
              </button>
              .
            </p>
            {!apiKeyToShow && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Important
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Your API key was generated, but it can't be shown again after refresh unless you saved it.
                      If you don't have it, create a new key on the API Keys page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          {apiKeyToShow ? (
            <CodeBlock 
              title="API key" 
              code={apiKeyToShow} 
              allowHide={true}
              maskedCode={maskedApiKey}
            />
          ) : (
            <CodeBlock title="API key" code="<YOUR_API_KEY>" />
          )}
        </div>
      </div>

      {/* Step 2: Set your API key */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-base">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">Set your API key</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <p className="text-muted-foreground">
              Add this key to your <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">.env</code> or create the file if it doesn't exist. For security, we recommend using environment variables in production.
            </p>
          </div>
        </div>
        <div>
          <CodeBlock 
            title=".env" 
            code={envExample}
            allowHide={!!apiKeyToShow}
            maskedCode={envExampleMasked}
          />
        </div>
      </div>

      {/* Step 3: Make your first request */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-base">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">Make your first request</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <p className="text-muted-foreground">
              Send your API key as an <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">X-API-Key</code> header on every request to VehiCore AI endpoints.
            </p>
          </div>
        </div>
        <div>
          <CodeBlock
            code={curlExample}
            title="terminal"
            allowHide={!!apiKeyToShow}
            tabs={[
              { label: 'curl', code: curlExample, maskedCode: curlExampleMasked },
              { label: 'Node.js', code: nodeExample, maskedCode: nodeExampleMasked },
              { label: 'Python', code: pythonExample, maskedCode: pythonExampleMasked },
            ]}
          />
        </div>
      </div>

      {/* Step 4: How it works */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-base">
              4
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">How it works</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <p className="text-muted-foreground">
              Your API key authenticates your requests and tracks your usage. You start with a free tier that includes credits for testing.
              Once you've used your key at least once, this onboarding page will disappear and we'll redirect you to the Usage page by default.
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Free tier included
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Your API key gives you access to a free tier with credits to get started. You can purchase additional credits from the{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/billing')}
                      className="text-blue-700 dark:text-blue-300 font-medium underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      Billing page
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          {/* Empty space to maintain alignment */}
        </div>
      </div>
    </div>
  )
}
