'use client'

/**
 * Setup Wizard Component
 * 
 * Guided onboarding with gamified experience
 * Status: Placeholder (Phase F)
 * 
 * Features to implement:
 * - Progress stepper (3 steps: docker, device, openclaw)
 * - Terminal simulation
 * - Success animations
 * - HA mock dashboard
 * - Next step CTAs
 */

export default function Wizard() {
  return (
    <section className="py-20 bg-white dark:bg-ha-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-ha p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Setup Wizard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Interactive guided setup with live simulations
          </p>
          <div className="bg-gray-100 dark:bg-ha-surface-dark rounded-lg p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-600 mb-2">🚀 Coming Soon</p>
              <p className="text-sm text-gray-500">Step-by-step setup experience</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
