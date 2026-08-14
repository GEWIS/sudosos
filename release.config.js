import { releaseConfig } from '@gewis/release-config';

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main'],
  ...releaseConfig,
};
