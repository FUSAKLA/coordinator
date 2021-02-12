import "react-big-calendar/lib/css/react-big-calendar.css"
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    CircularProgress,
    Divider,
    Grid,
    Snackbar,
    Typography
} from "@material-ui/core";
import React from 'react';
import {Code, Description, ExpandMore, Forum, InsertChart, Mail} from "@material-ui/icons";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import useFetch from 'use-http'
import {Alert} from "@material-ui/lab";
import {ClassNameMap} from "@material-ui/styles/withStyles";
import {Service, Team} from "../Common";
import ReactMarkdown from "react-markdown";


const gfm = require('remark-gfm')

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        link: {
            color: theme.palette.notice.main,
            textDecoration: 'none',
            '&:hover': {
                textDecoration: 'underline',
            },
        },
        icon: {
            verticalAlign: "middle",
            fontSize: "large",
            marginRight: "0.5em"
        },
    }),
);


function ServiceInfoLink(props: { classes: any, children: React.ReactNode, link: string, caption: string }) {
    if (props.link === "") {
        return (<Typography variant="caption">missing</Typography>)
    }
    return (
        <Typography variant="body1">
            {props.children}
            <a
                href={props.link}
                className={props.classes.link}
                target="_blank"
                rel="noopener noreferrer"
            >{props.caption}</a>
        </Typography>
    )
}


function ServiceCardSummary(props: { classes: ClassNameMap, service: Service, team: Team }) {
    return (
        <AccordionSummary expandIcon={<ExpandMore/>}>
            <Grid container spacing={3}>
                <Grid item xs={3}>
                    <Typography variant="caption">Service: </Typography>
                    <Typography variant="body1">{props.service.name}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="caption">Team:</Typography>
                    <Typography variant="body1">{props.team.name}</Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="caption">Url:</Typography>
                    <Typography variant="body1">
                        <a
                            href={props.service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={props.classes.link}
                        >{props.service.url}</a>
                    </Typography>
                </Grid>
            </Grid>
            <Divider variant="fullWidth" absolute={true}/>
        </AccordionSummary>
    )
}

function ServiceCardDetails(props: { classes: ClassNameMap, service: Service, team: Team }) {
    return (
        <AccordionDetails>
            <Grid container spacing={3}>
                <Grid item xs={12} style={{paddingBottom: 0}}>
                    <Typography variant="caption">Service details:</Typography>
                </Grid>
                <Grid item xs={2}>
                    <ServiceInfoLink classes={props.classes}
                                     link={props.service.documentation_url === "" ? props.team.documentation_url : props.service.documentation_url}
                                     caption="Documentation">
                        <Description className={props.classes.icon}/>
                    </ServiceInfoLink>
                </Grid>
                <Grid item xs={2}>
                    <ServiceInfoLink classes={props.classes}
                                     link={props.service.im_channel_url === "" ? props.team.im_channel_url : props.service.im_channel_url}
                                     caption="IM channel">
                        <Forum className={props.classes.icon}/>
                    </ServiceInfoLink>
                </Grid>
                <Grid item xs={2}>
                    <ServiceInfoLink classes={props.classes}
                                     link={"mailto:" + props.team.email}
                                     caption="Email">
                        <Mail className={props.classes.icon}/>
                    </ServiceInfoLink>
                </Grid>
                {
                    props.service.source_code_url !== "" ?
                        <Grid item xs={2}>
                            <ServiceInfoLink classes={props.classes}
                                             link={props.service.source_code_url}
                                             caption="VCS repository">
                                <Code className={props.classes.icon}/>
                            </ServiceInfoLink>
                        </Grid> : ""
                }
                {
                    props.service.dashboard_url !== "" ?
                        <Grid item xs={2}>
                            <ServiceInfoLink classes={props.classes}
                                             link={props.service.dashboard_url}
                                             caption="Dashboard">
                                <InsertChart className={props.classes.icon}/>
                            </ServiceInfoLink>
                        </Grid> : ""
                }
                <Grid item xs={12}>
                    <Typography variant="caption">Description:</Typography>
                    <ReactMarkdown plugins={[gfm]}>{props.service.description}</ReactMarkdown>
                </Grid>
            </Grid>
        </AccordionDetails>
    )
}


export function Services() {
    const classes = useStyles();
    const {loading, error, data = []} = useFetch("/api/v1/teams", {
        retries: 10,
        retryDelay: 5000
    }, [])
    let errMsgOpen = false

    let content = []
    if (error) {
        errMsgOpen = true
    }
    if (loading || !data.teams) {
        content.push(<Box style={{position: "relative", left: "48%", top: "3em"}}><CircularProgress/></Box>)
    } else {
        for (let t of data.teams) {
            for (let s of t.managed_services) {
                content.push(
                    <Accordion key={t.id}>
                        <ServiceCardSummary classes={classes} service={s} team={t}/>
                        <ServiceCardDetails classes={classes} service={s} team={t}/>
                    </Accordion>
                )
            }
        }
        if (content.length === 0) {
            content.push(<Typography variant="caption">Catalogue is empty</Typography>)
        }
    }

    return (
        <div>
            {content}
            <Snackbar open={errMsgOpen} autoHideDuration={6000}>
                <Alert severity="error">
                    {error ? error.message : ""}
                </Alert>
            </Snackbar>
        </div>
    )
}

