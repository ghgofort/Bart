'use babel';

/** @jsx elementCreator */
import {domElement as elementCreator} from './elementCreator'; // eslint-disable-line
import EventEmitter from 'events';
import FolderNode from './FolderNode';
import OptionsView from './OptionsView';

/**
 * @class FolderTree
 * @description - Displays an expandable tree to select which folders to
 *                upload in addition to the folders and watched files.
 */

export default class FolderTree {
    constructor(selectedFolders = []) {
        this._emmiter = new EventEmitter();
        this._path = require('path');
        this._folders = {
            topLevel: [],
            checked: selectedFolders
        };

        this._ele = <ul  class="bart__folderlist-ul"></ul>
        this.$ele = this._ele.getElementsByClassName('bart__folderlist-ul').item(0);
    }

    showChildren() {
        const dirs = atom.project.getDirectories();
        this._folders.topLevel = [];
        if (dirs.length) {
            dirs.forEach((dir) => {
                if (!OptionsView.isCartridge(dir)) {
                    let ic = false;
                    if (this._folders.checked.contains(dir.getPath())) {
                        ic = true;
                    }
                    const node = new FolderNode(dir, dir, ic);
                    const len = this._folders.topLevel.push(node);
                    this._folders.topLevel[len - 1].on('expand', (children) => {
                        this._folders = this._folders.concat(children);
                    });
                    this.$ele.appendChild(node.getElement());
                }
            });
        }
    }
}
