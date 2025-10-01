import { Project, Task, Timesheet, ProjectStats } from '../types';

class ProjectsService {
  private mockProjects: Project[] = [];

  async getProjects(): Promise<Project[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockProjects);
      }, 500);
    });
  }

  async getProjectById(id: string): Promise<Project | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = this.mockProjects.find(p => p.id === id);
        resolve(project || null);
      }, 300);
    });
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return new Promise((resolve) => {
      const newProject: Project = {
        id: Date.now().toString(),
        name: project.name || '',
        client: project.client || { id: '', name: '' },
        type: project.type || 'web',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        startDate: project.startDate || new Date(),
        dueDate: project.dueDate || new Date(),
        budget: project.budget || 0,
        spent: 0,
        progress: 0,
        manager: project.manager || { id: '', name: '' },
        team: project.team || [],
        description: project.description || '',
        tags: project.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockProjects.push(newProject);
      setTimeout(() => resolve(newProject), 500);
    });
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    return new Promise((resolve) => {
      const index = this.mockProjects.findIndex(p => p.id === id);
      if (index === -1) {
        resolve(null);
        return;
      }
      this.mockProjects[index] = {
        ...this.mockProjects[index],
        ...updates,
        updatedAt: new Date()
      };
      setTimeout(() => resolve(this.mockProjects[index]), 500);
    });
  }

  async deleteProject(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const index = this.mockProjects.findIndex(p => p.id === id);
      if (index === -1) {
        resolve(false);
        return;
      }
      this.mockProjects.splice(index, 1);
      setTimeout(() => resolve(true), 500);
    });
  }

  async getProjectTasks(projectId: string): Promise<Task[]> {
    return new Promise((resolve) => {
      // Mock tasks
      const tasks: Task[] = [];
      setTimeout(() => resolve(tasks), 300);
    });
  }

  async createTask(projectId: string, task: Partial<Task>): Promise<Task> {
    return new Promise((resolve) => {
      const newTask: Task = {
        id: Date.now().toString(),
        projectId,
        title: task.title || '',
        description: task.description,
        status: task.status || 'todo',
        priority: task.priority || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        ...task
      };
      setTimeout(() => resolve(newTask), 500);
    });
  }

  async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
    return new Promise((resolve) => {
      // Mock update
      const updatedTask: Task = {
        id: taskId,
        projectId,
        title: updates.title || '',
        status: updates.status || 'todo',
        priority: updates.priority || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        ...updates
      };
      setTimeout(() => resolve(updatedTask), 500);
    });
  }

  async logTime(entry: Partial<Timesheet>): Promise<Timesheet> {
    return new Promise((resolve) => {
      const newEntry: Timesheet = {
        id: Date.now().toString(),
        projectId: entry.projectId || '',
        userId: entry.userId || '',
        date: entry.date || new Date(),
        hours: entry.hours || 0,
        description: entry.description || '',
        billable: entry.billable ?? true,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system'
      };
      setTimeout(() => resolve(newEntry), 500);
    });
  }

  async getProjectStats(): Promise<ProjectStats> {
    return new Promise((resolve) => {
      const stats: ProjectStats = {
        totalProjects: this.mockProjects.length,
        activeProjects: this.mockProjects.filter(p => p.status === 'active').length,
        completedProjects: this.mockProjects.filter(p => p.status === 'completed').length,
        totalBudget: this.mockProjects.reduce((sum, p) => sum + (p.estimateBudget || 0), 0),
        totalSpent: this.mockProjects.reduce((sum, p) => sum + (p.actualBudget || 0), 0),
        averageProgress: this.mockProjects.reduce((sum, p) => sum + p.completionPercentage, 0) / this.mockProjects.length || 0,
        upcomingDeadlines: this.mockProjects.filter(p => {
          const dueDate = new Date(p.dueDate);
          const now = new Date();
          const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
          return diffDays <= 7 && diffDays > 0;
        }).length,
        overdueProjects: this.mockProjects.filter(p => new Date(p.dueDate) < new Date() && p.status !== 'completed').length
      };
      setTimeout(() => resolve(stats), 300);
    });
  }
}

export const projectsService = new ProjectsService();