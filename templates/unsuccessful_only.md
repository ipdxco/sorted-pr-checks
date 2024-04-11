<%
if (checks.some(({status}) => status !== 'completed')) {
  %>
Some checks haven't completed yet<%
} else {
  if (checks.every(({conclusion}) => conclusion === 'success')) {
    %>
All checks have passed<%
  } else {
    %>
All checks have completed
<%
  }
  const sorted = _.sortBy(checks, ['conclusion', 'status', 'workflow_run.name', 'name', 'workflow_run.event'])
  _.forEach(sorted, (check) => {
    const result = check.conclusion || check.status
    if (result !== 'success') {
      %>
<%= emojis[result] %> <%= descriptions[result] %> [<%= check?.workflow_run?.name || 'Unknown' %> / <%= check.name %> (<%= check?.workflow_run?.event || 'unknown' %>)](<%= check.details_url %>) <%
    }
  })
}%>
