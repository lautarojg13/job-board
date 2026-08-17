import { MockRequestContext, MockHandlerResult } from './types';

/**
 * Handles async background tasks and AI resume analysis mock endpoints.
 */
export function handleTaskMock(ctx: MockRequestContext): MockHandlerResult {
  const { path, method } = ctx;

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
    return {
      matched: true,
      data: {
        task_id: taskStatusMatch[1],
        status: 'SUCCESS',
        result: {
          match_score: 92,
          recommendations: ['Strong match for React and Python skills.']
        }
      }
    };
  }

  return null;
}
