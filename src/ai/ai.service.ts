import { AI_PROMPT } from './../constants/ai';
import OpenAI from 'openai';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SendInstructionDto } from './dto/send-instruction.dto';

@Injectable()
export class AiService {
  private readonly ai: OpenAI;

  constructor() {
    this.ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async sendInstruction(
    sendInstructionDto: SendInstructionDto,
  ): Promise<string> {
    const { input } = sendInstructionDto;

    const prompt = AI_PROMPT.replace('{{ input }}', input);

    const response = await this.ai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: 256,
      temperature: 0.5,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new UnauthorizedException(
        'No response text received from OpenAI API',
      );
    }

    return response.choices[0].text.trim();
  }
}
