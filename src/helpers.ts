import ComboboxFramework from "./combobox-framework";

/**
 * Fetches the list element and stores it in `_list`
 * If the list element is already stored, does nothing
 * If the list element is not found, it throws an error
 * @returns { HTMLElement } list element
 * @param { ComboboxFramework } combobox combobox-framework element
 */
export function fetchList(this: ComboboxFramework): void {
    if (this._list) return;
    this._list = this.querySelector('[slot="list"] [data-list]') as HTMLElement;
    if (!this._list) this._list = this.querySelector('[slot="list"]') as HTMLElement;
    if (!this._list) throw new Error("List element not found");
}

/**
 * Fetches the input element and stores it in `_input`
 * If the input element is already stored, does nothing
 * If the input element is not found, it throws an error
 * @returns { HTMLInputElement } input element
 * @param { ComboboxFramework } combobox combobox-framework element
 */
export function fetchInput(this: ComboboxFramework): void {
    if (this._input) return;
    const input = this.querySelector('[slot="input"]') as HTMLInputElement;
    if (!input) throw new Error("Input element not found");
    this._input = input;
}

/**
 * Fetches the original list element and stores it in `_originalList`
 * If the original list element is already stored, it returns the stored original list element
 * If no list element is found, it throws an error
 * @returns { HTMLElement } original list element
 * @param { ComboboxFramework } combobox combobox-framework element
 */
export function fetchOriginalList(this: ComboboxFramework): void {
    if (this._originalList) return;

    fetchList.call(this);
    this._originalList = this._list!.cloneNode(true) as HTMLElement;
}

/**
 * Set basic attributes for the input and list elements.
 * Mutates the input and list elements that are stored in `_input` and `_list`
 * @returns { void }
 * @param { ComboboxFramework } combobox combobox-framework element
 */
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

    // #region Basic attributes for the list element
    this._list!.setAttribute("role", "listbox");
    this._list!.setAttribute("aria-multiselectable", "false");
    this._list!.setAttribute("anchor", this._input!.id);
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
