/* eslint-disable no-use-before-define */
import React from 'react';
import Autocomplete, {
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    createFilterOptions
} from '@material-ui/lab/Autocomplete';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const filter = createFilterOptions<Label>();

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "auto",
            overflow: "hidden",
            paddingTop: "0.5em",
            '& > * + *': {
                marginTop: theme.spacing(3),
            },
        },
    }),
);

export interface Label {
    inputValue?: string;
    title: string
}

function stringsToOptions(labels: Array<string>): Array<Label> {
    let opts = []
    for (let l of labels) {
        opts.push({title: l})
    }
    return opts
}


export default function LabelSelector(props: { value: Array<string>; options: Array<string>; placeholder: string; onChange: ((event: React.ChangeEvent<{}>, value: Label[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<Label> | undefined) => void) | undefined }) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Autocomplete
                multiple
                id="services-filter"
                options={stringsToOptions(props.options)}
                filterSelectedOptions
                disableListWrap
                value={stringsToOptions(props.value)}
                size="small"
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    if (params.inputValue !== '') {
                        filtered.push({
                            inputValue: params.inputValue,
                            title: params.inputValue,
                        });
                    }
                    return filtered;
                }}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') {
                        return option;
                    }
                    if (option.inputValue) {
                        return `Add "${option.inputValue}"`;
                    }
                    return option.title;
                }}
                onChange={props.onChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label={props.placeholder}
                    />
                )}
            />
        </div>
    );
}
