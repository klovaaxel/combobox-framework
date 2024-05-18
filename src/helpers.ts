import ComboboxFramework from "./combobox-framework";

export function fetchListContainer(this: ComboboxFramework): HTMLElement {
    if (this._listContainer) return this._listContainer;
    this._listContainer = this.querySelector('[slot="list"]') as HTMLElement;
    return this._listContainer;
}

export function fetchList(this: ComboboxFramework): HTMLElement {
    if (this._list) return this._list;
    this._list = this.querySelector('[slot="list"] [data-list]') as HTMLElement;
    if (!this._list) this._list = this.querySelector('[slot="list"]') as HTMLElement;
    if (!this._list) throw new Error("List element not found");

    return this._list;
}

export function fetchInput(this: ComboboxFramework): HTMLInputElement {
    if (this._input) return this._input;
    const input = this.querySelector('[slot="input"]') as HTMLInputElement;
    if (!input) throw new Error("Input element not found");
    this._input = input;

    return this._input;
}

export function fetchOriginalList(this: ComboboxFramework): HTMLElement {
    if (this._originalList) return this._originalList;

    const list = fetchList.call(this);
    this._originalList = list.cloneNode(true) as HTMLElement;

    return this._originalList;
}

export function setBasicAttributes(this: ComboboxFramework): void {
    // #region get the input and list elements
    const list = fetchList.call(this);
    const input = fetchInput.call(this);
    // #endregion

    // #region Set the ids of the input and list elements if they are not set
    input.id = input.id.length !== 0 ? input.id : `input-${crypto.randomUUID()}`;
    list.id = list.id.length !== 0 ? list.id : `list-${crypto.randomUUID()}`;
    // #endregion

    // #region Basic attributes for the input element
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-controls", list.id);
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-autocomplete", "list"); // Maybe change combobox to both?
    input.setAttribute("autocomplete", "off");
    // #endregion

    //#region set basic attributes for list element container
    this._listContainer?.setAttribute("popover", "manual");
    //#endregion

    // #region Basic attributes for the list element
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-multiselectable", "false");
    list.tabIndex = -1;
    // #endregion

    // #region  Basic attributes for the children of the list element
    const children = list.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        child.setAttribute("role", "option");
        child.setAttribute("aria-selected", "false");
        child.tabIndex = -1;
    }
    // #endregion
}

export enum KeyCode {
    ArrowDown = "ArrowDown",
    ArrowUp = "ArrowUp",
    ArrowRight = "ArrowRight",
    ArrowLeft = "ArrowLeft",
    Home = "Home",
    End = "End",
    Backspace = "Backspace",
    Delete = "Delete",
    Escape = "Escape",
    Enter = "Enter",
    Alt = "Alt",
}
