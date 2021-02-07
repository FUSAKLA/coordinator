import React from 'react';
import {FilterableTimeline} from "./timeline/FilterableTimeline";
import {EventsCalendar} from "./calendar/Calendar";

const Timeline: React.FC = () => {
    return (
        <FilterableTimeline/>
    );
};


const Calendar: React.FC = () => {
    return (
        <EventsCalendar/>
    );
};

const OnCall: React.FC = () => {
    return (
        <h1>On call</h1>
    );
};

const Catalogue: React.FC = () => {
    return (
        <h1>Catalogue</h1>
    );
};

const Routes = [
    {
        path: '/',
        sidebarName: 'Timeline',
        component: Timeline
    },
    {
        path: '/calendar',
        sidebarName: 'Calendar',
        component: Calendar
    },
    {
        path: '/oncall',
        sidebarName: 'On call',
        component: OnCall
    },
    {
        path: '/catalogue',
        sidebarName: 'Catalogue',
        component: Catalogue
    },
];

export function GetRouteId(route: string): number {
    for (let i in Routes) {
        if (Routes[i].path === route) {
            return parseInt(i)
        }
    }
    return 0
}

export default Routes;
