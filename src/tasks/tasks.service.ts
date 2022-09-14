import { Body, Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTasksDto } from './dto/create-task.dto';
import { Tasks } from './tasks.entity';

@Injectable()
export class TasksService {
  // constructor(@InjectRepository(Tasks) private repo: Repository<Tasks>) {}

  private tasks = [];

  getAllTasks() {
    return this.tasks;
  }

  @Post()
  createTasks(@Body() body: CreateTasksDto) {
    return body;
  }
}
