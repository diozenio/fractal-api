import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { SendInstructionDto } from './dto/send-instruction.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendInstruction(
    @Body() sendInstructionDto: SendInstructionDto,
  ): Promise<string> {
    return this.aiService.sendInstruction(sendInstructionDto);
  }
}
