import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { SendInstructionDto } from './dto/send-instruction.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/core/domain/models/auth';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendInstruction(
    @Body() sendInstructionDto: SendInstructionDto,
    @CurrentUser() user: User,
  ) {
    const subtasks = await this.aiService.sendInstruction(
      sendInstructionDto,
      user,
    );

    return {
      success: true,
      statusCode: 200,
      data: subtasks,
      message: 'Subtasks created successfully.',
    };
  }
}
