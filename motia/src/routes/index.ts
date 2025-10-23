/**
 * API Routes Index
 * Combines all v1 API routes
 */

import { Client } from 'pg'
import { mvp1Routes, initializeServices } from './mvp1.routes'

export function registerRoutes(dbClient: Client) {
  // Initialize services with database client
  initializeServices(dbClient)

  // Return all MVP1 routes
  return mvp1Routes
}

export default {
  mvp1Routes,
  registerRoutes,
}
