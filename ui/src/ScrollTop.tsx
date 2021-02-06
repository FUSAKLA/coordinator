import {makeStyles, Theme} from "@material-ui/core/styles";
import {createStyles, Fab, useScrollTrigger, Zoom} from "@material-ui/core";
import React from "react";
import {KeyboardArrowUp} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'fixed',
            top: theme.spacing(4),
            right: theme.spacing(4),
        },
    }),
);

export function ScrollTop() {
    const classes = useStyles();
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
    });

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const anchor = ((event.target as HTMLDivElement).ownerDocument || document).querySelector(
            '#back-to-top-anchor',
        );

        if (anchor) {
            anchor.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    };

    return (
        <Zoom in={trigger}>
            <div onClick={handleClick} role="presentation" className={classes.root}>
                <Fab color="primary" size="small" aria-label="scroll back to top">
                    <KeyboardArrowUp/>
                </Fab>
            </div>
        </Zoom>
    );
}
