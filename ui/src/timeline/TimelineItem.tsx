import React, {useState} from "react";
import {Card, Chip, Collapse, createStyles, Divider, IconButton, Typography, useTheme} from "@material-ui/core";
import clsx from "clsx";
import {ExpandMore, Person, QuestionAnswer} from "@material-ui/icons";
import ReactMarkdown from "react-markdown";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {EventState, EventType, EventTypeIcon} from "../Common";
import {
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator
} from "@material-ui/lab";
import {format, formatDistanceToNow} from "date-fns";

const gfm = require('remark-gfm')


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        eventCard: {
            padding: "1em 2em 1em 2em",
        },
        eventCardArrow: {
            border: "solid 10px transparent",
            borderRightColor: theme.palette.background.paper,
            position: "absolute",
            margin: "0.8em 0 0 -1.4em",
            zIndex: 100,
        },
        eventSubheader: {
            marginTop: "0.5em",
            marginBottom: "0.3em",
        },
        eventSubheaderItem: {
            marginRight: "0.5em",
        },
        eventLabel: {
            marginRight: "0.3em"
        },
        separatorWithoutDot: {
            marginLeft: "1.2em",
        },
        dateItemText: {
            bottom: "1em",
            position: "absolute",
        },
        timelineLine: {
            backgroundColor: theme.palette.background.paper,
        },
        expand: {
            position: "absolute",
            right: "0pt",
            marginRight: "1em",
            transform: 'rotate(0deg)',
            marginLeft: 'auto',
            transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shortest,
            }),
        },
        expandOpen: {
            transform: 'rotate(180deg)',
        },
        eventSubheaderIcon: {
            verticalAlign: "middle",
            fontSize: "medium",
            marginRight: "0.1em"
        },
        oppositeContent: {
            flex: 0
        }
    }),
);

function EventLabels(props: { labels: Array<string>; handleLabelFilter: (label: string) => void; }) {
    const classes = useStyles()
    let labels = []
    for (let l of props.labels) {
        labels.push(<Chip
            id={l}
            key={l}
            variant="default"
            size="small"
            label={l}
            style={{marginLeft: "0.5em"}}
            onClick={() => {
                props.handleLabelFilter(l)
            }}
        />)
    }
    return (
        <span className={classes.eventLabel}>
            {labels}
        </span>
    )
}

export function TimelineDateItem(props: { date: Date; }) {
    const classes = useStyles();
    return (
        <TimelineItem>
            <TimelineOppositeContent className={classes.oppositeContent}/>
            <TimelineSeparator className={classes.separatorWithoutDot}>
                <TimelineConnector className={classes.timelineLine}/>
            </TimelineSeparator>
            <TimelineContent>
                <Typography variant="body1" color={"textSecondary"} className={classes.dateItemText}>
                    {format(props.date, 'dd.MM.yyyy')} - {formatDistanceToNow(props.date)} ago
                </Typography>
            </TimelineContent>
        </TimelineItem>
    )
}

export function TimelineEventItem(props: { start: Date, end: Date; eventType: EventType, eventState: EventState; title: string; description: string; author: string; numberOfComments: number; labels: Array<string>; handleLabelFilter: (label: string) => void; }) {
    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    const theme = useTheme();
    return (
        <TimelineItem>
            <TimelineOppositeContent className={classes.oppositeContent}/>
            <TimelineSeparator>
                <TimelineDot className={classes.timelineLine}>
                    <EventTypeIcon type={props.eventType} theme={theme}/>
                </TimelineDot>
                <TimelineConnector className={classes.timelineLine}/>
            </TimelineSeparator>
            <TimelineContent>
                <div className={classes.eventCardArrow}/>
                <Card className={classes.eventCard}>
                    <IconButton
                        className={clsx(classes.expand, {
                            [classes.expandOpen]: expanded,
                        })}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMore/>
                    </IconButton>
                    <Typography variant={"h5"} color={"textPrimary"}>{props.title}</Typography>
                    <Typography variant={"body1"} color={"textSecondary"} className={classes.eventSubheader}>
                        <span className={classes.eventSubheaderItem}>
                            <Person className={classes.eventSubheaderIcon}/> {props.author}
                        </span>
                        <span className={classes.eventSubheaderItem}>
                            <QuestionAnswer className={classes.eventSubheaderIcon}/> {props.numberOfComments}
                        </span>
                        <span className={classes.eventSubheaderItem}>
                            <EventLabels labels={props.labels} handleLabelFilter={props.handleLabelFilter}/>
                        </span>
                    </Typography>
                    <Collapse style={{overflow: "auto"}} in={expanded} timeout="auto" unmountOnExit>
                        <Divider variant={"fullWidth"}/>
                        <Typography variant={"body1"} color={"textSecondary"}>
                            <ReactMarkdown plugins={[gfm]}>{props.description}</ReactMarkdown>
                        </Typography>
                    </Collapse>
                </Card>
            </TimelineContent>
        </TimelineItem>
    )
}
