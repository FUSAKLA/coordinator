import {EventTimeline} from "./EventTimeline"
import React, {useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    Snackbar,
    Typography,
    useTheme
} from "@material-ui/core";
import LabelSelector, {Label} from "./LabelSelector";
import {CreateEventFab} from "./CreateEventFab";
import NewEventModal from "./NewEventModal";
import {Event, EventState, EventType, EventTypeLabel, ParseEventState, ParseEventType} from "../Common";
import useFetch from "use-http";
import {Alert} from "@material-ui/lab";


function filterEvents(events: Event[], showFinished: boolean, showIncidents: boolean, showMaintenance: boolean, showNotice: boolean, labelFilter: string[]) {
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
        if (labelFilter.length > 0 && !e.labels.some((r: string) => labelFilter.includes(r))) {
            continue
        }
        items.push(e)
    }
    return items
}

function getUniqueLabels(events: Event[]) {
    let labels: string[] = []
    for (let e of events) {
        labels = labels.concat(e.labels)
    }
    return labels.sort().filter(function (item, pos, ary) {
        return !pos || item !== ary[pos - 1];
    });
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

    let params = [
        "limit=30",
    ]
    const {
        loading,
        error,
        data = []
    } = useFetch("/api/v1/events?" + params.join("&"), {
        retries: 10,
        retryDelay: 5000
    }, [state.newEventModalOpened, state.showMaintenance, state.showIncidents, state.showNotice])
    let errMsgOpen = false


    let uniqueLabels: string[] = []

    let content = []
    if (error) {
        errMsgOpen = true
    }
    if (loading || !data.events) {
        content.push(<Box><CircularProgress style={{position: "relative", left: "48%", top: "3em"}}/></Box>)
    } else {
        uniqueLabels = getUniqueLabels(data.events)
        let filteredEvents = filterEvents(data.events, state.showFinished, state.showIncidents, state.showMaintenance, state.showNotice, state.labelFilter)
        if (filteredEvents.length === 0) {
            content.push(<Typography variant="caption">No events matching the filter found</Typography>)
        } else {
            content.push(<EventTimeline events={filteredEvents} handleLabelFilter={handleEventLabelClick}/>)
        }
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
            {content}
            <CreateEventFab handleClick={handleNewEventClick}/>
            <NewEventModal open={state.newEventModalOpened} knownLabels={uniqueLabels}
                           handleClose={handleNewEventModalClose}/>
            <Snackbar open={errMsgOpen} autoHideDuration={6000}>
                <Alert severity="error">
                    {error ? error.message : ""}
                </Alert>
            </Snackbar>
        </React.Fragment>
    );
}
