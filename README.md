# Coordinator

Tool to coordinate maintenance and incidents

> # :construction:  Currently under a heavy construction

## Screenshot
![image](https://user-images.githubusercontent.com/6112562/107794942-5c6b0800-6d58-11eb-8a57-6d6f08812170.png)

## TODO

- [x] add pages to show teams and their on-calls
- [ ] think of a way how to connect team and event
- [x] expose events as [ics calendar](https://github.com/arran4/golang-ical)
- [ ] implement the Grafana [JSON datasource REST API](https://grafana.com/grafana/plugins/simpod-json-datasource)
- [ ] expose Prometheus metrics about current events
- [ ] create issue templates in the storage (GitLab, GitHub)
- [ ] allow creating the events and adding comments
- [ ] add support for creating or linking existing IM(Slack, Mattermost) coordination channels for incidents
- [x] add [calendar visualization of events](http://jquense.github.io/react-big-calendar/examples/index.html)
- [ ] ??? add status page with only `public` marked events
- [ ] cmd client for event management
