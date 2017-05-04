'use babel';

import React from 'react';
import ReactDOM from 'react-dom';
import EventEmitter from 'events';

export default class BreakpointView extends React.Component {
    constructor(props) {
        super(props);

        this.toggleBreakpoint = this.toggleBreakpoint.bind(this);
        this.removeBreakpoint = this.removeBreakpoint.bind(this);
        this.state = {
            breakpoints: this.props.breakpoints || [],
            disabledBrks: this.props.disabledBrks || [],
        };
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            breakpoints: nextProps.breakpoints
        });
    }

    removeBreakpoint(key) {
        // this.props.emitter.emit('removeBreakpoint', brkPoint);
    }

    toggleBreakpoint(key) {
        // this.props.emmitter.emit('toggleBreakpoint', brkPoint);
    }

    render() {
        let bp = null;
        if (this.state.breakpoints.length > 0) {
            bp = this.state.breakpoints.map(bp => {
                return (
                    <li key={bp.file + bp.lineNumber + bp.editor}>
                        {' '}<label>
                            <input type="checkbox" checked={false} onChange={this.props.emitter.emit('toggleBreakpoint', bp)}/>
                            File: {bp.file}, Line: {bp.lineNumber}, editor: {bp.editor}
                        </label>{' '}
                    </li>
                );
            });
        } else {
            bp = 'No breakpoints';
        }

        const breakpoints = bp;
        return (
            <div id="b-bart-breakpoints">
                <ul>
                    {breakpoints}
                </ul>{' '}
            </div>
        );
    }
}
