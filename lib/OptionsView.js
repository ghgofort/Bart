'use babel';

/** @jsx elementCreator */
import {domElement as elementCreator} from './elementCreator'; // eslint-disable-line
import EventEmitter from 'events';

const path = require('path');

export default class OptionsView {
    constructor(currentOptions = {}) {
        this.isChecked = true;
        this.currentOptions = currentOptions;
        this.emitter = new EventEmitter();
        this.cartridges = {
            all: [],
            checked: []
        };

        this.folders = {
          all: [],
          checked: []
        };

        this.el =
        <div class="b-bart-options">
            <div class="bart-tabscontainer">
                <span class="bart__tabs bart__tabs--active bart-webdav__tab" onclick={this.selectTab.bind(this)}>WebDav Settings</span>
                <span class="bart__tabs bart-cartridges__tab" onclick={this.selectTab.bind(this)}>Project Cartridges</span>
                <span class="bart__tabs bart-folders__tab" onclick={this.selectTab.bind(this)}>Project Folders</span>
            </div>
            <div class="bart-options-main">
                <div class="bart__containers bart__containers--active bart-webdav__container">
                    <div class="block">
                        <label>Credentials for sandbox</label>
                    </div>
                    <div class="block">
                        <div class="controls">
                            <label class="control-label">
                                HostName
                            </label>
                            <div class="controls">
                                <div class="editor-container">
                                    <atom-text-editor mini="" class="mini editor bart-hostname"
                                        id="bart-hostname" placeholder-text="some.demandware.net"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="block">
                        <div class="controls">
                            <label class="control-label">
                                UserName
                            </label>
                            <div class="controls">
                                <div class="editor-container">
                                    <atom-text-editor mini="" class="mini editor bart-username"
                                        id="bart-username" placeholder-text="Your username on sandbox"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="block">
                        <div class="controls">
                            <label class="control-label">
                                Password
                            </label>
                            <div class="controls">
                                <div class="editor-container">
                                    <input type="password" class="mini editor bart-password"
                                        id="bart-password" placeholder-text="password"
                                        onKeyDown={this.handleKeyPress.bind(this)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="block">
                        <div class="controls">
                            <label class="control-label">
                                Code version
                            </label>
                            <div class="controls">
                                <div class="editor-container">
                                    <atom-text-editor mini="" class="mini editor bart-version"
                                        id="bart-codeversion" placeholder-text="Current code version"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="block">
                        <div class="control-group">
                            <div class="controls">
                                <div class="checkbox">
                                    <label for="bart-uploadaftersave">
                                        <input id="bart-uploadaftersave"
                                            type="checkbox"
                                            checked="checked"
                                            class="bart-uploadaftersave" />
                                        <div class="setting-title">Upload all after save</div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="block">
                        <div class="control-group">
                            <div class="controls">
                                <div class="checkbox">
                                    <label for="bart-saveconfigtofile">
                                        <input id="bart-saveconfigtofile"
                                            type="checkbox"
                                            checked="checked"
                                            class="bart-saveconfigtofile" />
                                        <div class="setting-title">Save config in root folder (Config file 'dw.json')</div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="control-group">
                            <div class="controls">
                                <div class="checkbox">
                                    <label for="bart-debugMode">
                                        <input id="bart-debugMode"
                                            type="checkbox"
                                            checked="checked"
                                            class="bart-debugMode" />
                                        <div class="setting-title">Enable debug mode (logging in console)</div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bart__containers bart-cartridges__container">
                    <div class="block">
                        <div class="controls bart-list-container">
                            <label class="control-label">Cartridges found in project</label>
                            <div class="control-group">
                                <button  class="btn bart__btn-all" onClick={this.setAll.bind(this)}>Deselect All</button>
                            </div>
                            <div class="cartridgelist-div-list">
                                <ul class="bart__cartridgelist-ul">
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bart__containers bart-folders__container">
                    <div class="block">
                        <div class="controls">
                          <label class="control-label">
                              Select any project folders that should be uplaoded in addition to your cartridges.
                          </label>
                          <div class="cartridgelist-div-list">
                              <ul  class="bart__folderlist-ul">

                              </ul>
                          </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class='block'>
                <button class="btn" onClick={this.onSave.bind(this)} >Save</button>
                <button class="btn" onClick={this.onCancel.bind(this)}>Cancel</button>
                <div class="error-messages js-bart_error" ></div>
            </div>
        </div>;

        [
            'hostname',
            'username',
            'password',
            'version',
            'uploadaftersave',
            'saveconfigtofile',
            'debugMode'
        ].forEach((key) => {
            const div = this.el.getElementsByClassName('bart-' + key);
            if (div && div.length) {
                if (div[0].type === 'checkbox') {
                    div[0].checked = currentOptions[key] === 'true';
                } else if (div[0].type === 'password') {
                    div[0].value = currentOptions[key];
                } else {
                    div[0].getModel().setText(currentOptions[key] || '');
                }
            }
        });
        this.folderList = this.el.getElementsByClassName('bart__folderlist-ul').item(0);
        this.cartridgeList = this.el.getElementsByClassName('bart__cartridgelist-ul')
            .item(0);
        this.btnAll = this.el.getElementsByClassName('bart__btn-all');
    }

    /* Setup Methods
     * ======================================================================*/

    displayAvailable(currentOptions = {}) {
        this.currentOptions = currentOptions;
        this.isChecked = true;
        if (this.currentOptions.cartridges &&
            this.currentOptions.cartridges.length) {
            this.cartridges.checked = this.currentOptions.cartridges;
        } else {
            this.cartridges.checked = [];
        }
        console.log(this.cartridges.checked);
        this.cartridges.all = [];
        this.cartridgeList.innerHTML = '';
        const dirs = atom.project.getDirectories();
        if (dirs.length) {
            dirs.forEach((dir) => {
                const path = dir.getPath();
                const name = path.split(path.sep).pop();
                if (OptionsView.isCartridge(dir) &&
                !this.cartridges.all.includes(name)) {
                    this.createCartridgeCheckbox(dir, '');
                } else {
                    this.checkChildDirectory(dir, '');
                }
            });
        }
    }
    checkChildDirectory(dir, relativePath) {
        const rpath = !relativePath ? '' : relativePath + path.sep;
        dir.getEntries((err, children) => {
            if (err) {
                this.setError(err);
            } else {
                children.forEach((child) => {
                    const name = child.getPath().split(path.sep).pop();
                    if (child.isDirectory() && OptionsView.isCartridge(child) &&
                      !this.cartridges.all.includes(rpath + name)) {
                        this.createCartridgeCheckbox(child, rpath);
                    } else if (child.isDirectory() && !OptionsView.isCartridge(child) && name !== '.api') {
                        this.checkChildDirectory(child, rpath + name);
                    }
                });
            }
        });
    }
    createCartridgeCheckbox (dir, projectDir) {
        const displayName = projectDir + dir.getPath().split(path.sep).pop();
        const name = path.sep + displayName;
        console.log(name);
        const checked = this.cartridges && this.cartridges.checked &&
                      this.cartridges.checked.length &&
                      this.cartridges.checked.includes(name);
        console.log(checked);
        if (!checked && this.isChecked) {
            this.isChecked = false;
            this.btnAll[0].innerHTML = 'Select All';
        }
        const ele =
            <li>
                <div class="bart__cartridgelist-item">
                    <input type="checkbox"
                        class="bart__cartridgelist-checkbox"
                        value={name}
                        name={name}
                        id={name}/>
                    <label for={name}>
                        {displayName}
                    </label>
                </div>
            </li>;
        const inp = ele.getElementsByClassName('bart__cartridgelist-checkbox');
        inp[0].checked = checked;
        this.cartridgeList.appendChild(ele);
        this.cartridges.all.push(name);
    }

    /* Static Methods
     * ======================================================================*/

    static isCartridge(dirPath) {
        const regexPattern = /^[a-zA-Z0-9_]+/;
        if (dirPath.isDirectory()) {
            const pathName = dirPath.getPath().split(path.sep).pop();
            if (regexPattern.test(pathName) && dirPath
                .getSubdirectory('cartridge').existsSync()) {
                return true;
            }
        }
        return false;
    }

    /* Action Handlers
     * ======================================================================*/

    selectTab(event) {
        if (!this.tabs) {
            this.tabs = this.el.getElementsByClassName('bart__tabs');
            this.containers = this.el.getElementsByClassName('bart__containers');
        }
        if (!event.target.classList.contains('bart__tabs--active')) {
            for (let it = 0; it < this.tabs.length; it++) {
                if (this.tabs[it].classList.contains('bart__tabs--active') ||
                  this.tabs[it] === event.target) {
                    this.tabs[it].classList.toggle('bart__tabs--active');
                    this.containers[it].classList.toggle('bart__containers--active');
                }
            }
        }
    }

    setAll() {
        const cartElements = this.cartridgeList
                           .getElementsByClassName('bart__cartridgelist-checkbox');
        for (let it = 0; it < cartElements.length; it++) {
            if (cartElements[it].type &&
                cartElements[it].type.toLowerCase() === 'checkbox') {
                cartElements[it].checked = !this.isChecked;
            }
        }
        this.isChecked = !this.isChecked;
        this.btnAll[0].innerHTML = this.isChecked ? 'Deselect All' : 'Select All';
    }

    handleKeyPress(event) {
      if (event.code === 'Backspace') {
          event.target.value = event.target.value.substr(0, event.target.value.length - 1);
      }
    }

    setError(msg = '') {
        const div = this.el.getElementsByClassName('js-bart_error');
        if (div && div.length) {
            div[0].textContent = msg;
            if (msg !== '') {
                div[0].scrollIntoView();
            }
        }
    }

    clean() {
        const div = this.el.getElementsByClassName('bart-password');
        if (div && div.length) {
            div[0].value = '';
        }
    }

    on(name, fn) {
        this.emitter.on(name, fn);
    }

    onSave() {
        const config = [
            'hostname',
            'username',
            'password',
            'version',
            'cartridges',
            'uploadaftersave',
            'saveconfigtofile',
            'debugMode'
        ].reduce((acc, elemClass) => {
            if (elemClass === 'cartridges') {
                const cartElements = this.cartridgeList
                .getElementsByClassName('bart__cartridgelist-checkbox');
                acc.cartridges = [];
                for (let it = 0; it < cartElements.length; it++) {
                    if (cartElements[it].type && cartElements[it].type === 'checkbox' &&
                      cartElements[it].checked) {
                        acc.cartridges.push(cartElements[it].value);
                    }
                }
            } else {
                const div = this.el.getElementsByClassName('bart-' + elemClass);
                if (div && div.length) {
                    if (div[0].type === 'checkbox') {
                        acc[elemClass] = div[0].checked;
                    } else if (div[0].type === 'password') {
                        acc[elemClass] = div[0].value;
                    } else {
                        acc[elemClass] = div[0].getModel().getText() || '';
                    }
                }
            }
            return acc;
        }, {});
        this.emitter.emit('save', config);
        this.currentOptions = config;
    }
    onCancel() {
        this.emitter.emit('cancel');
    }
    getElement() {
        return this.el;
    }
}
