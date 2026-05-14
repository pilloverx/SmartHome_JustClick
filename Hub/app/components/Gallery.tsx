'use client'

/**
 * Prototypes Gallery Component
 * 
 * Masonry grid showcase of community + official prototypes
 * Status: Placeholder (Phase E)
 * 
 * Features to implement:
 * - Masonry grid layout
 * - Animated prototype cards
 * - "Steal & Customize" functionality
 * - Live community stats
 * - Share buttons
 */

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 bg-white dark:bg-ha-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">Featured Prototypes</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-16">
          Explore and customize community-built smart home prototypes
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="card-ha overflow-hidden hover:shadow-lg transition-all">
              <div className="h-40 bg-gradient-to-br from-ha-primary/20 to-esp-primary/20 animate-pulse" />
              <div className="p-6">
                <h3 className="font-bold mb-2">Prototype {idx}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Smart home prototype description
                </p>
                <button className="text-ha-primary hover:text-ha-primary-dark text-sm font-medium">
                  Steal & Customize →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
