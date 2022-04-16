import {Octokit} from '@octokit/rest'
import {Options} from './main'
import * as core from '@actions/core'

async function pr(
  octokit: Octokit,
  options: Options,
  ref: string
): Promise<void> {
  try {
    const {data: pull} = await octokit.pulls.get({
      owner: options.owner,
      repo: options.repo,
      pull_number: parseInt(ref.split('refs/pull/')[1].split('/')[0])
    })

    if (typeof pull !== 'object') {
      core.setFailed(
        `Could not find PR ${options.owner}/${options.repo}#${pr}: Missing response data`
      )
      return
    }

    const login = pull?.user?.login || ''

    if (!new RegExp(core.getInput('author'), 'g').test(login)) {
      core.warning(`Ignore pull request because user is not in 'author' field`)
      return
    }

    if (!new RegExp(core.getInput('title'), 'g').test(pull.title || '')) {
      core.warning(
        `Ignore pull request because title does not match 'title' field`
      )
      return
    }

    const number = parseInt(
      (pull.title.match(new RegExp(core.getInput('match'), 'g')) || [])[0] ||
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

    core.notice('Assigning issue to author of pull request')

    const {data: issue} = await octokit.rest.issues.get({
      owner: options.owner,
      repo: options.repo,
      issue_number: number
    })

    if (typeof issue !== 'object') {
      core.setFailed(
        `Could not find PR ${options.owner}/${options.repo}#${pr}: Missing response pull`
      )
      return
    }

    octokit.rest.pulls.update({
      owner: options.owner,
      repo: options.repo,
      pull_number: pull.number,
      title: issue.title,
      body: issue.body || undefined
    })

    core.notice('Update pull request data')

    octokit.rest.issues.addLabels({
      owner: options.owner,
      repo: options.repo,
      issue_number: pull.number,
      // @ts-ignore
      labels: issue.labels.map(({name}) => name)
    })

    core.notice('Add labels to pull request')
  } catch (e: any) {
    core.setFailed(
      `Could not find PR ${options.owner}/${options.repo}#${pr}: ${e.message}`
    )

    return
  }
}

export default pr
