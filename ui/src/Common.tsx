import React from 'react';
import {Build, Help, Info, NotificationsActive} from "@material-ui/icons";
import {Theme} from "@material-ui/core/styles";


export interface User {
    name: string
    email: string
    avatar_url: string
}

export interface Event {
    id: string
    state: string
    type: string
    service: string
    title: string
    start: number
    end: number
    description: string
    labels: string[]
    responsible_person: User
    number_of_comments: number
}

export interface Person {
    name: string
    email: string
    phone: string
}

export interface Service {
    name: string
    description: string
    url: string
    dashboard_url: string
    im_channel_url: string
    documentation_url: string
    source_code_url: string
}

export interface OnCall {
    vendor: string,
    schedule_name: string,
    person: Person[]
}

export interface Team {
    id: string
    name: string,
    email: string,
    im_channel_url: string,
    dashboard_url: string,
    documentation_url: string,
    managed_services: Service[],
    on_call: OnCall,
}


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
        case "incident": {
            return EventType.Incident
        }
        case "maintenance": {
            return EventType.Maintenance
        }
        case "notice": {
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

