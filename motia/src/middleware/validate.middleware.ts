/**
 * Input Validation Middleware
 * Validates and sanitizes request data
 */

interface ValidationRule {
  field: string
  type: 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'array'
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  customValidator?: (value: any) => boolean
}

interface ValidationError {
  field: string
  message: string
}

class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 255
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(value: any): string {
    if (typeof value !== 'string') {
      return ''
    }

    // Trim whitespace
    let sanitized = value.trim()

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

    // Limit length
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000)
    }

    return sanitized
  }

  /**
   * Escape HTML special characters
   */
  static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, char => map[char])
  }

  /**
   * Validate against rules
   */
  static validate(data: any, rules: ValidationRule[]): ValidationError[] {
    const errors: ValidationError[] = []

    for (const rule of rules) {
      const value = data[rule.field]

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`,
        })
        continue
      }

      // Skip validation if not required and empty
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue
      }

      // Type validation
      switch (rule.type) {
        case 'email':
          if (!this.isValidEmail(value)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a valid email`,
            })
          }
          break

        case 'uuid':
          if (!this.isValidUUID(value)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a valid UUID`,
            })
          }
          break

        case 'string':
          if (typeof value !== 'string') {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a string`,
            })
            break
          }

          // Length checks
          if (rule.minLength && value.length < rule.minLength) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be at least ${rule.minLength} characters`,
            })
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be at most ${rule.maxLength} characters`,
            })
          }

          // Pattern matching
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} format is invalid`,
            })
          }
          break

        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a number`,
            })
          }
          break

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a boolean`,
            })
          }
          break

        case 'array':
          if (!Array.isArray(value)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be an array`,
            })
          }
          break
      }

      // Custom validator
      if (rule.customValidator && !rule.customValidator(value)) {
        errors.push({
          field: rule.field,
          message: `${rule.field} validation failed`,
        })
      }
    }

    return errors
  }
}

/**
 * Validation rules for common endpoints
 */
const validationRules = {
  register: [
    { field: 'email', type: 'email' as const, required: true },
    {
      field: 'password',
      type: 'string' as const,
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, // At least one lowercase, uppercase, number
    },
  ],

  login: [
    { field: 'email', type: 'email' as const, required: true },
    { field: 'password', type: 'string' as const, required: true },
  ],

  updatePlayer: [
    {
      field: 'username',
      type: 'string' as const,
      required: false,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_-]+$/,
    },
  ],

  recruitHero: [
    { field: 'heroId', type: 'uuid' as const, required: true },
  ],

  trade: [
    { field: 'fromResource', type: 'string' as const, required: true },
    { field: 'toResource', type: 'string' as const, required: true },
    { field: 'amount', type: 'number' as const, required: true },
  ],

  battleResolve: [
    { field: 'battleId', type: 'uuid' as const, required: true },
    {
      field: 'result',
      type: 'string' as const,
      required: true,
      customValidator: (value: any) => ['attacker_win', 'defender_win', 'draw'].includes(value),
    },
  ],
}

export { InputValidator, ValidationError, ValidationRule, validationRules }
