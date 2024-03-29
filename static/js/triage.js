const DB_NAME = 'pionProjectData'

let pionProjectData = []
let pionProjectSummary = {issueCount: 0, pullRequestCount: 0}

pionProjectData.push = function () {
  Array.prototype.push.apply(this, arguments)
  pionProjectSummary.issueCount = pionProjectSummary.pullRequestCount = 0
  pionProjectData.forEach(project => {
    pionProjectSummary.issueCount += project.issues.length
    pionProjectSummary.pullRequestCount += project.pullRequests.length
  })
}

let db = null
let dbRequest = window.indexedDB.open(DB_NAME)
dbRequest.onupgradeneeded = function (event) {
  event.target.result.createObjectStore(DB_NAME, {keyPath: 'key'})
}

dbRequest.onsuccess = function (event) {
  db = event.target.result
  db.transaction([DB_NAME], 'readonly').objectStore(DB_NAME).getAll().onsuccess = event => {
    pionProjectData.length = 0
    for (let value of event.target.result) {
      pionProjectData.push(value.project)
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const triageContainer = document.getElementById('triage-container')
  const triageButton = document.getElementById('access-token-button')
  const accessTokenInput = document.getElementById('access-token')
  const userNameInput = document.getElementById('user-name')
  const issuesHeader = document.getElementById('issues-header')
  const pullRequestsHeader = document.getElementById('pull-requests-header')

  if (!triageContainer || !triageButton || !accessTokenInput || !userNameInput || !issuesHeader || !pullRequestsHeader) {
    return
  }

  window.tinybind.binders.project = (el, value) => {
    el.href = `https://github.com/pion/${value}`
    el.target = '_blank'
  }
  window.tinybind.binders.pulls = (el, value) => {
    el.href = `https://github.com/pion/${value}/pulls`
    el.target = '_blank'
  }
  window.tinybind.binders.issues = (el, value) => {
    el.href = `https://github.com/pion/${value}/issues`
    el.target = '_blank'
  }

  window.tinybind.bind(triageContainer, {pionProjectData, pionProjectSummary})

  issuesHeader.onclick = () => {
    pionProjectData.sort((a, b) => b.issues.length - a.issues.length)
  }

  pullRequestsHeader.onclick = () => {
    pionProjectData.sort((a, b) => b.pullRequests.length - a.pullRequests.length)
  }

  triageButton.onclick = () => {
    let headers = new window.Headers()
    headers.append('Authorization', `Basic ${window.btoa(`${userNameInput.value}:${accessTokenInput.value}`)}`)
    pionProjectData.length = 0
    getAllPionRepos({headers}).then(repos => {
      for (const repo of repos) {
        if (repo.archived) {
          continue
        }

        fetchProjectData({headers}, repo.name).then(data => {
          let objectStore = db.transaction([DB_NAME], 'readwrite').objectStore(DB_NAME)
          objectStore.add({key: data.name, project: data})
          pionProjectData.push(data)
        })
      }
    })
  }
})

function getAllPionRepos (httpOptions) {
  return window.fetch('https://api.github.com/users/pion/repos?per_page=1000', httpOptions)
    .then(response => response.json())
}

function fetchProjectData (httpOptions, projectName) {
  return new Promise((resolve, reject) => {
    window.fetch(`https://api.github.com/repos/pion/${projectName}/issues?state=open&per_page=1000`, httpOptions)
      .then(response => response.json())
      .then(result => {
        resolve({issues: result.filter(r => !r.pull_request), pullRequests: result.filter(r => r.pull_request), name: projectName})
      })
  })
}
