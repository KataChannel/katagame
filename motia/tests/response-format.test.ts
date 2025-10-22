/**
 * API Response Format Verification Test Suite
 * Validates that all 15 API endpoints return responses in Motia format:
 * { status: number, body: { success: boolean, data?: any, message?: string } }
 */

import fs from 'fs'
import path from 'path'

interface MotiaResponse {
  status: number
  body: {
    success: boolean
    data?: any
    message?: string
  }
}

interface TestResult {
  endpoint: string
  file: string
  format_valid: boolean
  issues: string[]
}

const ENDPOINTS_PATH = path.join(__dirname, '../steps/game')
const API_ENDPOINTS = [
  'auth-login.step.ts',
  'auth-logout.step.ts',
  'auth-refresh-token.step.ts',
  'auth-register.step.ts',
  'battle-start.step.ts',
  'battle-resolve.step.ts',
  'hero-list.step.ts',
  'hero-recruit.step.ts',
  'player-profile.step.ts',
  'player-profile-public.step.ts',
  'player-update.step.ts',
  'resource-harvest.step.ts',
  'resource-trade.step.ts',
  'achievement-list.step.ts',
  'save-game-sync.step.ts',
]

/**
 * Check if a file contains proper Motia response format
 */
function checkResponseFormat(filePath: string): TestResult {
  const content = fs.readFileSync(filePath, 'utf-8')
  const fileName = path.basename(filePath)
  const issues: string[] = []

  // Pattern 1: Correct format - { status: number, body: { success, ... } }
  const correctPattern = /return\s*{\s*status\s*:\s*\d{3}\s*,\s*body\s*:\s*{/g
  const correctMatches = content.match(correctPattern) || []

  // Pattern 2: Incorrect format - { success: ..., message: ..., status: ... }
  const incorrectPattern = /return\s*{\s*success\s*:/g
  const incorrectMatches = content.match(incorrectPattern) || []

  // Count error responses to ensure they use correct format too
  const errorReturns = (content.match(/return\s*{/g) || []).length

  // Check for inconsistencies
  if (incorrectMatches.length > 0) {
    issues.push(
      `❌ Found ${incorrectMatches.length} responses with incorrect format (success first)`
    )
  }

  if (correctMatches.length === 0 && errorReturns > 0) {
    issues.push(`⚠️  No properly formatted Motia responses found`)
  }

  // Check for mixed response property order (status before body)
  const bodyWrapperPattern = /return\s*{\s*status\s*:/
  if (!content.match(bodyWrapperPattern) && errorReturns > 0) {
    issues.push(`❌ Responses may not wrap in body property`)
  }

  const isValid = issues.length === 0 && correctMatches.length > 0

  return {
    endpoint: fileName.replace('.step.ts', ''),
    file: fileName,
    format_valid: isValid,
    issues,
  }
}

/**
 * Run all checks and generate report
 */
export function runFormatVerification(): {
  results: TestResult[]
  summary: { total: number; valid: number; issues: number }
} {
  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║         API Response Format Verification Test Suite          ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')

  const results: TestResult[] = []
  let validCount = 0
  let issueCount = 0

  for (const endpointFile of API_ENDPOINTS) {
    const filePath = path.join(ENDPOINTS_PATH, endpointFile)

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${endpointFile}`)
      issueCount++
      continue
    }

    const result = checkResponseFormat(filePath)
    results.push(result)

    if (result.format_valid) {
      console.log(`✅ ${result.endpoint.padEnd(30)} - OK`)
      validCount++
    } else {
      console.log(
        `❌ ${result.endpoint.padEnd(30)} - ${result.issues.length} issue(s)`
      )
      for (const issue of result.issues) {
        console.log(`   ${issue}`)
      }
      issueCount++
    }
  }

  const summary = {
    total: API_ENDPOINTS.length,
    valid: validCount,
    issues: issueCount,
  }

  console.log(
    '\n' +
      '─'.repeat(62) +
      '\n'
  )
  console.log(`Summary:`)
  console.log(
    `  ✅ Valid endpoints:  ${validCount}/${API_ENDPOINTS.length}`
  )
  console.log(`  ❌ Issues found:    ${issueCount}`)
  console.log(`  Overall Status:     ${validCount === API_ENDPOINTS.length ? '🟢 PASS' : '🔴 FAIL'}\n`)

  return { results, summary }
}

/**
 * Export test results to JSON
 */
export function exportResults(
  results: TestResult[],
  filename = 'response-format-test-results.json'
): void {
  const filePath = path.join(__dirname, filename)
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2))
  console.log(`\n📋 Results exported to: ${filePath}`)
}

// Run tests if this file is executed directly
if (require.main === module) {
  const { results, summary } = runFormatVerification()
  exportResults(results)

  process.exit(summary.issues > 0 ? 1 : 0)
}

export default { runFormatVerification, exportResults }
