import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { GameEvent, PlayerEventParticipation } from '../graphql/models/event.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class EventResolver {
  constructor(private eventService: EventService) {}

  @Query(() => [GameEvent])
  async activeEvents() {
    const events = await this.eventService.getActiveEvents();
    return events.map(e => ({
      ...e,
      eventType: e.event_type,
      startDate: e.start_date,
      endDate: e.end_date,
      isActive: e.is_active,
      createdAt: e.created_at,
    }));
  }

  @Query(() => PlayerEventParticipation, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async myParticipation(
    @CurrentUser() user: any,
    @Args('eventId') eventId: string,
  ) {
    const p = await this.eventService.getParticipation(user.id, eventId);
    if (!p) return null;
    return this.transformParticipation(p);
  }

  @Mutation(() => PlayerEventParticipation)
  @UseGuards(JwtAuthGuard)
  async joinEvent(
    @CurrentUser() user: any,
    @Args('eventId') eventId: string,
    @Args('choice') choice: string,
  ) {
    const p = await this.eventService.joinEvent(user.id, eventId, choice);
    return this.transformParticipation(p);
  }

  @Mutation(() => PlayerEventParticipation)
  @UseGuards(JwtAuthGuard)
  async contributeToEvent(
    @CurrentUser() user: any,
    @Args('eventId') eventId: string,
    @Args('amount', { type: () => Int }) amount: number,
  ) {
    const p = await this.eventService.contributeToEvent(user.id, eventId, amount);
    return this.transformParticipation(p);
  }

  private transformParticipation(p: any): PlayerEventParticipation {
    return {
      ...p,
      playerId: p.player_id,
      eventId: p.event_id,
      contributionPoints: p.contribution_points,
      rewardsClaimed: p.rewards_claimed,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      event: {
        ...p.event,
        eventType: p.event.event_type,
        startDate: p.event.start_date,
        endDate: p.event.end_date,
        isActive: p.event.is_active,
        createdAt: p.event.created_at,
      },
    };
  }
}
