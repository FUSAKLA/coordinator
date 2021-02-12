import {Calendar, momentLocalizer} from 'react-big-calendar'
import moment from 'moment'
import {Event, EventType, ParseEventType} from "../Common"
import "react-big-calendar/lib/css/react-big-calendar.css"
import {Box, Card, CircularProgress, Snackbar, useTheme} from "@material-ui/core";
import "./Calendar.css"
import useFetch from "use-http";
import React from "react";
import {Alert} from "@material-ui/lab";

const localizer = momentLocalizer(moment)

function getEvents(events: Event[]) {
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
    const {loading, error, data = []} = useFetch("/api/v1/events", {}, [])
    let errMsgOpen = false

    const getEventStyle = (event: any, start: any, end: any, isSelected: boolean): { className?: string, style?: Object } => {
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

    let content = []
    if (error) {
        errMsgOpen = true
    }
    if (loading || !data.events) {
        content.push(<Box position="relative" display="inline-flex"><CircularProgress/></Box>)
    } else {
        content.push(
            <Calendar
                localizer={localizer}
                events={getEvents(data.events)}
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
        )
    }


    return (
        <Card style={{padding: "2em"}}>
            {content}
            <Snackbar open={errMsgOpen} autoHideDuration={6000}>
                <Alert severity="error">
                    {error ? error.message : ""}
                </Alert>
            </Snackbar>
        </Card>
    )
}

