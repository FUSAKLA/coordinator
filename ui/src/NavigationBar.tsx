import React from 'react';

import {NavLink, withRouter} from 'react-router-dom';
import Routes, {GetRouteId} from "./Routes";
import {AppBar, Tab, Tabs, useTheme,} from '@material-ui/core';


const NavigationBar: React.FC = (props: any) => {
    const activeRoute = (routeName: any) => {
        return props.location.pathname === routeName;
    }
    const theme = useTheme()
    return (
        <AppBar position="static">
            <Tabs value={GetRouteId(props.location.pathname)+1}>
                <Tab label="Coordinator" value={-1} disabled={true}/>
                {Routes.map((prop, key) => {
                    return (
                        <NavLink to={prop.path} key={key} color={theme.palette.menuText.main}>
                            <Tab label={prop.sidebarName} selected={activeRoute(prop.path)} key={key.toString()}
                                 id={key.toString()} value={key}/>
                        </NavLink>
                    );
                })}
            </Tabs>
        </AppBar>
    );
};

export default withRouter(NavigationBar);
