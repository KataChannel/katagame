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
import { HeroModule } from './hero/hero.module';
import { StoryModule } from './story/story.module';
import { ResourceModule } from './resource/resource.module';

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
    
    // Hero Module
    HeroModule,
    
    // Story & Quiz Module
    StoryModule,
    
    // Resource Module
    ResourceModule,
    
    // GraphQL Module with Code-First approach
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
      formatError: (error) => {
        return {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          path: error.path,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
