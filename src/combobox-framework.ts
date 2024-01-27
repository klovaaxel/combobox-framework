import Fuse from "fuse.js";

class ComboboxFramework extends HTMLElement {
    private _input: HTMLInputElement | null = null;
    private _list: HTMLElement | null = null;
    private _originalList: HTMLElement | null = null;
    private _isAltModifierPressed = false;

    // #region Fuzzy search Fuse.js
    private _fuse: Fuse<Element> | null = null;
    private _fuseOptions = {
        includeScore: true,
        keys: ["dataset.display", "dataset.value"],
    };
    // #endregion

    public constructor() {
        super();
    }

    /**
     * Returns an array of the names of the attributes to observe.
     * @static
     * @returns {string[]}
     * @memberof ComboboxFramework
     * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
     */
    static get observedAttributes(): string[] {
        return ["data-value", "data-fuse-options"];
    }

    /**
     * Called when an attribute is changed, appended, removed, or replaced on the element.
     * @param name {string} Name of the attribute that changed
     * @param oldValue {string} Old value of the attribute
     * @param newValue {string} New value of the attribute
     * @returns {void}
     * @memberof ComboboxFramework
     * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
     */
    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (oldValue === newValue) return; // If the value is the same, do nothing

        // #region Handle the attribute change
        switch (name) {
            case "data-value":
                this.selectItemByValue(newValue);
                break;
            case "data-fuse-options":
        }
        // #endregion
    }

    /**
     * Called when the element is inserted into a document, including into a shadow tree.
     * @returns {void}
     * @memberof ComboboxFramework
     * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
     */
    public connectedCallback(): void {
        // #region Create the shadow DOM
        const shadow = this.attachShadow({ mode: "open" });
        shadow.innerHTML = `
        <slot name="input"></slot>
        <slot name="list"></slot>
        `;
        // #endregion

        // #region Fetch the input and list elements
        this._input = this.querySelector('[slot="input"]') as HTMLInputElement;
        this._list = this.querySelector('[slot="list"] [data-list]') as HTMLElement;
        if (!this._list) this._list = this.querySelector('[slot="list"]') as HTMLElement;
        // #endregion

        // #region If the input element is not found, throw an error
        if (!this._input) throw new Error("Input element not found");
        if (!this._list) throw new Error("List element not found");
        // #endregion

        this.setBasicAttribbutes();

        // #region Save the original list
        // This is done to have a original copy of the list to later sort, filter, etc.
        this._originalList = this._list.cloneNode(true) as HTMLElement;
        // #endregion

        // #region Create the fuse object
        this._fuse = new Fuse(
            Array.from((this._originalList.cloneNode(true) as HTMLElement).children),
            this._fuseOptions
        );
        this.searchList();
        // #endregion

        // #region Add event listeners
        this.addEventListeners();
        // #endregion
    }

    /**
     * Set basic attributes for the input and list elements.
     * Mutates the input and list elements that are stored in `_input` and `_list`
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private setBasicAttribbutes(): void {
        // #region Set the ids of the input and list elements if they are not set
        this._input!.id = this._input!.id.length != 0 ? this._input!.id : `input-${crypto.randomUUID()}`;
        this._list!.id = this._list!.id.length != 0 ? this._list!.id : `list-${crypto.randomUUID()}`;
        // #endregion

        // #region Basic attributes for the input element
        this._input!.setAttribute("role", "combobox");
        this._input!.setAttribute("aria-controls", this._list!.id);
        this._input!.setAttribute("aria-expanded", "false");
        this._input!.setAttribute("aria-autocomplete", "list"); // Maybe change this to both?
        this._input!.setAttribute("type", "text");
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

    /**
     * Adds event listeners
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private addEventListeners(): void {
        // #region Add event listeners to the framework element
        this.addEventListener("focusout", this.handleBlur.bind(this));
        // #endregion

        // #region Add event listeners to the input element
        if (!this._input) throw new Error("Input element not found");
        this._input.addEventListener("input", this.searchList.bind(this));
        this._input.addEventListener("focus", this.toggleList.bind(this, true));
        // #endregion

        // #region Add event listeners to framework element
        this._input.addEventListener("keydown", this.handleComboBoxKeyPress.bind(this));
        this._input.addEventListener("keyup", this.handleKeyUp.bind(this));
        // #endregion

        // #region Add event listeners to the list element
        this.addEventListenersToListItems();
        // #endregion
    }

    /**
     * Adds event listeners to the list item elements
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private addEventListenersToListItems(): void {
        // #region Add event listeners to the list item elements
        if (!this._list) throw new Error("List element not found");
        const children = this._list.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            child.addEventListener("keydown", this.handleListKeyPress.bind(this));
            child.addEventListener("keyup", this.handleKeyUp.bind(this));
            child.addEventListener("click", this.selectItem.bind(this, child));
        }
        // #endregion
    }

    /**
     * Search the list and update the list element with the new, filtered, and sorted list
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private searchList(): void {
        // #region Check if required variables are set
        if (!this._fuse) throw new Error("Fuse object not found");
        if (!this._list) throw new Error("List element not found");
        if (!this._input) throw new Error("Input element not found");
        // #endregion

        // #region Clear the selected item
        this.dataset.value = "";
        this.removeAttribute("data-value");
        // #endregion

        // #region If the input is empty, show the original list and return
        if (this._input.value == "") {
            this._list.innerHTML = "";
            this._list.append(...(this._originalList!.cloneNode(true) as HTMLElement).children);
            this.addEventListenersToListItems();
            return;
        }
        // #endregion

        // #region Search the list
        const newList = this._fuse.search(this._input.value).map((item: any) => item.item as HTMLElement);
        // #endregion

        // #region Clear the list and add the new items
        this._list.innerHTML = "";
        this._list.append(...newList);
        // #endregion

        // #region Add event listeners to the list item elements
        this.addEventListenersToListItems();
        // #endregion

        // #region Show the list after the search is complete
        this.toggleList(true);
        // #endregion
    }

    /**
     * Toggles the expanded state of the combobox
     * @private
     * @param {boolean} [newValue] The new value of the expanded state - optional - defaults to the opposite of the current value
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private toggleList(newValue: boolean = this._input!.getAttribute("aria-expanded") === "true"): void {
        this._input!.setAttribute("aria-expanded", `${newValue}`);
        if (!newValue) this.unfocusAllItems();
    }

    /**
     * Selects an item in the list
     * @private
     * @param {HTMLElement} item The item to select
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private focusItem(item: HTMLElement): void {
        if (!item) return;
        item.focus();
        this._list!.querySelectorAll("[aria-selected]").forEach((i) => i.removeAttribute("aria-selected"));
        item.setAttribute("aria-selected", "true");
    }

    /**
     * Unfocuses all items in the list
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private unfocusAllItems(): void {
        this._list!.querySelectorAll("[aria-selected]").forEach((i) => i.removeAttribute("aria-selected"));
    }

    /**
     * Selects an item in the list
     * @private
     * @param {HTMLElement} item The item to select
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private selectItem(item: HTMLElement): void {
        this._input!.value =
            item.dataset.display ?? (!item.children.length ? item.innerText : item.dataset.value) ?? "";
        if (item.dataset.value) this.dataset.value = item.dataset.value;
        this._input!.focus();
        this.toggleList(false);
    }

    /**
     * Selects an item in the list by its value
     * @private
     * @param {string} value The value of the item to select
     * @memberof ComboboxFramework
     * @returns {void}
     */
    selectItemByValue(value: string | null): void {
        if (!value) return;
        const item = this._list!.querySelector(`[data-value="${value}"]`) as HTMLElement;
        if (!item) return;
        this.selectItem(item);
    }

    /**
     * Clears the input element, focuses it and closes the list
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private clearInput(): void {
        this._input!.value = "";
        this._input!.focus();
        this.toggleList(false);
    }

    /**
     * Toggles the expanded state of the combobox if the focus is lost
     * @param event {FocusEvent} The blur event
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private handleBlur(): void {
        // Set a timeout to force the focus event on the list item to fire before the foucsout event on the input element
        setTimeout(() => {
            if (this.querySelector(":focus")) return;
            this.toggleList(false);
        }, 0);
    }

    /**
     * Handles the key press event on the input element
     * @param event {KeyboardEvent} The key press event
     * @memberof ComboboxFramework
     * @returns {void}
     * @see https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction
     */
    private handleComboBoxKeyPress(event: KeyboardEvent): void {
        // #region Check if required variables are set
        if (!this._input) throw new Error("Input element not found");
        if (!this._list) throw new Error("List element not found");
        // #endregion

        // #region Handle the key press
        switch (event.key) {
            case "ArrowDown":
                // If the popup is available, moves focus into the popup: If the autocomplete behavior automatically selected a suggestion before Down Arrow was pressed, focus is placed on the suggestion following the automatically selected suggestion. Otherwise, places focus on the first focusable element in the popup.
                if (this._input.getAttribute("aria-expanded") !== "true") {
                    this.toggleList(true);
                    if (!this._isAltModifierPressed) this.focusItem(this._list.children[0] as HTMLElement);
                } else {
                    this.focusItem(this._list.children[0] as HTMLElement);
                }
                break;
            case "UpArrow":
                // (Optional): If the popup is available, places focus on the last focusable element in the popup.
                if (this._input.getAttribute("aria-expanded") !== "true") {
                    this.toggleList(true);
                    this.focusItem(this._list.children[this._list.children.length - 1] as HTMLElement);
                }
                break;
            case "Escape":
                // Dismisses the popup if it is visible. Optionally, if the popup is hidden before Escape is pressed, clears the combobox.
                if (this._input.getAttribute("aria-expanded") === "true") {
                    this.toggleList(false);
                } else {
                    this._input.value = "";
                }
                this._input.focus();
                break;
            case "Enter":
                // Autocompletes the combobox with the first suggestion
                if (this._input.getAttribute("aria-expanded") === "true") {
                    this.selectItem(this._list.children[0] as HTMLElement);
                }
                break;
            case "Alt":
                this._isAltModifierPressed = true;
                break;
        }
        // #endregion
    }

    /**
     * Handles the key press event on the list element
     * @param event {KeyboardEvent} The key press event
     * @memberof ComboboxFramework
     * @returns {void}
     * @see https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction
     */
    private handleListKeyPress(event: KeyboardEvent): void {
        // #region Check if required variables are set
        if (!this._input) throw new Error("Input element not found");
        if (!this._list) throw new Error("List element not found");
        // #endregion

        // #region Handle the key press
        const li = event.target as HTMLElement;
        switch (event.key) {
            case "Enter":
                // Select the item and close the list
                this.selectItem(li);
                break;
            case "Escape":
                // Close the list and focus the input
                this.clearInput();
                break;
            case "ArrowDown":
                // Move focus to the next item in the list
                const nextLi = li.nextElementSibling as HTMLElement;
                if (nextLi) this.focusItem(nextLi);
                else this.focusItem(this._list.children[0] as HTMLElement);
                break;
            case "ArrowUp":
                // If alt is pressed, close the list and focus the input
                if (this._isAltModifierPressed) {
                    this._input.focus();
                    this.toggleList(false);
                    break;
                }

                // Move focus to the previous item in the list
                const previousLi = li.previousElementSibling as HTMLElement;
                if (previousLi) this.focusItem(previousLi);
                else this.focusItem(this._list.children[this._list.children.length - 1] as HTMLElement);
                break;
            case "ArrowRight":
                // returns focus to the combobox without closing the popup
                this._input.focus();
                break;
            case "ArrowLeft":
                // returns focus to the combobox without closing the popup
                this._input.focus();
                break;
            case "Home":
                // Move focus to the first item in the list
                this._input.focus();
                break;
            case "End":
                // Move focus to the last item in the list
                this._input.focus();
                break;
            case "Backspace":
                // Move focus to the last item in the list
                this._input.focus();
                break;
            case "Delete":
                // Move focus to the last item in the list
                this._input.focus();
                break;
            case "Alt":
                this._isAltModifierPressed = true;
                break;
        }
        // #endregion
    }

    /**
     * Handles the key up event on the input element and list element
     * @param event {KeyboardEvent} The key up event
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private handleKeyUp(event: KeyboardEvent): void {
        // #region Check if required variables are set
        if (!this._input) throw new Error("Input element not found");
        if (!this._list) throw new Error("List element not found");
        // #endregion

        // #region Handle the key press
        switch (event.key) {
            case "Alt":
                this._isAltModifierPressed = false;
                break;
        }
        // #endregion
    }
}

// #region Register the component
customElements.define("combobox-framework", ComboboxFramework);
// #endregion
