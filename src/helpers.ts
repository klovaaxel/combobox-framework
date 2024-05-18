import ComboboxFramework from "./combobox-framework";

export function fetchListContainer(this: ComboboxFramework): HTMLElement{
    if (this._listContainer) return this._listContainer;
    this._listContainer = this.querySelector('[slot="list"]') as HTMLElement;
    return this._listContainer
}

export function fetchList(this: ComboboxFramework): void {
    if (this._list) return;
    this._list = this.querySelector('[slot="list"] [data-list]') as HTMLElement;
    if (!this._list) this._list = this.querySelector('[slot="list"]') as HTMLElement;
    if (!this._list) throw new Error("List element not found");
}

export function fetchInput(this: ComboboxFramework): void {
    if (this._input) return;
    const input = this.querySelector('[slot="input"]') as HTMLInputElement;
    if (!input) throw new Error("Input element not found");
    this._input = input;
}

export function fetchOriginalList(this: ComboboxFramework): void {
    if (this._originalList) return;

    fetchList.call(this);
    this._originalList = this._list!.cloneNode(true) as HTMLElement;
}

export function setBasicAttributes(this: ComboboxFramework): void {
    // #region Set the ids of the input and list elements if they are not set
    this._input!.id =
        this._input!.id.length !== 0 ? this._input!.id : `input-${crypto.randomUUID()}`;
    this._list!.id = this._list!.id.length !== 0 ? this._list!.id : `list-${crypto.randomUUID()}`;
    // #endregion

    // #region Basic attributes for the input element
    this._input!.setAttribute("role", "combobox");
    this._input!.setAttribute("aria-controls", this._list!.id);
    this._input!.setAttribute("aria-expanded", "false");
    this._input!.setAttribute("aria-autocomplete", "list"); // Maybe change combobox to both?
    this._input!.setAttribute("autocomplete", "off");
    // #endregion

    //#region set basic attributes for list element container
    this._listContainer?.setAttribute('popover', 'manual')
    //#endregion

    // #region Basic attributes for the list element
    this._list!.setAttribute("role", "listbox");
    this._list!.setAttribute("aria-multiselectable", "false");
    this._list!.tabIndex = -1;
    // #endregion

    // #region  Basic attributes for the children of the list element
    const children = this._list!.children;
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
