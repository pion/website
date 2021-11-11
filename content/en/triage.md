---
title: "Triage"
---

{{<rawhtml>}}
<div id="triage-container">
  <a target="_blank"  href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"> How to create an access token </a><br>
  <label for="user-name">User Name:</label>
  <input type="text" id="user-name" name="user-name"><br>
  <label for="access-token">Access Token:</label>
  <input type="text" id="access-token" name="access-token"><br>
  <button id="access-token-button"> Fetch </button>


  <h2> Issue Count: {pionProjectSummary.issueCount} </h2>
  <h2> PR Count: {pionProjectSummary.pullRequestCount} </h2>

  <h2> Issue/PR Count by Project </h2>
  <table>
    <tr>
      <th>Project</th>
      <th id="issues-header">Issues</th>
      <th id="pull-requests-header">PRs</th>
    </tr>

    <tr rv-each-project="pionProjectData">
      <td>{ project.name }</td>
      <td>{ project.issues.length }</td>
      <td>{ project.pullRequests.length }</td>
    </tr>
  </table>
</div>
{{</rawhtml>}}
