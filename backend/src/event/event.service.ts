import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private prisma: PrismaService) {}

  async getActiveEvents() {
    return (this.prisma as any).gameEvent.findMany({
      where: {
        is_active: true,
        start_date: { lte: new Date() },
        end_date: { gte: new Date() },
      },
    });
  }

  async getParticipation(playerId: string, eventId: string) {
    return (this.prisma as any).playerEventParticipation.findUnique({
      where: {
        player_id_event_id: {
          player_id: playerId,
          event_id: eventId,
        },
      },
      include: { event: true },
    });
  }

  async joinEvent(playerId: string, eventId: string, choice: string) {
    const event = await (this.prisma as any).gameEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (!event.is_active) throw new BadRequestException('Event is not active');

    return (this.prisma as any).playerEventParticipation.upsert({
      where: {
        player_id_event_id: {
          player_id: playerId,
          event_id: eventId,
        },
      },
      update: { choice },
      create: {
        player_id: playerId,
        event_id: eventId,
        choice,
      },
      include: { event: true },
    });
  }

  async contributeToEvent(playerId: string, eventId: string, amount: number) {
    const participation = await this.getParticipation(playerId, eventId);
    if (!participation) throw new BadRequestException('You are not participating in this event');
    
    const event = participation.event;
    const choice = participation.choice;
    
    // Resource logic based on choice
    const resourceType = choice === 'SON_TINH' ? 'stone' : 'rice';
    
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new NotFoundException('Player not found');

    const resources = typeof player.resources === 'string' 
      ? JSON.parse(player.resources as string) 
      : (player.resources as any);

    if ((resources[resourceType] || 0) < amount) {
      throw new BadRequestException(`Không đủ ${resourceType === 'stone' ? 'Đá' : 'Lúa'} để đóng góp`);
    }

    // Deduct and Update
    const newResources = {
      ...resources,
      [resourceType]: (resources[resourceType] || 0) - amount,
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { id: playerId },
        data: { resources: newResources },
      });

      await (tx as any).playerEventParticipation.update({
        where: { id: participation.id },
        data: {
          contribution_points: { increment: amount },
        },
      });
    });

    this.logger.log(`🌊 Player ${playerId} contributed ${amount} ${resourceType} to ${event.name} as ${choice}`);
    
    return this.getParticipation(playerId, eventId);
  }
}
