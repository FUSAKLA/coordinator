import {AppBar, IconButton, Toolbar, Typography} from "@material-ui/core";
import {Menu} from "@material-ui/icons";
import React from "react";
import {ScrollTop} from "./ScrollTop";


export function AppWithNavigation(props: { title: React.ReactNode; children: React.ReactNode; scrollTop: boolean; }) {
    return (
        <React.Fragment>
            <span id="back-to-top-anchor"/>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu">
                        <Menu/>
                    </IconButton>
                    <Typography variant="h6">{props.title}</Typography>
                </Toolbar>
            </AppBar>
            {props.children}
            {props.scrollTop ? <ScrollTop/> : ""}
        </React.Fragment>
    )
}
