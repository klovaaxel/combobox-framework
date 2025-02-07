import type ComboboxFramework from './combobox-framework';

export function setBasicAttributes(this: ComboboxFramework): void {
  // #region Set the ids of the input and list elements if they are not set
  if (this.input)
    this.input.id =
      this.input.id.length !== 0
        ? this.input.id
        : `input-${crypto.randomUUID()}`;
  if (this.list)
    this.list.id =
      this.list.id.length !== 0 ? this.list.id : `list-${crypto.randomUUID()}`;
  // #endregion

  // #region Basic attributes for the input element
  if (this.input) {
    this.input.setAttribute('role', 'combobox');
    if (this.list) this.input.setAttribute('aria-controls', this.list.id);
    this.input.setAttribute('aria-expanded', 'false');
    this.input.setAttribute('aria-autocomplete', 'list'); // Maybe change combobox to both?
    this.input.setAttribute('autocomplete', 'off');
  }
  // #endregion

  //#region set basic attributes for list element container
  this.listContainer?.setAttribute('popover', 'manual');
  //#endregion

  // #region Basic attributes for the list element
  if (this.list) {
    this.list.setAttribute('role', 'listbox');
    this.list.setAttribute('aria-multiselectable', 'false');
    this.list.tabIndex = -1;
  }
  // #endregion

  // #region  Basic attributes for the children of the list element
  const children = this.list?.children ?? [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    child.setAttribute('role', 'option');
    child.setAttribute('aria-selected', 'false');
    child.setAttribute('tabindex', '-1');
    child.tabIndex = -1;
  }
  // #endregion

  // #region Initialize the list and originalList properties
  this.list = null;
  this.originalList = null;
  // #endregion
}

export enum KeyCode {
  ArrowDown = 'ArrowDown',
  ArrowUp = 'ArrowUp',
  ArrowRight = 'ArrowRight',
  ArrowLeft = 'ArrowLeft',
  Home = 'Home',
  End = 'End',
  Backspace = 'Backspace',
  Delete = 'Delete',
  Escape = 'Escape',
  Enter = 'Enter',
  Alt = 'Alt',
}
