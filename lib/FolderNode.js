'use babel';

/** @jsx elementCreator */
import {domElement as elementCreator} from './elementCreator'; // eslint-disable-line
import EventEmitter from 'events';
import OptionsView from './OptionsView';

/**
 * @class FolderNode
 * @description - A folder element to display in the folder tree.
 */
export default class FolderNode {
    constructor(dir, projectDir, isChecked = false) {
        this._emmiter = new EventEmitter();
        this._path = require('path');
        this._dir = dir;
        this._projectDir = projectDir;
        this._isChecked = isChecked;
        this._showChildren = false;
        this._children = null;
        this._ele = this.createFolderCheckbox();

        // Cache elements for use.
        this.$children = this._ele.getElementsByClassName('')
    }

    createFolderCheckbox() { //eslint-disable-line
        const displayName = this._projectDir + this._dir.getPath().split(this._path.sep).pop();
        const name = this._path.sep + displayName;
        const checked = this.folders && this.folders.checked &&
                      this.folders.checked.length &&
                      this.folders.checked.includes(name);
        const ele = //eslint-disable-line
            <li>
                <div onclick={this.onToggle.bind(this)} class="bart__folder-item">
                    <input
                        type='checkbox'
                        class='bart__folder-checkbox'
                        value={name}/>
                    <label for={name}>
                        {displayName}
                    </label>
                </div>
                <ul name={name + '-children-ul'} class='bart__folder-children'>
                </ul>
            </li>;
        const inp = ele.getElementsByClassName('bart__folder-checkbox');
        inp[0].checked = checked;
        return ele;
    }

    onToggle() {
        this._showChildren = !this._showChildren;
        if (this._showChildren === true) {
            if (!this._children) {
                this.populateChildNodes(this._dir, this._projectDir);
            }
        }
        this.$children.classList.toggle('bart__folder-children--hidden');
    }

    onCheck() {
        this._isChecked = !this._isChecked;
    }

    getIsChecked() {
        return this._isChecked;
    }

    populateChildNodes(dir) {
        dir.getEntries((err, children) => {
            if (err) {
                this._emitter.emit('error', err);
            } else {
                children.forEach((child) => {
                    if (child.isDirectory() && !OptionsView.isCartridge(child)) {
                        // TODO -- Finish expanding node.
                    }
                });

                this._emitter.emit('expand', this._children);
            }
        });
    }

    getElement() {
        return this._ele;
    }

    // EventEmitter public helpers for subscribe and unsubscribe.
    on(name, fn) {
        this.emitter.on(name, fn);
    }
    off(name, fn) {
        this.emitter.off(name, fn);
    }
}
