import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PlayerModule } from './player/player.module';
import { ProvinceModule } from './province/province.module';
import { ProvinceDataModule } from './province/province-data.module';
import { HeroModule } from './hero/hero.module';
import { PetModule } from './pet/pet.module';
import { StoryModule } from './story/story.module';
import { ResourceModule } from './resource/resource.module';
import { ResourceSynergyModule } from './resource/resource-synergy.module';
import { EraProgressionModule } from './era/era-progression.module';
import { RelicModule } from './relic/relic.module';
import { CraftingModule } from './crafting/crafting.module';
import { EventModule } from './event/event.module';
import { PvPModule } from './pvp/pvp.module';
import { RedisModule } from './redis/redis.module';
import { GraphQLLoggingPlugin } from './graphql/plugins/logging.plugin';

@Module({
  imports: [
    // Prisma Database Module
    PrismaModule,
    
    // Authentication Module
    AuthModule,
    
    // Player Module
    PlayerModule,
    
    // Province Module
    ProvinceModule,
    
    // Province Data Module (MVP2 Sprint 5 - 63 Provinces)
    ProvinceDataModule,
    
    // Hero Module
    HeroModule,
    
    // Pet Module (MVP2 Sprint 3)
    PetModule,
    
    // Story & Quiz Module
    StoryModule,
    
    // Resource Module
    ResourceModule,
    
    // Resource Synergy Module (MVP2 Sprint 4)
    ResourceSynergyModule,
    
    // Era Progression Module (MVP2 Sprint 4)
    EraProgressionModule,

    // Relic Module (Era 1 Features)
    RelicModule,
    
    // PvP Module (Optimization Week 2)
    PvPModule,
    
    // Redis Cache Module (Optimization Week 3)
    RedisModule,
    
    // GraphQL Module with Code-First approach
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
      formatError: (error) => {
        const isDev = process.env.NODE_ENV === 'development';
        console.error('🔴 GraphQL Error:', {
          message: error.message,
          code: error.extensions?.code,
          path: error.path,
          ...(isDev && { originalError: error.extensions?.originalError }),
        });
        
        return {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          path: error.path,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, GraphQLLoggingPlugin],
})
export class AppModule {}
