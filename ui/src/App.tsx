import React from 'react';
import {Container, useMediaQuery} from "@material-ui/core";
import {AppWithNavigation} from "./Layout"
import {FilterableTimeline} from "./timeline/FilterableTimeline";
import {ThemedApp} from "./Theme";
import {Build, Help, Info, NotificationsActive} from "@material-ui/icons";
import {Theme} from "@material-ui/core/styles";


export enum EventType {
    Incident = "incident",
    Maintenance = "maintenance",
    Notice = "notice",
    Unknown = "unknown",
}

export const EventTypes = [EventType.Incident, EventType.Maintenance, EventType.Notice]


export enum EventState {
    Active = "active",
    Finished = "finished",
    Unknown = "unknown",
}

export function EventTypeColor(theme: Theme, type: EventType) {
    switch (type) {
        case EventType.Incident: {
            return theme.palette.incident.main.toString()
        }
        case EventType.Maintenance: {
            return theme.palette.maintenance.main.toString()
        }
        case EventType.Notice: {
            return theme.palette.notice.main.toString()
        }
        default: {
            return theme.palette.text.disabled.toString()
        }
    }
}

export function ParseEventState(eventState: string) {
    switch (eventState) {
        case "Active": {
            return EventState.Active
        }
        case "Finished": {
            return EventState.Finished
        }
        default: {
            return EventState.Unknown
        }
    }
}

export function EventTypeLabel(type: EventType) {
    switch (type) {
        case EventType.Incident: {
            return "Incident"
        }
        case EventType.Maintenance: {
            return "Maintenance"
        }
        case EventType.Notice: {
            return "Notice"
        }
        default: {
            return "Unknown event type"
        }
    }
}

export function ParseEventType(typeString: string) {
    switch (typeString) {
        case "Incident": {
            return EventType.Incident
        }
        case "Maintenance": {
            return EventType.Maintenance
        }
        case "Notice": {
            return EventType.Notice
        }
        default: {
            return EventType.Unknown
        }
    }
}

export function EventTypeIcon(props: { type: EventType, theme: any, size?: string | undefined }) {
    switch (props.type) {
        case EventType.Incident: {
            return (
                <NotificationsActive style={{fontSize: props.size, fill: EventTypeColor(props.theme, props.type)}}/>)
        }
        case EventType.Maintenance: {
            return (<Build style={{fontSize: props.size, fill: EventTypeColor(props.theme, props.type)}}/>)
        }
        case EventType.Notice: {
            return (<Info style={{fontSize: props.size, fill: EventTypeColor(props.theme, props.type)}}/>)
        }
        default: {
            return (<Help style={{fontSize: props.size, fill: EventTypeColor(props.theme, props.type)}}/>)
        }
    }
}

function App() {
    let prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    return (
        <ThemedApp dark={prefersDarkMode}>
            <Container>
                <AppWithNavigation title="Events timeline" scrollTop={true}>
                    <FilterableTimeline/>
                </AppWithNavigation>
            </Container>
        </ThemedApp>
    )
}

export default App;
