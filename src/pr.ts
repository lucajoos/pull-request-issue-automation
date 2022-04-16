import {Octokit} from '@octokit/rest'
import {Options} from './main'
import * as core from '@actions/core'

async function pr(
  octokit: Octokit,
  options: Options,
  ref: string
): Promise<void> {
  return new Promise(async resolve => {
    try {
      const {data} = await octokit.pulls.get({
        owner: options.owner,
        repo: options.repo,
        pull_number: parseInt(ref.split('refs/pull/')[1].split('/')[0])
      })

      core.notice(JSON.stringify(data))

      resolve()
    } catch (e: any) {
      core.warning(
        `Could not find PR ${options.owner}/${options.repo}#${pr}: ${e.message}`
      )
      return null
    }
  })
}

export default pr
