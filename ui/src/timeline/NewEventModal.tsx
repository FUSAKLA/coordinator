import React, {useState} from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormLabel,
    Grid,
    MenuItem,
    TextField,
    Typography,
    useTheme
} from "@material-ui/core";
import {DateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import LabelSelector, {Label} from "./LabelSelector";
import {EventType, EventTypeIcon, EventTypeLabel, EventTypes} from "../Common";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: "5pt",
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
            width: "50%",
            minWidth: "100pt",
        },
        margin: {
            margin: theme.spacing(1),
        },
        withoutLabel: {
            marginTop: theme.spacing(3),
        },
    }),
);

function getAllLabelValues() {
    return ["foo", "bar"]
}

export default function NewEventModal(props: { open: boolean; handleClose: () => void; }) {
    const theme = useTheme()
    const classes = useStyles();
    const [eventType, setEventType] = useState<string>(EventType.Incident);
    const handleEventTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEventType(event.target.value);
    };
    const [eventDescription, setEventDescription] = useState<string>("");
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
    const [eventStart, handleEventStartChange] = useState<Date | null>(new Date());
    const [eventEnd, handleEventEndChange] = useState<Date | null>(null);
    const [labels, setLabels] = useState<Array<string>>([]);
    const handleLabelSelectorChange = (event: any, value: Array<Label>) => {
        setLabels(value.map(a => a.title));
    }
    return (
        <Dialog
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={props.open}
            onClose={props.handleClose}
            closeAfterTransition
            disableBackdropClick
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                style: {opacity: "50%"},
            }}
        >
            <DialogTitle>
                <Typography variant="h5">Create new event</Typography>
            </DialogTitle>
            <DialogContent style={{overflow: "unset"}}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField id="event-title" fullWidth label="Event title" required/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField id="event-type" fullWidth select label="Event type" defaultValue={eventType}
                                   onChange={handleEventTypeChange} required>
                            {EventTypes.map((t) => (
                                <MenuItem key={t} value={t}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <span style={{marginRight: "0.3em"}}>
                                            <EventTypeIcon type={t} theme={theme} size="small"/>
                                        </span>
                                        {EventTypeLabel(t)}
                                    </div>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Grid item xs={4}>
                            <DateTimePicker
                                value={eventStart}
                                onChange={handleEventStartChange}
                                label="Event start"
                                ampm={false}
                                variant="inline"
                                format="dd/MM/yyyy hh:mm"
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <DateTimePicker
                                value={eventEnd}
                                onChange={handleEventEndChange}
                                label="Event end"
                                ampm={false}
                                format="dd/MM/yyyy hh:mm"
                                variant="inline"
                                fullWidth
                            />
                        </Grid>
                    </MuiPickersUtilsProvider>
                    <Grid item xs={12}>
                        <LabelSelector value={labels} options={getAllLabelValues()}
                                       placeholder="Add event labels"
                                       onChange={handleLabelSelectorChange}/>
                    </Grid>
                    <Grid item xs={12}>
                        <div>
                            <div style={{marginBottom: "0.3em"}}><FormLabel>Event description</FormLabel></div>
                            <ReactMde
                                value={eventDescription}
                                onChange={setEventDescription}
                                selectedTab={selectedTab}
                                onTabChange={setSelectedTab}
                                generateMarkdownPreview={markdown =>
                                    Promise.resolve(<ReactMarkdown source={markdown}/>)
                                }
                            />
                        </div>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="default">
                    Cancel
                </Button>
                <Button onClick={props.handleClose} color="primary">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
