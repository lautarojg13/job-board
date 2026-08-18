import { MockRequestContext, MockHandlerResult } from './types';

/**
 * Handles async background tasks and AI resume analysis mock endpoints.
 */
export function handleTaskMock(ctx: MockRequestContext): MockHandlerResult {
  const { path, method, state } = ctx;

  // AI Resume Analysis triggering
  const resumeAnalysisMatch = path.match(/^\/jobs\/get_resume_analysis\/(\d+)\/$/);
  if (resumeAnalysisMatch && method === 'POST') {
    return {
      matched: true,
      data: {
        task_id: `task_analysis_${resumeAnalysisMatch[1]}`,
        message: 'Análisis de CV iniciado'
      }
    };
  }

  // Celery / async Task Status polling
  const taskStatusMatch = path.match(/^\/jobs\/task-status\/(.+)\/$/);
  if (taskStatusMatch && method === 'GET') {
    const taskId = taskStatusMatch[1];
    if (taskId.startsWith('task_search_')) {
      return {
        matched: true,
        data: {
          task_id: taskId,
          status: 'SUCCESS',
          result: state.jobs
        }
      };
    }

    return {
      matched: true,
      data: {
        task_id: taskId,
        status: 'SUCCESS',
        result: {
          match_percentage: 92,
          matching_skills: ['React', 'TypeScript', 'Python'],
          missing_skills: ['Docker', 'AWS'],
          summary: 'Strong overall match for the role requirements.'
        }
      }
    };
  }

  return null;
}
