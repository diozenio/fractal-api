import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from 'src/core/domain/models/auth';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async fetch(user: User) {
    const { id } = user;

    // 1. Busca as tarefas do usuário no banco de dados
    const tasks = await this.prisma.task.findMany({
      where: { userId: id },
      omit: { userId: true },
    });

    // 2. Retorna as tarefas encontradas
    return tasks;
  }

  async fetchById(id: string, user: User) {
    const { id: userId } = user;

    // 1. Busca a tarefa pelo ID e usuário no banco de dados
    const task = await this.prisma.task.findUnique({
      where: { id, userId },
      omit: { userId: true },
    });

    // 2. Verifica se a tarefa foi encontrada
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Retorna a tarefa encontrada
    return task;
  }

  async create(createTaskDto: CreateTaskDto, user: User) {
    const { title, description, status, priority, dueDate } = createTaskDto;
    const { id } = user;

    // 1. Cria a tarefa no banco de dados
    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate,
        userId: id,
      },
      omit: { userId: true },
    });

    // 2. Retorna a tarefa criada
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const { title, description, status, priority, dueDate } = updateTaskDto;
    const { id: userId } = user;

    // 1. Atualiza a tarefa no banco de dados
    const task = await this.prisma.task.update({
      data: {
        title,
        description,
        status,
        priority,
        dueDate,
      },
      where: { id, userId },
      omit: { userId: true },
    });

    // 2. Verifica se a tarefa foi encontrada
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Retorna a tarefa atualizada
    return task;
  }

  async delete(id: string, user: User) {
    const { id: userId } = user;

    // 1. Deleta a tarefa do banco de dados
    const task = await this.prisma.task.delete({
      where: { id, userId },
      omit: { userId: true },
    });

    // 2. Verifica se a tarefa foi encontrada
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Retorna uma confirmação de exclusão
    return task;
  }
}
