import {Calendar, momentLocalizer} from 'react-big-calendar'
import moment from 'moment'
import {Event} from "../timeline/EventTimeline"
import {TimelineData} from "../timeline/TimelineData";
import "react-big-calendar/lib/css/react-big-calendar.css"
import {EventType, ParseEventType} from "../Common";
import {Card, useTheme} from "@material-ui/core";
import "./Calendar.css"

const localizer = momentLocalizer(moment)

function getEvents(events: Array<Event>) {
    let calEvents = []
    for (let e of events) {
        calEvents.push({
            id: e.id,
            type: e.type,
            title: e.title,
            allDay: false,
            start: e.start,
            end: e.end,
        })
    }
    return calEvents
}


export function EventsCalendar() {
    const theme = useTheme()

    const getEventStyle = (event: object, start: any, end: any, isSelected: boolean): { className?: string, style?: Object } => {
        // @ts-ignore
        console.log(event)
        // @ts-ignore
        switch (ParseEventType(event.type)) {
            case EventType.Incident: {
                return {className: "incident", style: {backgroundColor: theme.palette.incident.main}}
            }
            case EventType.Maintenance: {
                return {className: "maintenance", style: {backgroundColor: theme.palette.maintenance.main}}
            }
            case EventType.Notice: {
                return {className: "notice", style: {backgroundColor: theme.palette.notice.main}}
            }
        }
        return {}
    }


    return (
        <Card>
            <Calendar
                localizer={localizer}
                events={getEvents(TimelineData.storeEvents)}
                startAccessor="start"
                endAccessor="end"
                style={{
                    height: "80vh",
                    backgroundColor: theme.palette.background.paper,
                    paddingTop: "2em",
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                }}
                eventPropGetter={getEventStyle}
            />
        </Card>
    )
}

