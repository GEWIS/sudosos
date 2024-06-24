import { execSync } from 'child_process';

export default function useGitInfo(): Record<string, any> {
  let branch: string, commit: string;
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    commit = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    console.error(error);
    branch = 'unknown';
    commit = 'unknown';
  }

  console.error(branch, commit);

  return {
    __GIT_BRANCH__: JSON.stringify(branch),
    __GIT_COMMIT__: JSON.stringify(commit),
  };
}
