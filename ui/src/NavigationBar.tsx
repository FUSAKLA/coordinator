import React from 'react';

import {NavLink, withRouter} from 'react-router-dom';
import Routes, {GetRouteId} from "./Routes";
import {AppBar, Grid, Tab, Tabs, useTheme,} from '@material-ui/core';
import {LoginBox} from "./Login";


const NavigationBar: React.FC = (props: any) => {
    const activeRoute = (routeName: any) => {
        return props.location.pathname === routeName;
    }
    const theme = useTheme()
    return (
        <AppBar position="static" style={{marginBottom: "1em"}}>
            <Grid container>
                <Grid item xs={11}>
                    <Tabs value={GetRouteId(props.location.pathname) + 1}>
                        <Tab label="Coordinator" value={-1} disabled={true} style={{color: theme.palette.notice.main}}/>
                        {Routes.map((prop, key) => {
                            return (
                                <NavLink to={prop.path} key={key}
                                         style={{textDecoration: 'none', color: theme.palette.menuText.main}}>
                                    <Tab label={prop.sidebarName} selected={activeRoute(prop.path)} key={key.toString()}
                                         id={key.toString()} value={key}/>
                                </NavLink>
                            );
                        })}
                    </Tabs>
                </Grid>
                <Grid item xs={1}>
                    <LoginBox/>
                </Grid>
            </Grid>
        </AppBar>
    );
};

export default withRouter(NavigationBar);
