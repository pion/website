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
      <th id="issues-header"><a href="#"> Issues </a> </th>
      <th id="pull-requests-header"><a href="#"> PRs </a> </th>
    </tr>

    <tr rv-each-project="pionProjectData">
      <td><a rv-project="project.name">{ project.name }</a></td>
      <td><a rv-issues="project.name">{ project.issues.length }</a></td>
      <td><a rv-pulls="project.name">{ project.pullRequests.length }</a></td>
    </tr>
  </table>
</div>
{{</rawhtml>}}
