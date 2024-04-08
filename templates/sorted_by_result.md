<%
if (checks.some(({status}) => status !== 'completed')) {
  %>
Some checks haven't completed yet<%
} else {
  %>
All checks have completed
<%
  const sorted = _.sortBy(checks, ['conclusion', 'status', 'workflow_run.name', 'name', 'workflow_run.event'])
  _.forEach(sorted, (check) => {
    const result = check.conclusion || check.status
    %>
<%= emojis[result] %> <%= descriptions[result] %> [<%= check.workflow_run.name %> / <%= check.name %> (<%= check.workflow_run.event %>)](<%= check.details_url %>) <%
  })
}%>
