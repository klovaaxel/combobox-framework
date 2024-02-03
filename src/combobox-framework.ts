import Fuse, { FuseResult } from "fuse.js";

export default class ComboboxFramework extends HTMLElement {
    private _input: HTMLInputElement | null = null;
    private _list: HTMLElement | null = null;
    private _originalList: HTMLElement | null = null;
    private _isAltModifierPressed = false;
    private _forceValue = false;
    private _lastValue: string | undefined = undefined;
    private _limit: number = Infinity;

    // #region Fuzzy search Fuse.js
    private _fuse: Fuse<Element> | null = null;
    private _fuseOptions = {
        keys: ["dataset.display", "dataset.value", "innerText"],
    };
    // #endregion

    /**
     * Returns an array of the names of the attributes to observe.
     * @static
     * @returns {string[]}
     * @memberof ComboboxFramework
     * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
     */
    static get observedAttributes(): string[] {
        return [
            "data-value",
            "data-fuse-options",
            "data-listbox",
            "data-limit",
        ];
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
    public attributeChangedCallback(
        name: string,
        oldValue: string,
        newValue: string,
    ): void {
        if (oldValue === newValue) return; // If the value is the same, do nothing

        // #region Handle the attribute change
        switch (name) {
            case "data-value":
                this.selectItemByValue(newValue, false);
                break;
            case "data-fuse-options":
                if (!this._originalList) this.fetchOriginalList();

                this._fuseOptions = JSON.parse(newValue);
                this._fuse = new Fuse(
                    Array.from(
                        (this._originalList!.cloneNode(true) as HTMLElement)
                            .children,
                    ),
                    this._fuseOptions,
                );
                this.searchList();
                break;
            case "data-listbox":
                this._forceValue = !!newValue;
                break;
            case "data-limit":
                this._limit = parseInt(newValue);
                break;
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
        this.fetchInput();
        this.fetchList();
        // #endregion

        this.setBasicAttribbutes();

        // #region Save the original list
        // This is done to have a original copy of the list to later sort, filter, etc.
        this.fetchOriginalList();
        // #endregion

        // #region Create the fuse object
        this._fuse = new Fuse(
            Array.from(
                (this._originalList!.cloneNode(true) as HTMLElement).children,
            ),
            this._fuseOptions,
        );
        // #endregion

        // #region Do initial search the list
        this.searchList();
        // #endregion

        // #region Add event listeners
        this.addEventListeners();
        // #endregion

        // #region If forceValue is true, select the first item in the list
        this.forceValue();
        // #endregion
    }

    /**
     * Called when the element is removed from a document. Removes event listeners.
     * @returns {void}
     * @memberof ComboboxFramework
     * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
     */
    public disconnectedCallback(): void {
        // #region Remove event listeners
        this.removeEventListener("focusout", this.handleBlur.bind(this));
        // #endregion

        // #region Remove event listeners from the input element
        if (!this._input) this.fetchList();
        this._input!.removeEventListener(
            "input",
            this.searchList.bind(this, true, true),
        );
        this._input!.removeEventListener(
            "focus",
            this.toggleList.bind(this, true),
        );
        // #endregion

        // #region Remove event listeners from framework element
        this._input!.removeEventListener(
            "keydown",
            this.handleComboBoxKeyPress.bind(this),
        );
        this._input!.removeEventListener("keyup", this.handleKeyUp.bind(this));
        // #endregion

        // #region Remove event listeners from the list element
        this.removeEventListenersFromListItems();
        // #endregion
    }

    /**
     * Fetches the list element and stores it in `_list`
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private fetchList(): void {
        this._list = this.querySelector(
            '[slot="list"] [data-list]',
        ) as HTMLElement;
        if (!this._list)
            this._list = this.querySelector('[slot="list"]') as HTMLElement;
        if (!this._list) throw new Error("List element not found");
    }

    /**
     * Fetches the input element and stores it in `_input`
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private fetchInput(): void {
        this._input = this.querySelector('[slot="input"]') as HTMLInputElement;
        if (!this._input) throw new Error("Input element not found");
    }

    /**
     * Fetches the original list element and stores it in `_originalList`
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private fetchOriginalList(): void {
        if (!this._list) this.fetchList();
        this._originalList = this._list!.cloneNode(true) as HTMLElement;
    }

    /**
     * Removes event listeners from the list item elements
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private removeEventListenersFromListItems(): void {
        // #region Remove event listeners from the list item elements
        if (!this._list) this.fetchList();
        const children = this._list!.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            child.removeEventListener(
                "keydown",
                this.handleListKeyPress.bind(this),
            );
            child.removeEventListener("keyup", this.handleKeyUp.bind(this));
            child.removeEventListener(
                "click",
                this.selectItem.bind(this, child, true),
            );
        }
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
        this._input!.id =
            this._input!.id.length !== 0
                ? this._input!.id
                : `input-${crypto.randomUUID()}`;
        this._list!.id =
            this._list!.id.length !== 0
                ? this._list!.id
                : `list-${crypto.randomUUID()}`;
        // #endregion

        // #region Basic attributes for the input element
        this._input!.setAttribute("role", "combobox");
        this._input!.setAttribute("aria-controls", this._list!.id);
        this._input!.setAttribute("aria-expanded", "false");
        this._input!.setAttribute("aria-autocomplete", "list"); // Maybe change this to both?
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
        if (!this._input) this.fetchInput();
        this._input!.addEventListener(
            "input",
            this.searchList.bind(this, true, true),
        );
        this._input!.addEventListener(
            "focus",
            this.toggleList.bind(this, true),
        );
        // #endregion

        // #region Add event listeners to framework element
        this._input!.addEventListener(
            "keydown",
            this.handleComboBoxKeyPress.bind(this),
        );
        this._input!.addEventListener("keyup", this.handleKeyUp.bind(this));
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
        if (!this._list) this.fetchList();
        const children = this._list!.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            child.addEventListener(
                "keydown",
                this.handleListKeyPress.bind(this),
            );
            child.addEventListener("keyup", this.handleKeyUp.bind(this));
            child.addEventListener(
                "click",
                this.selectItem.bind(this, child, true),
            );
        }
        // #endregion
    }

    /**
     * Search the list and update the list element with the new, filtered, and sorted list
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private searchList(openList = true, clearValue = true): void {
        // #region Check if required variables are set
        if (!this._fuse) throw new Error("Fuse object not found");
        if (!this._list) this.fetchList();
        if (!this._input) this.fetchInput();
        // #endregion

        // #region Clear the selected item
        if (clearValue) {
            this.dataset.value = "";
            this.sendChangeEvent();
        }
        // #endregion

        // #region If the input is empty, show the original list and return
        if (this._input!.value === "") {
            this._list!.innerHTML = "";
            this._list!.append(
                ...Array.from(
                    (this._originalList!.cloneNode(true) as HTMLElement)
                        .children,
                ).slice(0, this._limit),
            );
            this.addEventListenersToListItems();
            return;
        }
        // #endregion

        // #region Search the list
        const newList = this._fuse
            .search(this._input!.value)
            .map((item: FuseResult<Element>) => item.item as HTMLElement);
        // #endregion

        // #region Clear the list and add the new items
        this._list!.innerHTML = "";
        this._list!.append(
            ...newList
                .map((item) => item.cloneNode(true) as HTMLElement)
                .slice(0, this._limit),
        );
        // #endregion

        // #region Highlight the search string in the list items (or nested childrens) text content
        const highlightTextContent = (node: Element) => {
            if (
                node.nodeType === Node.TEXT_NODE &&
                node.textContent?.trim() !== "" &&
                node.textContent?.trim() !== "\n"
            ) {
                const text = node.textContent ?? "";
                const newNode = document.createElement("template");
                newNode.innerHTML = this.highlightText(
                    text,
                    this._input!.value,
                );
                node.replaceWith(newNode.content);
            } else {
                for (const childNode of node.childNodes) {
                    highlightTextContent(childNode as Element);
                }
            }
        };

        for (const item of this._list!.children) {
            highlightTextContent(item);
        }
        // #endregion

        // #region Add event listeners to the list item elements
        this.addEventListenersToListItems();
        // #endregion

        // #region Show the list after the search is complete
        this.toggleList(openList);
        // #endregion
    }

    /**
     * Highlights the search string in the text
     * @private
     * @param {string} text The text to highlight
     * @param {string} searchString The search string
     * @memberof ComboboxFramework
     * @returns {string}
     */
    private highlightText(text: string, searchString: string): string {
        const regex = new RegExp(`[${searchString}]+`, "gmi");
        return text.replace(regex, "<strong>$&</strong>");
    }

    /**
     * Toggles the expanded state of the combobox
     * @private
     * @param {boolean} [newValue] The new value of the expanded state - optional - defaults to the opposite of the current value
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private toggleList(
        newValue: boolean = this._input!.getAttribute("aria-expanded") ===
            "true",
    ): void {
        this._input!.setAttribute("aria-expanded", `${newValue}`);
        if (!newValue) this.unfocusAllItems();
    }

    /**
     * Focuses an item in the list
     * @private
     * @param {HTMLElement} item The list item to focus
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private focusItem(item: HTMLElement): void {
        if (!item) return;
        item.focus();
        this.unfocusAllItems();
        item.setAttribute("aria-selected", "true");
    }

    /**
     * Unfocuses all items in the list
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private unfocusAllItems(): void {
        // #region Check if required variables are set
        if (!this._list) this.fetchList();
        // #endregion

        // #region Unfocus all items in the list
        for (const item of this._list!.querySelectorAll("[aria-selected]"))
            item.removeAttribute("aria-selected");
        // #endregion
    }

    /**
     * Selects an item in the list
     * @private
     * @param {HTMLElement} item The item to select
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private selectItem(item: HTMLElement, grabFocus = true): void {
        if (!this._input) this.fetchInput();

        // #region Set the value of the input element
        // If the item has a data-display attribute, use that as the value
        if (item.dataset.display) this._input!.value = item.dataset.display;
        // Else If the element does not have any children or only has strong children, use the innerText as the value
        else if (
            item.children.length ||
            Array.from(item.children).every((c) => c.nodeName === "STRONG")
        )
            this._input!.value = item.innerText;
        // Else If the element has a data-value attribute, use that as the value
        else if (item.dataset.value) this._input!.value = item.dataset.value;
        // Else fallback to a empty string
        else this._input!.value = "";
        // #endregion

        if (item.dataset.value) this.dataset.value = item.dataset.value;
        if (grabFocus) this._input!.focus();
        this.toggleList(false);
        this.searchList(false, false);
        this.sendChangeEvent();
    }

    /**
     * Sends a change event
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private sendChangeEvent(): void {
        if (this.dataset.value === this._lastValue) return;
        const event = new Event("change");
        this.dispatchEvent(event);
        this._lastValue = this.dataset.value;
    }

    /**
     * Selects an item in the list by its value
     * @private
     * @param {string} value The value of the item to select
     * @memberof ComboboxFramework
     * @returns {void}
     */
    selectItemByValue(value: string | null, grabFocus = true): void {
        if (!value) return;
        if (!this._list) this.fetchList();
        const item = this._list!.querySelector(
            `[data-value="${value}"]`,
        ) as HTMLElement;
        if (!item) return;
        this.selectItem(item, grabFocus);
    }

    /**
     * Clears the input element, focuses it and closes the list
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private clearInput(grabFocus = true): void {
        // #region Check if required variables are set
        if (!this._input) this.fetchInput();
        // #endregion

        // #region Clear the input element
        this._input!.value = "";
        if (grabFocus) this._input!.focus();
        this.toggleList(false);
        // #endregion
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

            // #region If forceValue is true, select the first item in the list
            this.forceValue();
            // #endregion

            this.toggleList(false);
        }, 0);
    }

    /**
     * Forces the value of the input element to the first item in the list if the input element is not empty
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private forceValue(): void {
        // #region Check if required variables are set
        if (!this._input) this.fetchInput();
        if (!this._list) this.fetchList();
        // #endregion

        // #region If forceValue is true and we don't have a value selected, select the first item (best match) in the list or empty the input and value
        if (this._forceValue && !!this._input?.value && !this.dataset.value) {
            const bestMatch = this._list!.children[0] as HTMLElement;
            if (bestMatch) this.selectItem(bestMatch, false);
            else {
                this.clearInput(false); // Clear the input
                this.dataset.value = ""; // Clear the value
                this.sendChangeEvent(); // Send a change event
            }
        }
        // #endregion
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
        if (!this._input) this.fetchInput();
        if (!this._list) this.fetchList();
        // #endregion

        // #region Handle the key press
        switch (event.key) {
            case "ArrowDown":
                // If the popup is available, moves focus into the popup: If the autocomplete behavior automatically selected a suggestion before Down Arrow was pressed, focus is placed on the suggestion following the automatically selected suggestion. Otherwise, places focus on the first focusable element in the popup.
                if (this._input!.getAttribute("aria-expanded") !== "true") {
                    this.toggleList(true);
                    if (!this._isAltModifierPressed)
                        this.focusItem(this._list!.children[0] as HTMLElement);
                } else {
                    this.focusItem(this._list!.children[0] as HTMLElement);
                }
                event.preventDefault(); // prevent scrolling
                break;
            case "UpArrow":
                // (Optional): If the popup is available, places focus on the last focusable element in the popup.
                if (this._input!.getAttribute("aria-expanded") !== "true") {
                    this.toggleList(true);
                    this.focusItem(
                        this._list!.children[
                            this._list!.children.length - 1
                        ] as HTMLElement,
                    );
                }
                event.preventDefault(); // prevent scrolling
                break;
            case "Escape":
                // Dismisses the popup if it is visible. Optionally, if the popup is hidden before Escape is pressed, clears the combobox.
                if (this._input!.getAttribute("aria-expanded") === "true") {
                    this.toggleList(false);
                } else {
                    this._input!.value = "";
                }
                this._input!.focus();
                break;
            case "Enter":
                // Autocompletes the combobox with the first suggestion
                if (this._input!.getAttribute("aria-expanded") === "true") {
                    this.selectItem(this._list!.children[0] as HTMLElement);
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
        if (!this._input) this.fetchInput();
        if (!this._list) this.fetchList();
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
            case "ArrowDown": {
                // Move focus to the next item in the list
                const nextLi = li.nextElementSibling as HTMLElement;
                if (nextLi) this.focusItem(nextLi);
                else this.focusItem(this._list!.children[0] as HTMLElement);
                event.preventDefault(); // prevent scrolling
                break;
            }
            case "ArrowUp": {
                // If alt is pressed, close the list and focus the input
                if (this._isAltModifierPressed) {
                    this._input!.focus();
                    this.toggleList(false);
                    event.preventDefault(); // prevent scrolling
                    break;
                }

                // Move focus to the previous item in the list
                const previousLi = li.previousElementSibling as HTMLElement;
                if (previousLi) this.focusItem(previousLi);
                else
                    this.focusItem(
                        this._list!.children[
                            this._list!.children.length - 1
                        ] as HTMLElement,
                    );
                event.preventDefault(); // prevent scrolling
                break;
            }
            case "ArrowRight":
                // returns focus to the combobox without closing the popup
                this._input!.focus();
                break;
            case "ArrowLeft":
                // returns focus to the combobox without closing the popup
                this._input!.focus();
                break;
            case "Home":
                // Move focus to the first item in the list
                this._input!.focus();
                break;
            case "End":
                // Move focus to the last item in the list
                this._input!.focus();
                break;
            case "Backspace":
                // Move focus to the last item in the list
                this._input!.focus();
                break;
            case "Delete":
                // Move focus to the last item in the list
                this._input!.focus();
                break;
            case "Alt":
                this._isAltModifierPressed = true;
                break;
            default:
                // If the key is not handled, return focus to the input
                this._input!.focus();
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
