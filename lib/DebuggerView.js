'use babel';

import React from 'react';
import ReactDOM from 'react-dom';
import EventEmitter from 'events';

const noop = function() {};

const StackView = React.createClass({
    render: function() {
        if (this.props.thread === 'spin') {
            return (
                <span className="loading loading-spinner-tiny inline-block" />
            );
        } else if (this.props.thread) {
            return (
                <div className="block">
                    <ul className="list-group">
                        {this.props.thread.threadInfo.call_stack.map(
                            (stack, index) => (
                                <li
                                    className={
                                        (this.props.selected || 0) === index
                                            ? 'list-item selected'
                                            : 'list-item'
                                    }
                                    onClick={
                                        this.props.onSelectFrame
                                            ? this.props.onSelectFrame.bind(
                                                  this,
                                                  index
                                              )
                                            : noop
                                    }
                                    title={stack.location.script_path}
                                >
                                    <span>
                                        {stack.location.script_path
                                            .split('/')
                                            .pop()}
                                    </span>
                                    <span>:{stack.location.line_number}</span>
                                    <span>
                                        {stack.location.function_name}
                                    </span>
                                </li>
                            )
                        )}
                    </ul>
                </div>
            );
        } else {
            return <div className="block">No active thread</div>;
        }
    }
});

const VarView = React.createClass({
    getInitialState: () => {
        return {opened: false, pending: false, values: null};
    },
    toggleOpened: function() {
        const self = this;
        this.setState({
            opened: !this.state.opened
        });
        if (!this.state.values && this.props.thread) {
            this.setState({pending: true});
            this.props.thread
                .getMembers(this.props.path, this.props.selected)
                .then(function(data) {
                    self.setState({pending: false, values: data});
                });
        }
    },
    render: function() {
        var pending = '';
        if (this.state.pending) {
            pending = (
                <span className="loading loading-spinner-tiny inline-block" />
            );
        }
        var vals = '';
        if (this.state.values && this.state.opened) {
            vals = (
                <ul className="list-tree">
                    {this.state.values.map(value => (
                        <li className="list-nested-item">
                            <VarView
                                type={value.type}
                                value={value.value}
                                name={value.name}
                                path={this.props.path + '.' + value.name}
                                thread={this.props.thread}
                                selected={this.props.selected}
                            />
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <div className="bart_pad_tree">
                <div className="list-item">
                    <span
                        className={
                            this.state.opened
                                ? 'icon icon-chevron-down'
                                : 'icon icon-chevron-right'
                        }
                        onClick={this.toggleOpened}
                    />
                    <span title={this.props.type}>{this.props.name}</span>
                    <span>
                        = {this.props.value}
                    </span>
                </div>
                {pending}
                {vals}
            </div>
        );
    }
});

const VariablesView = React.createClass({
    render: function() {
        if (this.props.values === 'spin') {
            return (
                <div className="b-bart_variables right">
                    <span className="loading loading-spinner-tiny inline-block" />
                </div>
            );
        }
        if (this.props.values) {
            return (
                <div className="b-bart_variables right">
                    <ul className="list-tree">
                        {this.props.values.map(value => (
                            <li className="list-nested-item">
                                <VarView
                                    type={value.type}
                                    value={value.value}
                                    name={value.name}
                                    path={value.name}
                                    thread={this.props.thread}
                                    selected={this.props.selected}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            );
        } else {
            return <div className="b-bart_variables right">No variables</div>;
        }
    }
});

const MainView = React.createClass({
    getInitialState: () => {
        return {thread: null, selectedFrame: 0};
    },
    emit: (eventName, data) => {
        this.emitter.emit(eventName, data);
    },
    componentDidMount: () => {
        this.emitter = new EventEmitter();
    },
    on: (event, fn) => {
        this.emitter.on(event, fn);
    },
    onSelectFrame: function(frameNo) {
        this.emit('selectFrame', frameNo);
        this.setState({
            selectedFrame: +frameNo
        });
    },
    render: function() {
        return (
            <div className="b-bart-debugger_panel block" contenteditable="true">
                <atom-panel class="b-bart_parent_stack left">
                    <div className="inline-block btn-group">
                        <button
                            onClick={this.emit.bind(this, 'close')}
                            className="icon icon-remove-close btn"
                            title="close debugger F12"
                        />
                        <button
                            onClick={this.emit.bind(this, 'stop')}
                            className="icon icon-primitive-square btn"
                            title="stop"
                        />
                        <button
                            onClick={this.emit.bind(this, 'resume')}
                            className="icon icon-playback-play btn"
                            title="resume F8"
                        />
                        <button
                            onClick={this.emit.bind(this, 'stepover')}
                            className="icon icon-jump-right btn"
                            title="step over F10"
                        />
                        <button
                            onClick={this.emit.bind(this, 'stepin')}
                            className="icon icon-jump-down btn"
                            title="step in F11"
                        />
                        <button
                            onClick={this.emit.bind(this, 'stepout')}
                            className="icon icon-jump-up btn"
                            title="step out SHIFT-F11"
                        />
                        <button
                            onClick={this.emit.bind(this, 'update')}
                            className="icon icon-repo-sync btn"
                            title="manual update"
                        />
                    </div>
                    <StackView
                        thread={this.state.thread}
                        onSelectFrame={this.onSelectFrame}
                        selected={this.state.selectedFrame}
                    />
                </atom-panel>
                <VariablesView
                    values={this.state.values}
                    thread={this.state.thread}
                    selected={this.state.selectedFrame}
                />
                <BreakpointView
                    breakpoints={this.state.breakpoints}
                    selected={this.state.selectedFrame}
                />
                <div className="clearboth" />
            </div>
        );
    }
});

const BreakpointView = React.createClass({
    getInitialState: () => {
        return {
            breakpoints: this.props.breakpoints || []
        };
    },
    removeBreakpoint: key => {
        this.setState(prevState => ({
            breakpoints: prevState.breakpoints.splice(
                prevState.breakpoints.indexOf(key),
                1
            )
        }));
    },
    toggleBreakpoint: key => {
        this.setState(prevState => {
            const breakPts = prevState.breakpoints;
            return {
                disabledBrks: prevState.disabledBrks,
                breakpoints: breakPts
            };
        });
    },
    render: function() {
        const breakpoints = this.state.breakpoints.map(bp => {
            return (
                <li>
                    {' '}<label>
                        <input type="checkbox" checked={bp.checked} />
                        File: {bp.file}, Line: {bp.lineNumber}
                    </label>{' '}
                </li>
            );
        });
        return (
            <div id="b-bart-breakpoints">
                <ul>
                    {breakpoints}
                </ul>{' '}
            </div>
        );
    }
});

export default class DebuggerView {
    constructor() {
        this.el = document.createElement('div');
        this.el.className = 'b-bart-debugger';
        this.container = document.createElement('div');

        this.el.appendChild(this.container);
        this.mainView = ReactDOM.render(<MainView />, this.container);
    }
    updateThread(maybeThread) {
        this.mainView.setState({thread: maybeThread});
    }
    updateValues(maybeValues) {
        this.mainView.setState({values: maybeValues});
    }
    updateBreakpoints(maybeBreakpoints) {
        this.mainView.setState({breakpoints: maybeBreakpoints});
    }
    on(eventName, cb) {
        this.mainView.on(eventName, cb);
    }
    getElement() {
        return this.el;
    }
    destroy() {
        React.unmountComponentAtNode(this.container);
    }
}
