import {ThemeProvider} from '@material-ui/styles';
import React, {useState} from "react";
import {blue, cyan, grey, lightGreen, red, teal} from "@material-ui/core/colors";
import {createMuiTheme, CssBaseline, IconButton} from "@material-ui/core";
import {Brightness4, Brightness7} from "@material-ui/icons";

declare module "@material-ui/core/styles/createPalette" {
    // eslint-disable-next-line
    interface Palette {
        menuText: Palette['primary'];
        incident: Palette['primary'];
        maintenance: Palette['primary'];
        notice: Palette['primary'];
    }

    // eslint-disable-next-line
    interface PaletteOptions {
        menuText: PaletteOptions['primary'];
        incident: PaletteOptions['primary'];
        maintenance: PaletteOptions['primary'];
        notice: PaletteOptions['primary'];
    }
}

const DarkBackgroundColor = "DarkSlateGrey"
const LightBackgroundColor = "#d9d9d9"

export function ThemedApp(props: { children: React.ReactNode, dark: boolean }) {
    const [theme, setTheme] = useState({
        palette: {
            type: props.dark ? "dark" : "light",
            background: {
                default: props.dark ? DarkBackgroundColor : LightBackgroundColor,
            },
            primary: {
                main: cyan[900],
            },
            secondary: {
                main: teal[400],
            },
            menuText: {
                main: grey[50],
            },
            incident: {
                main: red[400]
            },
            maintenance: {
                main: blue[800]
            },
            notice: {
                main: lightGreen[500]
            },
        },
    });

    const toggleDarkTheme = () => {
        let newTheme = {...theme}
        if (theme.palette.type === "light") {
            newTheme.palette.background.default = DarkBackgroundColor
            newTheme.palette.type = "dark"
        } else {
            newTheme.palette.background.default = LightBackgroundColor
            newTheme.palette.type = "light"
        }
        setTheme(newTheme);
    }


    // @ts-ignore
    const muiTheme = createMuiTheme(theme);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline/>
            <IconButton color="default" onClick={toggleDarkTheme} style={{bottom: "0", position: 'fixed'}}>
                {theme.palette.type === "dark" ? <Brightness7/> : <Brightness4/>}
            </IconButton>
            {props.children}
        </ThemeProvider>
    )
}
