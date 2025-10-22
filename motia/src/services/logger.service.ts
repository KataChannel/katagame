/**
 * Logger Service
 * Handles all application logging
 */

import * as fs from 'fs'
import * as path from 'path'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  stack?: string
}

class Logger {
  private logDir: string
  private logFile: string
  private currentDate: string

  constructor(logDir: string = './logs') {
    this.logDir = logDir
    this.currentDate = this.getFormattedDate()
    this.logFile = path.join(logDir, `app-${this.currentDate}.log`)

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  }

  /**
   * Get formatted date string (YYYY-MM-DD)
   */
  private getFormattedDate(): string {
    const now = new Date()
    return now.toISOString().split('T')[0]
  }

  /**
   * Get ISO timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString()
  }

  /**
   * Check if log file needs rotation
   */
  private checkLogRotation(): void {
    const today = this.getFormattedDate()
    if (today !== this.currentDate) {
      this.currentDate = today
      this.logFile = path.join(this.logDir, `app-${this.currentDate}.log`)
    }
  }

  /**
   * Write log entry to file
   */
  private writeToFile(entry: LogEntry): void {
    try {
      this.checkLogRotation()
      const logLine = JSON.stringify(entry) + '\n'
      fs.appendFileSync(this.logFile, logLine)
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  /**
   * Format log message for console
   */
  private formatConsoleMessage(level: LogLevel, message: string): string {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
    }
    const reset = '\x1b[0m'
    const timestamp = new Date().toISOString().substring(11, 19)

    return `${colors[level]}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}`
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: 'debug',
      message,
      data,
    }

    if (process.env.LOG_LEVEL === 'debug') {
      console.log(this.formatConsoleMessage('debug', message), data || '')
    }
    this.writeToFile(entry)
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: 'info',
      message,
      data,
    }

    console.log(this.formatConsoleMessage('info', message), data || '')
    this.writeToFile(entry)
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: 'warn',
      message,
      data,
    }

    console.warn(this.formatConsoleMessage('warn', message), data || '')
    this.writeToFile(entry)
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: 'error',
      message,
      data: error?.message,
      stack: error?.stack,
    }

    console.error(this.formatConsoleMessage('error', message), error || '')
    this.writeToFile(entry)
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, status: number, duration: number, ip: string): void {
    const message = `${method} ${path} - ${status} (${duration}ms)`
    this.info(message, { ip })
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: string, details: any): void {
    const message = `SECURITY: ${event}`
    this.warn(message, details)
  }

  /**
   * Get log file path
   */
  getLogFilePath(): string {
    return this.logFile
  }

  /**
   * Clear old logs (older than specified days)
   */
  clearOldLogs(daysToKeep: number = 7): void {
    try {
      const files = fs.readdirSync(this.logDir)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      for (const file of files) {
        const filePath = path.join(this.logDir, file)
        const stats = fs.statSync(filePath)

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath)
          this.info(`Deleted old log file: ${file}`)
        }
      }
    } catch (error) {
      this.error('Failed to clear old logs:', error as Error)
    }
  }
}

// Create singleton instance
let loggerInstance: Logger | null = null

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger()
  }
  return loggerInstance
}

export { Logger, LogEntry, LogLevel }
