import Link from 'next/link'
import { ArrowLeft, Hammer } from 'lucide-react'
import YamlBuilder from '../components/YamlBuilder'
import { HERO_SCENARIOS } from '../../lib/heroScenarios'

type BuilderPageProps = {
  searchParams?: Promise<{
    template?: string
  }>
}

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  const resolvedSearchParams = await searchParams
  const selectedTemplateId = resolvedSearchParams?.template
  const selectedTemplate = HERO_SCENARIOS.find((scenario) => scenario.id === selectedTemplateId) ?? null

  return (
    <div className="py-12">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ha-primary hover:text-ha-primary-dark"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mt-4 card-ha p-6 md:p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ha-primary/10 border border-ha-primary/20 text-ha-primary text-sm font-medium">
            <Hammer className="w-4 h-4" />
            Builder Workspace
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold">ESPHome YAML Builder</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-3xl">
            This page is the dedicated development surface for Phase C. We can now iterate the
            builder here without crowding the homepage hero flow.
          </p>
          {selectedTemplate && (
            <div className="mt-5 rounded-xl border border-ha-primary/30 bg-ha-primary/5 p-4">
              <p className="text-sm font-semibold text-ha-primary">
                Starter template loaded: {selectedTemplate.label}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {selectedTemplate.summary}
              </p>
            </div>
          )}
        </div>
      </section>

      <YamlBuilder initialScenarioId={selectedTemplate?.id ?? null} />
    </div>
  )
}
