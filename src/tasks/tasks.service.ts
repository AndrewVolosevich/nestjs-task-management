import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = []

  getAllTasks(): Task[] {
    return this.tasks
  }

  getTaskById(id: string): Task {
    const found = this.tasks.find(task => task.id === id)
    if(!found) {
      throw new NotFoundException()
    }
    return found
  }

  getTasksWithFilter(getTasksFilterDto: GetTasksFilterDto): Task[] {
    const {status, search} = getTasksFilterDto;
    let tasks = this.getAllTasks()
    if (status) {
      tasks = tasks.filter(task => task.status === status)
    }
    if (search) {
      tasks = tasks.filter(task => task.title.includes(search) || task.description.includes(search))
    }
    return this.tasks
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const {title, description} = createTaskDto
    const task: Task = {
      title,
      description,
      status: TaskStatus.OPEN,
      id: uuidv4(),
    };
    this.tasks.push(task)

    return task
  }

  deleteTask(id: string): Task[] {
    const found = this.getTaskById(id)
    return this.tasks = this.tasks.filter(task => task.id !== found.id)
  }

  updateTask(id: string, status: TaskStatus): Task {
    const task = this.getTaskById(id)
    task.status = status
    return task
  }

}
