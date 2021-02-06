import React, {useState} from "react";
import {Chip, Collapse, createStyles, Divider, IconButton, Typography, useTheme} from "@material-ui/core";
import clsx from "clsx";
import {ExpandMore, Person, QuestionAnswer} from "@material-ui/icons";
import ReactMarkdown from "react-markdown";
import {VerticalTimelineElement} from "react-vertical-timeline-component";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {EventState, EventType, EventTypeColor, EventTypeIcon} from "../App";

const gfm = require('remark-gfm')


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        expand: {
            position: "absolute",
            right: "0pt",
            marginRight: "5pt",
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
            marginLeft: "1em",
            marginRight: "0.1em"
        }
    }),
);

function EventLabels(props: { labels: Array<string>; handleLabelFilter: (label: string) => void; }) {
    let labels = []
    for (let l of props.labels) {
        labels.push(<Chip
            id={l}
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
        <span style={{marginLeft: "0.5em"}}>
            {labels}
        </span>
    )
}

function TimelineEventContent(props: { title: string; author: string; numberOfComments: number; description: string; labels: Array<string>; handleLabelFilter: (label: string) => void; }) {
    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    return (
        <div>
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
            <Typography variant={"body1"} color={"textSecondary"} style={{marginTop: 0, paddingBottom: "4pt"}}>
                <span>
                    <Person className={classes.eventSubheaderIcon}/> {props.author}
                </span>
                <span>
                    <QuestionAnswer className={classes.eventSubheaderIcon}/> {props.numberOfComments}
                </span>
                <EventLabels labels={props.labels} handleLabelFilter={props.handleLabelFilter}/>
            </Typography>
            <Collapse style={{overflow: "auto"}} in={expanded} timeout="auto" unmountOnExit>
                <Divider variant={"fullWidth"}/>
                <Typography variant={"body1"} color={"textSecondary"}>
                    <ReactMarkdown plugins={[gfm]}>{props.description}</ReactMarkdown>
                </Typography>
            </Collapse>
        </div>
    )
}


export function TimelineEventItem(props: { start: Date, end: Date; eventType: EventType, eventState: EventState; title: string; description: string; author: string; numberOfComments: number; labels: Array<string>; handleLabelFilter: (label: string) => void; }) {
    const theme = useTheme();
    return (
        <VerticalTimelineElement
            className="{props.eventType}"
            contentStyle={{
                background: theme.palette.background.paper,
                borderTop: `5pt solid ${EventTypeColor(theme, props.eventType)}`,
                opacity: props.eventState === EventState.Finished ? "50%" : "100%",
                boxShadow: "rgba(24, 26, 27, 0.2) 0px 2px 1px -1px, rgba(24, 26, 27, 0.14) 0px 1px 1px 0px, rgba(24, 26, 27, 0.12) 0px 1px 3px 0px"
            }}
            contentArrowStyle={{
                borderRight: `7px solid ${theme.palette.background.paper}`,
            }}
            date={props.start.toLocaleString()}
            style={{margin: "1em 0"}}
            iconStyle={{
                top: "0.5em",
                background: theme.palette.background.default
            }}
            icon={<EventTypeIcon type={props.eventType} theme={theme}/>}
        >
            <TimelineEventContent title={props.title} author={props.author} description={props.description}
                                  numberOfComments={props.numberOfComments} labels={props.labels}
                                  handleLabelFilter={props.handleLabelFilter}/>
        </VerticalTimelineElement>
    )
}
