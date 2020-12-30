import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {

  async createTask(createTaskDto: CreateTaskDto) {
    const {title, description} = createTaskDto
    const newTask = new Task()

    newTask.description = description
    newTask.title = title
    newTask.status = TaskStatus.OPEN
    await newTask.save()

    return newTask;
  }

  async getTasks(getTasksFilterDto: GetTasksFilterDto): Promise<Task[]> {
    const {status, search} = getTasksFilterDto
    const query = this.createQueryBuilder('task')

    if (status) {
      query.andWhere('task.status = :status', { status })
    }
    if (search) {
      query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search: `%${search}%`})
    }

    return await query.getMany()
  }
}