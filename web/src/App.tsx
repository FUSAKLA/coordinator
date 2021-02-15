import {Container, useMediaQuery} from "@material-ui/core";
import {ThemedApp} from "./Theme";
import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Routes from "./Routes";
import NavigationBar from "./NavigationBar";
import {ScrollTop} from "./ScrollTop";


const App: React.FC = () => {
    let prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    return (
        <ThemedApp dark={prefersDarkMode}>
            <span id="back-to-top-anchor"/>
            <Container>
                <Router>
                    <NavigationBar/>
                    <Switch>
                        {Routes.map((route: any) => (
                            <Route exact path={route.path} key={route.path}>
                                <route.component/>
                            </Route>
                        ))}
                    </Switch>
                </Router>
            </Container>
            <ScrollTop/>
        </ThemedApp>
    );
}

export default App;
