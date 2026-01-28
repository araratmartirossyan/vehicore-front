import { AlertCircle } from 'lucide-react'
import { CodeBlock } from '../../components/ui/code-block'
import { maskApiKey } from './dashboardOnboarding.utils'
import { useI18n } from '../../i18n'

interface DashboardOnboardingProps {
  apiKey: string
  apiBaseUrl: string
  onNavigateToApiKeys: () => void
  onNavigateToBilling: () => void
}

export function DashboardOnboarding({
  apiKey,
  apiBaseUrl,
  onNavigateToApiKeys,
  onNavigateToBilling,
}: DashboardOnboardingProps) {
  const maskedApiKey = maskApiKey(apiKey)
  const { t } = useI18n()

  const envExample = apiKey ? `VEHICORE_API_KEY=${apiKey}` : `VEHICORE_API_KEY=<YOUR_API_KEY>`
  const envExampleMasked = `VEHICORE_API_KEY=${maskedApiKey}`

  const curlExample = apiKey
    ? `curl -X POST "${apiBaseUrl}/api/ocr/plate" \\\n  -H "X-API-Key: ${apiKey}" \\\n  -F "image=@/path/to/image.jpg" \\\n  -F "userLanguage=en"`
    : `curl -X POST "${apiBaseUrl}/api/ocr/plate" \\\n  -H "X-API-Key: <YOUR_API_KEY>" \\\n  -F "image=@/path/to/image.jpg" \\\n  -F "userLanguage=en"`

  const curlExampleMasked = `curl -X POST "${apiBaseUrl}/api/ocr/plate" \\\n  -H "X-API-Key: ${maskedApiKey}" \\\n  -F "image=@/path/to/image.jpg" \\\n  -F "userLanguage=en"`

  const nodeExample = apiKey
    ? `const response = await fetch('${apiBaseUrl}/api/ocr/plate', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': '${apiKey}'\n  },\n  body: formData\n})`
    : `const response = await fetch('${apiBaseUrl}/api/ocr/plate', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': process.env.VEHICORE_API_KEY\n  },\n  body: formData\n})`

  const nodeExampleMasked = `const response = await fetch('${apiBaseUrl}/api/ocr/plate', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': '${maskedApiKey}'\n  },\n  body: formData\n})`

  const pythonExample = apiKey
    ? `import requests\n\nheaders = {\n    'X-API-Key': '${apiKey}'\n}\nfiles = {'image': open('image.jpg', 'rb')}\ndata = {'userLanguage': 'en'}\nresponse = requests.post('${apiBaseUrl}/api/ocr/plate', headers=headers, files=files, data=data)`
    : `import requests\nimport os\n\nheaders = {\n    'X-API-Key': os.getenv('VEHICORE_API_KEY')\n}\nfiles = {'image': open('image.jpg', 'rb')}\ndata = {'userLanguage': 'en'}\nresponse = requests.post('${apiBaseUrl}/api/ocr/plate', headers=headers, files=files, data=data)`

  const pythonExampleMasked = `import requests\n\nheaders = {\n    'X-API-Key': '${maskedApiKey}'\n}\nfiles = {'image': open('image.jpg', 'rb')}\ndata = {'userLanguage': 'en'}\nresponse = requests.post('${apiBaseUrl}/api/ocr/plate', headers=headers, files=files, data=data)`

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8 px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('dashboardOnboarding.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('dashboardOnboarding.subtitle')}</p>
      </div>

      {/* Step 1: Your API key */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-base">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{t('dashboardOnboarding.step1Title')}</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <p className="text-muted-foreground">
              {t('dashboardOnboarding.step1Body')}{' '}
              <button
                type="button"
                onClick={onNavigateToApiKeys}
                className="text-primary font-medium underline underline-offset-4 hover:text-primary/80"
              >
                API keys page
              </button>
              .
            </p>
            {!apiKey && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    {t('dashboardOnboarding.step1MissingTitle')}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    {t('dashboardOnboarding.step1MissingBody')}
                  </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          {apiKey ? (
            <CodeBlock
              title="API key"
              code={apiKey}
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
              <h2 className="text-2xl font-semibold">{t('dashboardOnboarding.step2Title')}</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <p className="text-muted-foreground">
              {t('dashboardOnboarding.step2Body')}{' '}
              <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">.env</code>
            </p>
          </div>
        </div>
        <div>
          <CodeBlock
            title=".env"
            code={envExample}
            allowHide={!!apiKey}
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
              <h2 className="text-2xl font-semibold">{t('dashboardOnboarding.step3Title')}</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <p className="text-muted-foreground">
              {t('dashboardOnboarding.step3Body')}{' '}
              <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">X-API-Key</code>
            </p>
          </div>
        </div>
        <div>
          <CodeBlock
            code={curlExample}
            title="terminal"
            allowHide={!!apiKey}
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
              <h2 className="text-2xl font-semibold">{t('dashboardOnboarding.step4Title')}</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <p className="text-muted-foreground">
              {t('dashboardOnboarding.step4Body')}
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {t('dashboardOnboarding.freeTierTitle')}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {t('dashboardOnboarding.freeTierBody')}{' '}
                    <button
                      type="button"
                      onClick={onNavigateToBilling}
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
        <div>{/* Empty space to maintain alignment */}</div>
      </div>
    </div>
  )
}

