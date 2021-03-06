import React from "react";
import 'react-vertical-timeline-component/style.min.css';
import {TimelineDateItem, TimelineEventItem} from "./TimelineItem"
import {Event, ParseEventState, ParseEventType} from "../Common";
import {Timeline} from "@material-ui/lab";

export function EventTimeline(props: { events: Event[]; handleLabelFilter: (label: string) => void; }) {
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
        <Timeline align="left" style={{marginTop: 0, paddingTop: 0}}>
            {items}
        </Timeline>
    )
}

