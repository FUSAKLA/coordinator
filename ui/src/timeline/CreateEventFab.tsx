import {makeStyles, Theme} from "@material-ui/core/styles";
import {createStyles, Fab} from "@material-ui/core";
import React from "react";
import {Add} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'fixed',
            bottom: theme.spacing(4),
            right: theme.spacing(4),
        },
    }),
);

export function CreateEventFab(props: { handleClick: () => void }) {
    const classes = useStyles();
    return (
        <div onClick={props.handleClick} role="presentation" className={classes.root}>
            <Fab color="primary" size="large" aria-label="create event">
                <Add/>
            </Fab>
        </div>
    );
}
