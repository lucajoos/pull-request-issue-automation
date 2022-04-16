import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/rest'
import pr from './pr'

export type Options = {
  token: string
  owner: string
  repo: string
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('token') || process.env.GITHUB_TOKEN || ''
    const owner = core.getInput('owner') || github.context.repo.owner || ''
    const repo = core.getInput('repo') || github.context.repo.repo || ''

    if (token ? token.length === 0 : true) {
      core.setFailed(`Unspecified field 'token'`)
      return
    }

    if (owner ? owner.length === 0 : true) {
      core.setFailed(`Unspecified field 'owner'`)
      return
    }

    if (repo ? repo.length === 0 : true) {
      core.setFailed(`Unspecified field 'repo'`)
      return
    }

    const options: Options = {token, owner, repo}

    const ref = core.getInput('ref')

    if (ref ? ref.length === 0 : true) {
      core.setFailed(`Unspecified field 'ref' is required for type 'pr'`)
      return
    }

    const octokit = new Octokit({
      auth: `token ${options.token}`,
      baseUrl: 'https://api.github.com'
    })

    await pr(octokit, options, ref)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
