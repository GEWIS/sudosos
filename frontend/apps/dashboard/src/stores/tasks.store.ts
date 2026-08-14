import { defineStore } from 'pinia';
import { type TaskResponse } from '@gewis/sudosos-client';
import apiService from '@/services/ApiService';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface TaskFilters {
  status?: TaskStatus[];
  type?: string;
}

export interface FetchTasksOptions {
  filters?: TaskFilters;
  take?: number;
  skip?: number;
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as TaskResponse[],
    total: 0,
    stats: { pending: 0, processing: 0, completed: 0, failed: 0 },
    loading: false,
  }),
  actions: {
    async fetchTasks(options: FetchTasksOptions = {}): Promise<void> {
      this.loading = true;
      try {
        const { filters = {}, take = 50, skip = 0 } = options;
        const status = filters.status && filters.status.length > 0 ? filters.status.join(',') : undefined;
        const resp = await apiService.tasks.listTasks({
          take,
          skip,
          status,
          type: filters.type,
        });
        this.tasks = resp.data.records ?? [];
        this.total = resp.data._pagination?.count ?? this.tasks.length;
      } finally {
        this.loading = false;
      }
    },

    async fetchStats(): Promise<void> {
      const resp = await apiService.tasks.getTaskStats();
      this.stats = resp.data;
    },

    async retryTask(id: number): Promise<TaskResponse> {
      const resp = await apiService.tasks.retryTask({ id });
      const updated = resp.data;
      const idx = this.tasks.findIndex((t) => t.id === id);
      if (idx !== -1) {
        this.tasks.splice(idx, 1, updated);
      }
      return updated;
    },

    /**
     * Merge a server-pushed task update into the visible list. If the row is
     * already on screen we replace it in place; brand-new dispatches get
     * prepended so admins see them appear at the top in real time.
     */
    applyUpdate(task: TaskResponse): void {
      const idx = this.tasks.findIndex((t) => t.id === task.id);
      if (idx !== -1) {
        this.tasks.splice(idx, 1, task);
      } else {
        this.tasks.unshift(task);
      }
    },
  },
});
