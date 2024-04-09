<%
if (checks.some(({status}) => status !== 'completed')) {
  %>
Some checks haven't completed yet<%
} else {
  %>
All checks have completed<%
  const grouped = _.groupBy(checks, ({status, conclusion}) => conclusion || status)
  const sortedGroups = _.pick(grouped, Object.keys(grouped).sort())
  _.forEach(sortedGroups, (checks, result) => {
    %>
<details><summary>

### <%= emojis[result] %> <%= descriptions[result] %> (<%= checks.length %>)
</summary>
<%
    const sorted = _.sortBy(checks, ['workflow_run.name', 'name', 'workflow_run.event'])
    _.forEach(sorted, (check) => {
      %>
[<%= check?.workflow_run?.name || 'Unknown' %> / <%= check.name %> (<%= check?.workflow_run?.event || 'unknown' %>)](<%= check.details_url %>)<%
    })
    %>
</details>
<%
  })
}%>
