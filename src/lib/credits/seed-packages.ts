/**
 * Seed Credit Packages
 * Run with: npx tsx src/lib/credits/seed-packages.ts
 */

import { db } from '@/lib/db'
import { creditPackages } from '@/lib/db/schema'
import { DEFAULT_CREDIT_PACKAGES } from './config'

async function seedCreditPackages() {
  console.log('🌱 Seeding credit packages...')
  
  try {
    // Delete existing packages (optional)
    // await db.delete(creditPackages)
    
    for (const pkg of DEFAULT_CREDIT_PACKAGES) {
      await db.insert(creditPackages).values({
        name: pkg.name,
        description: pkg.description,
        credits: String(pkg.credits),
        bonusCredits: String(pkg.bonusCredits),
        price: String(pkg.price),
        currency: 'USD',
        isActive: true,
        isPopular: pkg.isPopular,
      }).onConflictDoNothing()
      
      console.log(`  ✅ Added package: ${pkg.name}`)
    }
    
    console.log('✨ Credit packages seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding credit packages:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedCreditPackages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { seedCreditPackages }
