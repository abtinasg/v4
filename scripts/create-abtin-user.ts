/**
 * Script to create an Abtin user
 * Usage: npx tsx scripts/create-abtin-user.ts <username> <password> [email] [fullName]
 */

import { createAbtinUser } from '../src/lib/auth/abtin-enhanced-auth'

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/create-abtin-user.ts <username> <password> [email] [fullName]')
    console.error('Example: npx tsx scripts/create-abtin-user.ts abtin mypassword abtin@example.com "Abtin User"')
    process.exit(1)
  }
  
  const [username, password, email, fullName] = args
  
  console.log('Creating Abtin user...')
  console.log('Username:', username)
  console.log('Email:', email || 'Not provided')
  console.log('Full Name:', fullName || 'Not provided')
  
  const result = await createAbtinUser(username, password, email, fullName)
  
  if (result.success) {
    console.log('\n✅ User created successfully!')
    console.log('User ID:', result.userId)
    console.log('\nYou can now login at /abtin with:')
    console.log('Username:', username)
    console.log('Password: [hidden]')
  } else {
    console.error('\n❌ Failed to create user:', result.error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
