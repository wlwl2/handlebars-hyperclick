'use babel';

import HandlebarsHyperclick from '../lib/handlebars-hyperclick';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('HandlebarsHyperclick', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('handlebars-hyperclick');
  });

  describe('when the handlebars-hyperclick:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.handlebars-hyperclick')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'handlebars-hyperclick:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.handlebars-hyperclick')).toExist();

        let handlebarsHyperclickElement = workspaceElement.querySelector('.handlebars-hyperclick');
        expect(handlebarsHyperclickElement).toExist();

        let handlebarsHyperclickPanel = atom.workspace.panelForItem(handlebarsHyperclickElement);
        expect(handlebarsHyperclickPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'handlebars-hyperclick:toggle');
        expect(handlebarsHyperclickPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.handlebars-hyperclick')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'handlebars-hyperclick:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let handlebarsHyperclickElement = workspaceElement.querySelector('.handlebars-hyperclick');
        expect(handlebarsHyperclickElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'handlebars-hyperclick:toggle');
        expect(handlebarsHyperclickElement).not.toBeVisible();
      });
    });
  });
});
