import {TimelineData} from "./TimelineData";
import {Event, Timeline} from "./Timeline"
import React, {useState} from "react";
import {Card, CardContent, Checkbox, FormControlLabel, FormGroup, useTheme} from "@material-ui/core";
import LabelSelector, {Label} from "./LabelSelector";
import {CreateEventFab} from "./CreateEventFab";
import NewEventModal from "./NewEventModal";
import {EventState, EventType, EventTypeLabel, ParseEventState, ParseEventType} from "../App";

function getFilteredItems(showFinished: boolean, showIncidents: boolean, showMaintenance: boolean, showNotice: boolean, labelsFilter: Array<string>) {
    const events = TimelineData.storeEvents
    let items = []
    let allowedEventTypes = []
    if (showIncidents) {
        allowedEventTypes.push(EventType.Incident)
    }
    if (showMaintenance) {
        allowedEventTypes.push(EventType.Maintenance)
    }
    if (showNotice) {
        allowedEventTypes.push(EventType.Notice)
    }
    for (let e of events) {
        if (!showFinished && ParseEventState(e.state) === EventState.Finished) {
            continue
        }
        if (!allowedEventTypes.includes(ParseEventType(e.type))) {
            continue
        }
        if (labelsFilter.length > 0 && !e.labels.some(r => labelsFilter.includes(r))) {
            continue
        }
        items.push(e)
    }
    return items
}

function getItemsLabels(events: Array<Event>) {
    let labels: Array<string> = []
    for (let e of events) {
        labels = labels.concat(e.labels)
    }
    return labels
}


export function FilterableTimeline() {
    const theme = useTheme()
    let labelFilter: Array<string> = []
    const [state, setState] = useState({
        showFinished: true,
        showIncidents: true,
        showMaintenance: true,
        showNotice: true,
        labelFilter: labelFilter,
        newEventModalOpened: false,
    })
    let events = getFilteredItems(state.showFinished, state.showIncidents, state.showMaintenance, state.showNotice, state.labelFilter)
    let uniqueLabels = getItemsLabels(events)
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({...state, [event.target.name]: event.target.checked});
    }
    const handleLabelSelectorChange = (event: any, value: Array<Label>) => {
        setState({...state, labelFilter: value.map(a => a.title)});
    }
    const handleEventLabelClick = (label: string) => {
        if (state.labelFilter.includes(label)) {
            return
        }
        setState({...state, labelFilter: state.labelFilter.concat(label)});
    }
    const handleNewEventClick = () => {
        setState({...state, newEventModalOpened: true});
    }
    const handleNewEventModalClose = () => {
        setState({...state, newEventModalOpened: false});
    }
    return (
        <React.Fragment>
            <Card>
                <CardContent style={{paddingTop: "1em", paddingBottom: "1em"}}>
                    <FormGroup row style={{float: "left", paddingTop: "0.5em"}}>
                        <FormControlLabel
                            label="Finished"
                            name="showFinished"
                            style={{color: theme.palette.text.disabled}}
                            control={<Checkbox checked={state.showFinished} onChange={handleChange}
                                               style={{color: theme.palette.text.disabled}}/>}
                        />
                        <FormControlLabel
                            label={EventTypeLabel(EventType.Incident)}
                            name="showIncidents"
                            style={{color: theme.palette.incident.main}}
                            control={<Checkbox checked={state.showIncidents} onChange={handleChange}
                                               style={{color: theme.palette.incident.main}}/>}
                        />
                        <FormControlLabel
                            label={EventTypeLabel(EventType.Maintenance)}
                            name="showMaintenance"
                            style={{color: theme.palette.maintenance.main}}
                            control={<Checkbox checked={state.showMaintenance} onChange={handleChange}
                                               style={{color: theme.palette.maintenance.main}}/>}
                        />
                        <FormControlLabel
                            label={EventTypeLabel(EventType.Notice)}
                            name="showNotice"
                            style={{color: theme.palette.notice.main}}
                            control={<Checkbox checked={state.showNotice} onChange={handleChange}
                                               style={{color: theme.palette.notice.main}}/>}
                        />
                    </FormGroup>
                    <LabelSelector value={state.labelFilter} options={uniqueLabels} placeholder="Filter by labels"
                                   onChange={handleLabelSelectorChange}/>
                </CardContent>
            </Card>
            <Timeline events={events} handleLabelFilter={handleEventLabelClick}/>
            <CreateEventFab handleClick={handleNewEventClick}/>
            <NewEventModal open={state.newEventModalOpened} handleClose={handleNewEventModalClose}/>
        </React.Fragment>
    );
}
