import { AI_PROMPT } from './../constants/ai';
import OpenAI from 'openai';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SendInstructionDto } from './dto/send-instruction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/core/domain/models/auth';

@Injectable()
export class AiService {
  private readonly ai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async sendInstruction(sendInstructionDto: SendInstructionDto, user: User) {
    const { input, parentId } = sendInstructionDto;

    const task = await this.prisma.task.findUnique({
      where: { id: parentId },
    });

    if (!task) {
      throw new UnauthorizedException(
        'Task not found or you do not have permission to access it',
      );
    }

    const prompt = AI_PROMPT.replace('{{ input }}', input);

    const response = await this.ai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: 256,
      temperature: 0.5,
    });

    const raw = response.choices[0].text.trim();

    if (!raw) {
      throw new UnauthorizedException(
        'No response text received from OpenAI API',
      );
    }

    const subtasks = raw
      .split('\n')
      .filter((line) => line.length > 0)
      .map((title) => ({ title, parentId, userId: user.id }));

    const createdSubtasks = await this.prisma.task.createMany({
      data: subtasks,
    });

    return createdSubtasks;
  }
}
