import React from 'react';
import {FilterableTimeline} from "./timeline/FilterableTimeline";
import {EventsCalendar} from "./calendar/Calendar";
import {TeamsOnCall} from "./oncall/TeamsOnCall";
import {Services} from "./services/Services";

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

const OnCallFn: React.FC = () => {
    return (
        <TeamsOnCall/>
    );
};

const ServicesFunc: React.FC = () => {
    return (
        <Services/>
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
        component: OnCallFn
    },
    {
        path: '/services',
        sidebarName: 'Services',
        component: ServicesFunc
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
