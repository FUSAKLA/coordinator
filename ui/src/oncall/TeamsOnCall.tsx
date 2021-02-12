import "react-big-calendar/lib/css/react-big-calendar.css"
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Snackbar,
    Typography
} from "@material-ui/core";
import React from 'react';
import {Description, ExpandMore, Forum, InsertChart, Mail} from "@material-ui/icons";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import useFetch from 'use-http'
import {Alert} from "@material-ui/lab";
import {ClassNameMap} from "@material-ui/styles/withStyles";
import {Service, Team} from "../Common";


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


function servicesToChips(services: Service[]) {
    let chips = []
    for (let s of services) {
        chips.push(<Chip
            id={s.name}
            key={s.name}
            variant="default"
            size="small"
            label={s.name}
            style={{marginLeft: "0.5em"}}
            component="a"
            href="#"
            clickable
        />)
    }
    return chips
}

function teamInfoLink(classes: any, icon: React.ReactNode, link: string, caption: string) {
    return (
        <Typography variant="body1">
            {icon}
            <a
                href={link}
                className={classes.link}
                target="_blank"
                rel="noopener noreferrer"
            >{caption}</a>
        </Typography>
    )
}


function TeamCardSummary(props: { classes: ClassNameMap, team: Team }) {
    return (
        <AccordionSummary expandIcon={<ExpandMore/>}>
            <Grid container spacing={3}>
                <Grid item xs={2}>
                    <Typography variant="caption">Team: </Typography>
                    <Typography variant="body1">{props.team.name}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="caption">On call:</Typography>
                    <Typography variant="body1">{props.team.on_call.person[0].name}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="caption">Phone:</Typography>
                    <Typography variant="body1">
                        <a
                            href={"tel:" + props.team.on_call.person[0].phone}
                            className={props.classes.link}
                        >{props.team.on_call.person[0].phone}</a>
                    </Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="caption">Email:</Typography>
                    <Typography variant="body1">
                        <a
                            href={"mailto:" + props.team.on_call.person[0].email}
                            className={props.classes.link}
                        >{props.team.on_call.person[0].email}</a>
                    </Typography>
                </Grid>
            </Grid>
            <Divider variant="fullWidth" absolute={true}/>
        </AccordionSummary>
    )
}

function TeamCardDetails(props: { classes: ClassNameMap, team: Team }) {
    return (
        <AccordionDetails>
            <Grid container spacing={3}>
                <Grid item xs={12} style={{paddingBottom: 0}}>
                    <Typography variant="caption">Team info:</Typography>
                </Grid>
                <Grid item xs={2}>
                    {teamInfoLink(props.classes, <Description
                        className={props.classes.icon}/>, props.team.documentation_url, "Documentation")}
                </Grid>
                <Grid item xs={2}>
                    {teamInfoLink(props.classes, <InsertChart
                        className={props.classes.icon}/>, props.team.dashboard_url, "Dashboard")}
                </Grid>
                <Grid item xs={2}>
                    {teamInfoLink(props.classes, <Forum
                        className={props.classes.icon}/>, props.team.im_channel_url, "IM channel")}
                </Grid>
                <Grid item xs={4}>
                    {teamInfoLink(props.classes, <Mail
                        className={props.classes.icon}/>, "mailto:" + props.team.email, props.team.email)}
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="caption">Managed services: </Typography>
                    {servicesToChips(props.team.managed_services)}
                </Grid>
            </Grid>
        </AccordionDetails>
    )
}


export function TeamsOnCall() {
    const classes = useStyles();
    const {loading, error, data = []} = useFetch("/api/v1/teams", {}, [])
    let errMsgOpen = false

    let content = []
    if (error) {
        errMsgOpen = true
    }
    if (loading || !data.teams) {
        content.push(<Box position="relative" display="inline-flex"><CircularProgress/></Box>)
    } else {
        for (let t of data.teams) {
            content.push(
                <Accordion key={t.id}>
                    <TeamCardSummary classes={classes} team={t}/>
                    <TeamCardDetails classes={classes} team={t}/>
                </Accordion>
            )
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

