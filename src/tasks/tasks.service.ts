import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TASK_STATUS } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './tasks.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private repo: Repository<Task>) {}

  async getTask(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.repo.createQueryBuilder('task');

    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const task = await query.getMany();
      return task;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.repo.findOneBy({ id, user });

    if (!found) {
      throw new NotFoundException(`Task with ID: ${id} not found`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { description, title } = createTaskDto;

    const task = this.repo.create({
      title,
      description,
      status: TASK_STATUS.OPEN,
      user,
    });

    return this.repo.save(task);
  }

  async deleteTaskById(id: string, user: User): Promise<void> {
    const result = await this.repo.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID: ${id} not found`);
    }
  }

  async updateTaskStatus(
    id: string,
    status: TASK_STATUS,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;

    return this.repo.save(task);
  }
}
