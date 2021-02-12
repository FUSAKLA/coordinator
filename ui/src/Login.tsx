import React from "react";
import {Avatar, IconButton, Snackbar, useTheme} from "@material-ui/core";
import useFetch from "use-http";
import {Alert} from "@material-ui/lab";
import {ExitToApp} from "@material-ui/icons";


export function LoginBox() {
    const theme = useTheme()
    const {response, loading, error, data = []} = useFetch("/api/auth/user", {}, [])
    let errMsgOpen = false

    function reportError(err: object): void {
        errMsgOpen = true
    }

    let content = []
    if (error && response.status !== 401) {
        reportError(error)
    }
    if (loading || !data.name) {
        content.push(
            <a href="/api/auth/login">
                <Avatar
                    variant="square"
                    alt="Log in"
                    style={{backgroundColor: theme.palette.primary.main}}
                >
                    <ExitToApp style={{color: theme.palette.notice.main}}/>
                </Avatar>
            </a>
        )
    } else {
        content.push(<Avatar variant="square" alt={data.name} src={data.avatar_url}/>)
    }
    return (
        <div id="log-in" style={{position: "relative", textAlign: "right", top: "3pt", right: "4pt"}}>
            <IconButton style={{padding: "unset"}}>
                {content}
            </IconButton>
            <Snackbar open={errMsgOpen} autoHideDuration={6000}>
                <Alert severity="error">
                    {error ? error.message : ""}
                </Alert>
            </Snackbar>
        </div>
    )
}
