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

    if (typeof data !== 'object') {
      core.setFailed(
        `Could not find PR ${options.owner}/${options.repo}#${pr}: Missing response data`
      )
      return
    }

    const login = data?.user?.login || ''

    if (!new RegExp(core.getInput('author'), 'g').test(login)) {
      core.warning(`Ignore pull request because user is not in 'author' field`)
      return
    }

    if (!new RegExp(core.getInput('title'), 'g').test(data.title || '')) {
      core.warning(
        `Ignore pull request because title does not match 'title' field`
      )
      return
    }

    const number = parseInt(
      (data.title.match(new RegExp(core.getInput('match'), 'g')) || [])[0] ||
        '-1'
    )

    if (number < 0) {
      core.warning(`Could not retrieve issue number out of title`)
      return
    }

    octokit.rest.issues.addAssignees({
      owner: options.owner,
      repo: options.repo,
      issue_number: number,
      assignees: [login]
    })

    core.debug('Assigning issue to author of pull request')

    const issue = await octokit.rest.issues.get({
      owner: options.owner,
      repo: options.repo,
      issue_number: number
    })

    core.notice(JSON.stringify(issue))
  } catch (e: any) {
    core.setFailed(
      `Could not find PR ${options.owner}/${options.repo}#${pr}: ${e.message}`
    )

    return
  }
}

export default pr
