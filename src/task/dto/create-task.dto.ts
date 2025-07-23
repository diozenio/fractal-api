import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { TaskStatus, TaskPriority } from 'src/core/domain/models/task';
import { IsDueDateInFuture } from '../decorators/is-duedate-in-future';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório.' })
  title!: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message:
      'O status da tarefa deve ser um dos seguintes: PLANNED, TO_DO, IN_PROGRESS, DONE, CANCELED.',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message:
      'A prioridade da tarefa deve ser uma das seguintes: LOW, MEDIUM, HIGH, URGENT.',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data de vencimento deve ser uma data válida.' },
  )
  @IsDueDateInFuture()
  dueDate?: string;
}
