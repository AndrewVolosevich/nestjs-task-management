import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';
import { BadRequestException } from '@nestjs/common';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {

  async createTask(createTaskDto: CreateTaskDto, user: User) {
    const {title, description} = createTaskDto
    const isExist = await this.findOne({title})
    if(isExist) {
      console.log(isExist);
      throw new BadRequestException({message: 'Already existing task'})
    }
    const newTask = new Task()

    newTask.description = description
    newTask.title = title
    newTask.status = TaskStatus.OPEN
    newTask.user = user
    await newTask.save()
    delete newTask.user

    return newTask;
  }

  async getTasks(getTasksFilterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const {status, search} = getTasksFilterDto
    const query = this.createQueryBuilder('task')

    query.andWhere('task.user = :userId', {userId: user.id})
    if (status) {
      query.andWhere('task.status = :status', { status })
    }
    if (search) {
      query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search: `%${search}%`})
    }

    return await query.getMany()
  }
}