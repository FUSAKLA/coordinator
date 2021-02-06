import React from "react";
import {Typography, useTheme} from "@material-ui/core";
import {VerticalTimeline, VerticalTimelineElement} from "react-vertical-timeline-component";
import 'react-vertical-timeline-component/style.min.css';
import {TimelineEventItem} from "./TimelineItem"
import {ParseEventState, ParseEventType} from "../App";
import {format, formatDistanceToNow} from 'date-fns'


function TimelineDateItem(props: { date: Date; }) {
    const theme = useTheme()
    return (
        <VerticalTimelineElement
            className="timeline-date-divider"
            contentArrowStyle={{borderRight: '0px solid white'}}
            style={{margin: "1em 0"}}
            iconStyle={{
                background: theme.palette.background.default,
                borderRadius: "0.15em",
                height: "auto",
                width: "auto",
                color: "white",
                padding: "4pt",
            }}
            icon={<Typography variant="body1"
                              color={"textSecondary"}>{format(props.date, 'dd.MM.yyyy')} - {formatDistanceToNow(props.date)} ago</Typography>}
        />
    )
}

export interface Event {
    id: string
    type: string
    state: string
    title: string
    description: string
    start: string
    end: string
    responsible_person: {
        name: string
        email: string
        avatar_url: string
    }
    number_of_comments: number
    labels: Array<string>
}

export function Timeline(props: { events: Array<Event>; handleLabelFilter: (label: string) => void; }) {
    let lastDate = new Date()
    let items = []
    for (let event of props.events) {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        if (eventStart.getDay() !== lastDate.getDay()) {
            items.push(<TimelineDateItem key={eventStart.toDateString()} date={eventStart}/>)
        }
        items.push((<TimelineEventItem
            key={event.id}
            eventType={ParseEventType(event.type)}
            eventState={ParseEventState(event.state)}
            title={event.title}
            description={event.description}
            start={eventStart}
            end={eventEnd}
            author={event.responsible_person.name}
            numberOfComments={event.number_of_comments}
            labels={event.labels}
            handleLabelFilter={props.handleLabelFilter}
        />))
        lastDate = eventStart
    }
    return (
        <VerticalTimeline layout={"1-column"}>
            {items}
        </VerticalTimeline>
    )
}

