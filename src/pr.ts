import {Octokit} from '@octokit/rest'
import {Options} from './main'
import * as core from '@actions/core'

async function pr(
  octokit: Octokit,
  options: Options,
  ref: string
): Promise<void> {
  try {
    const {data} = await octokit.pulls.get({
      owner: options.owner,
      repo: options.repo,
      pull_number: parseInt(ref.split('refs/pull/')[1].split('/')[0])
    })

    if(typeof data !== 'object') {
      core.setFailed(`Could not find PR ${options.owner}/${options.repo}#${pr}: Missing response data`)
      return
    }

    const author = core.getInput('author')

    if(author ? author.length === 0 : true) {
      core.setFailed(`Unspecified field 'author'`)
      return
    }

    if(!new RegExp(author, 'g').test(data?.user?.login || '')) {
      core.warning(`Ignore pull request because user is not in 'author' field`)
    }

    core.notice(JSON.stringify(data))
  } catch (e: any) {
    core.setFailed(
      `Could not find PR ${options.owner}/${options.repo}#${pr}: ${e.message}`
    )

    return
  }
}

export default pr
