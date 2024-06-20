const core = require('@actions/core')
const github = require('@actions/github')
const _ = require('lodash')
const fs = require('fs')

const emojis = {
  success: '✅',
  failure: '❌',
  neutral: '⚪',
  cancelled: '🚫',
  skipped: '⏭️',
  timed_out: '⌛',
  action_required: '⚠️',
  queued: '🟡',
  in_progress: '🟠',
  completed: '🟢',
  waiting: '🕒',
  requested: '🔵',
  pending: '🔵'
}

const descriptions = {
  success: 'Successful',
  failure: 'Failed',
  neutral: 'Neutral',
  cancelled: 'Cancelled',
  skipped: 'Skipped',
  timed_out: 'Timed out',
  action_required: 'Action required',
  queued: 'Queued',
  in_progress: 'In progress',
  completed: 'Completed',
  waiting: 'Waiting',
  requested: 'Requested',
  pending: 'Pending'
}

async function run() {
  try {
    core.info('Retrieving the inputs...')
    const repository = core.getInput('repository')
    const [owner, repo] = repository.split('/').slice(-2)
    const pull_number_option = core.getInput('pull_number')
    const template_name = core.getInput('template')
    const identifier = core.getInput('identifier')
    const token = core.getInput('token')
    core.info(`Repository: ${repository}`)
    core.info(`Pull request number: ${pull_number}`)
    core.info(`Template: ${template_name}`)
    core.info(`Identifier: ${identifier}`)
    core.info(`Token: ${token != null ? '***' : null}`)

    core.info('Listing available templates...')
    const templates = fs.readdirSync(`${__dirname}/templates`)
    core.debug(`Templates: ${JSON.stringify(templates, null, 2)}`)

    core.info('Inferring the template...')
    let template
    if (templates.includes(`${template_name}.md`)) {
      core.info(`Reading in the template from the gallery...`)
      template = fs.readFileSync(`${__dirname}/templates/${template_name}.md`, 'utf8')
    } else {
      core.info(`Treating the template as a lodash template...`)
      template = template_name
    }
    core.debug(`Template: ${template}`)

    core.info('Setting up the GitHub client...')
    const octokit = new github.getOctokit(token)

    core.info('Inferring the pull request number...')
    let pull_number
    if (pull_number_option === '') {
      if (github.context.eventName !== 'workflow_run' || github.context.payload.event !== 'pull_request') {
        throw new Error('The pull request number must be provided when not running in a workflow run event (triggered by pull_request event) context.')
      }
      core.info('Finding matching pull requests...')
      const pull_requests = await octokit.paginate(octokit.rest.issues.search, {
        q: `is:pr repo:${owner}/${repo} head:${github.context.payload.head_branch} base:${github.context.payload.base_branch} ${github.context.payload.commit.id}`
      })
      core.debug(`Pull requests: ${JSON.stringify(pull_requests, null, 2)}`)
      if (pull_requests.length === 0) {
        throw new Error('No pull request found for the commit.')
      }
      if (pull_requests.length > 1) {
        throw new Error('Multiple pull requests found for the commit.')
      }
      pull_number = pull_requests[0].number
    } else {
      pull_number = parseInt(pull_number_option)
    }
    core.info(`Pull request number: ${pull_number}`)

    core.info('Retrieving the pull request...')
    const pull = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number
    })
    core.debug(`Pull request: ${JSON.stringify(pull, null, 2)}`)

    core.info('Retrieving the pull request check runs...')
    const checks = await octokit.paginate(octokit.rest.checks.listForRef, {
      owner,
      repo,
      ref: pull.data.head.sha,
    })
    core.debug(`Checks: ${JSON.stringify(checks, null, 2)}`)

    core.info('Retrieving the workflow runs...')
    const workflowRunRegExp = new RegExp(`https://github.com/${owner}/${repo}/actions/runs/([0-9]+)`)
    const workflowRuns = {}
    for (const check of checks) {
      const match = check.details_url.match(workflowRunRegExp)
      if (match !== null) {
        const run_id = match[1]
        if (workflowRuns[run_id] === undefined) {
          workflowRuns[run_id] = await octokit.rest.actions.getWorkflowRun({
            owner,
            repo,
            run_id
          })
        }
        check.workflow_run = workflowRuns[run_id].data
      }
    }
    core.debug(`Checks: ${JSON.stringify(checks, null, 2)}`)

    core.info('Compiling template...')
    const compiled = _.template(template)

    core.info('Rendering the comment\'s body...')
    const rendered = compiled({pull: pull.data, checks, emojis, descriptions})
    const body = `<!-- ${identifier} -->\n${rendered}`
    core.info(`Comment's body: ${body}`)

    core.info('Trying to retrieve the existing comment...')
    const comments = await octokit.paginate(octokit.rest.issues.listComments, {
      owner,
      repo,
      issue_number: pull_number
    })
    let comment = comments.find(comment => comment.body.startsWith(`<!-- ${identifier} -->`))
    core.debug(`Comments: ${JSON.stringify(comments, null, 2)}`)
    core.debug(`Comment: ${JSON.stringify(comment, null, 2)}`)

    if (comment === undefined) {
      core.info('Creating the comment...')
      comment = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body
      })
    } else {
      core.info('Updating the comment...')
      comment = await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: comment.id,
        body
      })
    }

    core.debug(`Comment: ${JSON.stringify(comment, null, 2)}`)
    core.info(`The comment has been successully posted: ${comment.data.html_url}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
