import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { User } from 'src/core/domain/models/auth';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async fetch(@CurrentUser() user: User) {
    const tasks = await this.taskService.fetch(user);

    return {
      success: true,
      statusCode: 200,
      data: tasks,
      message: 'Tarefas carregadas com sucesso.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async fetchById(@Param('id') id: string, @CurrentUser() user: User) {
    const task = await this.taskService.fetchById(id, user);

    if (!task) {
      return {
        success: false,
        statusCode: 404,
        message: 'Tarefa não encontrada.',
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: task,
      message: 'Tarefa encontrada com sucesso.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    const task = await this.taskService.create(createTaskDto, user);

    return {
      success: true,
      statusCode: 201,
      data: task,
      message: 'Tarefa criada com sucesso.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    const task = await this.taskService.update(id, updateTaskDto, user);

    if (!task) {
      return {
        success: false,
        statusCode: 404,
        message: 'Tarefa não encontrada.',
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: task,
      message: 'Tarefa atualizada com sucesso.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    const task = await this.taskService.delete(id, user);

    if (!task) {
      return {
        success: false,
        statusCode: 404,
        message: 'Tarefa não encontrada.',
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: null,
      message: 'Tarefa deletada com sucesso.',
    };
  }
}
