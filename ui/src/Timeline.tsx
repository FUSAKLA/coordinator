import React from "react";
import {Timeline, TimelineItem, TimelineOppositeContent} from "@material-ui/lab";
import {Typography} from "@material-ui/core";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import TimelineDot from "@material-ui/lab/TimelineDot";
import {Build, Info, NotificationsActive, Person, QuestionAnswer} from "@material-ui/icons";
import TimelineContent from "@material-ui/lab/TimelineContent";
import {TimelineData} from "./TimelineData"
import TimelineConnector from "@material-ui/lab/TimelineConnector";

const EventTypes = Object.freeze({"incident": 0, "maintenance": 1, "info": 2})

function parseEventType(typeString: string) {
    switch (typeString) {
        case "Incident": {
            return EventTypes.incident
        }
        case "Maintenance": {
            return EventTypes.maintenance
        }
        default: {
            return EventTypes.info
        }
    }
}


function EventTimelineBullet(props: { eventType: any; }) {
    let icon
    switch (props.eventType) {
        case EventTypes.incident: {
            icon = <NotificationsActive color={"error"}/>
            break
        }
        case EventTypes.maintenance: {
            icon = <Build color={"action"}/>
            break
        }
        default: {
            icon = <Info color={"disabled"}/>
            break
        }
    }
    return <TimelineDot children={icon} variant={"outlined"}/>
}


function EventTimelineItem(props: { start: React.ReactNode, end: React.ReactNode; eventType: React.ReactNode; title: React.ReactNode; author: React.ReactNode; numberOfComments: React.ReactNode }) {
    return (
        <TimelineItem>
            <TimelineOppositeContent>
                <Typography variant="caption" color="textSecondary">{props.start}</Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
                <EventTimelineBullet eventType={props.eventType}/><TimelineConnector/>
            </TimelineSeparator>
            <TimelineContent>
                <Typography variant="h5" color="primary"> {props.title} </Typography>
                <Typography variant="body1" color="textSecondary"> <Person/> {props.author}
                    <QuestionAnswer/> {props.numberOfComments} </Typography>
            </TimelineContent>
        </TimelineItem>
    )
}

export function EventTimeline() {
    const events = TimelineData.storeEvents
    return (
        <Timeline>
            {events.map((event) => <EventTimelineItem key={event.id} eventType={parseEventType(event.type)}
                                                      title={event.title}
                                                      start={event.start} author={event.responsible_person.name}
                                                      end={event.end} numberOfComments={event.number_of_comments}/>)}
        </Timeline>
    )
}
