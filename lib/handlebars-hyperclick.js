'use babel';

import HandlebarsHyperclickView from './handlebars-hyperclick-view';
import { CompositeDisposable } from 'atom';

export default {

  handlebarsHyperclickView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.handlebarsHyperclickView = new HandlebarsHyperclickView(state.handlebarsHyperclickViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.handlebarsHyperclickView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'handlebars-hyperclick:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.handlebarsHyperclickView.destroy();
  },

  serialize() {
    return {
      handlebarsHyperclickViewState: this.handlebarsHyperclickView.serialize()
    };
  },

  toggle() {
    console.log('HandlebarsHyperclick was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
