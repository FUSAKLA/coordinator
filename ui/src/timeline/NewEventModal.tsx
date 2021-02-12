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
    Snackbar,
    TextField,
    Typography,
    useTheme
} from "@material-ui/core";
import {DateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import LabelSelector, {Label} from "./LabelSelector";
import {EventType, EventTypeIcon, EventTypeLabel, EventTypes} from "../Common";
import {Alert} from "@material-ui/lab";
import {useFormik} from 'formik';
import * as yup from 'yup';

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

const validationSchema = yup.object({
    title: yup.string().required('You have to specify event title'),
    type: yup.string(),
    start: yup.date().nullable().required(),
    end: yup.date().nullable(),
});

export default function NewEventModal(props: { open: boolean; knownLabels: string[], handleClose: () => void; }) {
    const theme = useTheme()
    const classes = useStyles();
    const formik = useFormik({
        initialValues: {
            title: '',
            type: EventType.Incident,
            start: new Date(),
            end: null,
        },
        validationSchema: validationSchema,
        onSubmit: (values: any) => {
            setSuccessMsgOpen(false)
            setErrorMsgOpen(false)
            fetch('/api/v1/events', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: formik.values.type,
                    title: formik.values.title,
                    start: formik.values.start,
                    end: formik.values.end,
                    description: eventDescription,
                    labels: labels,
                })
            }).then((result) => {
                    switch (result.status) {
                        case 200: {
                            setSuccessMsgOpen(true)
                            return
                        }
                        case 401: {
                            setErrorMsgOpen(true)
                            setErrorMsg("Unauthorized, you have to log in to create events")
                            return
                        }
                        default: {
                            setErrorMsgOpen(true)
                            setErrorMsg(result.statusText)
                        }
                    }
                },
                (error) => {
                    setErrorMsgOpen(true)
                    setErrorMsg(error.message)
                })
        },
    });
    const [errorMsgOpen, setErrorMsgOpen] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [successMsgOpen, setSuccessMsgOpen] = useState<boolean>(false);
    const [eventDescription, setEventDescription] = useState<string>("");
    const [labels, setLabels] = useState<Array<string>>([]);
    const handleLabelSelectorChange = (event: any, value: Array<Label>) => {
        setLabels(value.map(a => a.title));
    }

    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");


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
            <form onSubmit={formik.handleSubmit}>
                <DialogTitle>
                    <Typography variant="h5">Create new event</Typography>
                </DialogTitle>
                <DialogContent style={{overflow: "unset"}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                id="title"
                                name="title"
                                fullWidth
                                label="Event title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                id="type"
                                name="type"
                                fullWidth
                                select
                                label="Event type"
                                value={formik.values.type}
                                onChange={formik.handleChange}
                                error={formik.touched.type && Boolean(formik.errors.type)}
                                helperText={formik.touched.type && formik.errors.type}
                            >
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
                                    label="Event start"
                                    name="start"
                                    id="start"
                                    ampm={false}
                                    variant="inline"
                                    format="dd/MM/yyyy hh:mm"
                                    fullWidth
                                    value={formik.values.start}
                                    onChange={value => formik.setFieldValue("start", value)}
                                    error={formik.touched.start && Boolean(formik.errors.start)}
                                    helperText={formik.touched.start && formik.errors.start}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <DateTimePicker
                                    id="end"
                                    name="end"
                                    label="Event end"
                                    ampm={false}
                                    format="dd/MM/yyyy hh:mm"
                                    variant="inline"
                                    fullWidth
                                    value={formik.values.end}
                                    onChange={value => formik.setFieldValue("end", value)}
                                    error={formik.touched.end && Boolean(formik.errors.end)}
                                    helperText={formik.touched.end && formik.errors.end}
                                />
                            </Grid>
                        </MuiPickersUtilsProvider>
                        <Grid item xs={12}>
                            <LabelSelector value={labels} options={props.knownLabels}
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
                    <Button type="submit" color="primary">
                        Create
                    </Button>
                </DialogActions>
            </form>
            <Snackbar open={errorMsgOpen} autoHideDuration={3000} onClose={() => setErrorMsgOpen(false)}>
                <Alert severity="error">
                    {errorMsg !== "" ? errorMsg : "Failed to create new event"}
                </Alert>
            </Snackbar>
            <Snackbar open={successMsgOpen} autoHideDuration={3000} onClose={() => setSuccessMsgOpen(false)}>
                <Alert severity="success">
                    Event {formik.values.title} created.
                </Alert>
            </Snackbar>
        </Dialog>
    );
}
