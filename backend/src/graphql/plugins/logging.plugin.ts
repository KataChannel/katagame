import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Logger } from '@nestjs/common';

@Plugin()
export class GraphQLLoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger('GraphQL');

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const logger = this.logger;
    const startTime = Date.now();

    return {
      async didResolveOperation(requestContext) {
        const operationName = requestContext.operationName || 'Anonymous';
        const operationType = requestContext.operation?.operation || 'unknown';
        
        logger.log(`📝 ${operationType.toUpperCase()}: ${operationName}`);
        
        // Log variables if present
        if (requestContext.request.variables && Object.keys(requestContext.request.variables).length > 0) {
          logger.debug(`   Variables: ${JSON.stringify(requestContext.request.variables, null, 2)}`);
        }
      },

      async willSendResponse(requestContext) {
        const duration = Date.now() - startTime;
        const operationName = requestContext.operationName || 'Anonymous';
        
        if (requestContext.errors && requestContext.errors.length > 0) {
          logger.error(`❌ ${operationName} failed in ${duration}ms`);
          requestContext.errors.forEach((error, index) => {
            logger.error(`   Error ${index + 1}: ${error.message}`);
            if (error.extensions?.code) {
              logger.error(`   Code: ${error.extensions.code}`);
            }
            if (error.path) {
              logger.error(`   Path: ${error.path.join('.')}`);
            }
            // Log stack trace in development
            if (process.env.NODE_ENV === 'development' && error.stack) {
              logger.debug(`   Stack: ${error.stack}`);
            }
          });
        } else {
          logger.log(`✅ ${operationName} completed in ${duration}ms`);
        }
      },

      async didEncounterErrors(requestContext) {
        const operationName = requestContext.operationName || 'Anonymous';
        logger.error(`💥 ${operationName} encountered errors:`);
        
        requestContext.errors.forEach((error, index) => {
          logger.error(`   Error ${index + 1}: ${error.message}`);
          logger.error(`   Original Error: ${error.originalError?.message || 'N/A'}`);
          
          // Log full error object in debug mode
          if (process.env.NODE_ENV === 'development') {
            logger.debug(`   Full Error: ${JSON.stringify(error, null, 2)}`);
          }
        });
      },
    };
  }
}
