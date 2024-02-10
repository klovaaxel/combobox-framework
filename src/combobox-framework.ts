import Fuse, { FuseResult } from "fuse.js";
import { handleBlur, handleComboBoxKeyPress, handleKeyUp, handleListKeyPress } from "./handlers";
import { fetchInput, fetchList, fetchOriginalList, setBasicAttribbutes } from "./helpers";

export default class ComboboxFramework extends HTMLElement {
    public _input: HTMLInputElement | null = null;
    public _list: HTMLElement | null = null;
    public _originalList: HTMLElement | null = null;
    public _isAltModifierPressed = false;
    public _forceValue = false;
    public _lastValue: string | undefined = undefined;
    public _limit: number = Infinity;

    // #region Fuzzy search Fuse.js
    public _fuse: Fuse<Element> | null = null;
    public _fuseOptions = {
        includeScore: true,
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
        return ["data-value", "data-fuse-options", "data-listbox", "data-limit"];
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
                this.selectItemByValue(newValue, false);
                break;
            case "data-fuse-options":
                if (!this._originalList) fetchOriginalList.call(this);

                this._fuseOptions = JSON.parse(newValue);
                this._fuse = new Fuse(
                    Array.from((this._originalList!.cloneNode(true) as HTMLElement).children),
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
        fetchInput.call(this);
        fetchList.call(this);
        // #endregion

        setBasicAttribbutes.call(this);

        // #region Save the original list
        // This is done to have a original copy of the list to later sort, filter, etc.
        fetchOriginalList.call(this);
        // #endregion

        // #region Create the fuse object
        this._fuse = new Fuse(
            Array.from((this._originalList!.cloneNode(true) as HTMLElement).children),
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
        this.removeEventListener("focusout", handleBlur.bind(this));
        // #endregion

        // #region Remove event listeners from the input element
        if (!this._input) fetchList.call(this);
        this._input!.removeEventListener("input", this.searchList.bind(this, true, true));
        this._input!.removeEventListener("focus", this.toggleList.bind(this, true));
        // #endregion

        // #region Remove event listeners from framework element
        this._input!.removeEventListener("keydown", handleComboBoxKeyPress.bind(this));
        this._input!.removeEventListener("keyup", handleKeyUp.bind(this));
        // #endregion

        // #region Remove event listeners from the list element
        this.removeEventListenersFromListItems();
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
        this.addEventListener("focusout", handleBlur.bind(this));
        // #endregion

        // #region Add event listeners to the input element
        if (!this._input) fetchInput.call(this);
        this._input!.addEventListener("input", this.searchList.bind(this, true, true));
        this._input!.addEventListener("focus", this.toggleList.bind(this, true));
        // #endregion

        // #region Add event listeners to framework element
        this._input!.addEventListener("keydown", handleComboBoxKeyPress.bind(this));
        this._input!.addEventListener("keyup", handleKeyUp.bind(this));
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
        if (!this._list) fetchList.call(this);
        const children = this._list!.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            child.addEventListener("keydown", handleListKeyPress.bind(this));
            child.addEventListener("keyup", handleKeyUp.bind(this));
            child.addEventListener("click", this.selectItem.bind(this, child, true));
        }
        // #endregion
    }

    /**
     * Removes event listeners from the list item elements
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private removeEventListenersFromListItems(): void {
        // #region Remove event listeners from the list item elements
        if (!this._list) fetchList.call(this);
        const children = this._list!.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            child.removeEventListener("keydown", handleListKeyPress.bind(this));
            child.removeEventListener("keyup", handleKeyUp.bind(this));
            child.removeEventListener("click", this.selectItem.bind(this, child, true));
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
        if (!this._list) fetchList.call(this);
        if (!this._input) fetchInput.call(this);
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
                ...Array.from((this._originalList!.cloneNode(true) as HTMLElement).children)
                    .slice(0, this._limit)
                    .sort(
                        (a, b) =>
                            Number((b as HTMLElement).dataset.weight) -
                            Number((a as HTMLElement).dataset.weight),
                    ),
            );
            this.addEventListenersToListItems();
            return;
        }
        // #endregion

        // #region Search the list
        let searchedList = this._fuse.search(this._input!.value).slice(0, this._limit);

        // #region Sort the list based on the weight of the items if they have a weight and a score
        searchedList = searchedList
            .map((i) => ({
                item: i.item as HTMLElement,
                score: i.score ?? 1,
                weight: Number((i.item as HTMLElement).dataset.weight ?? 1),
                refIndex: i.refIndex,
            }))
            .sort((a, b) => a.score * (b.weight / a.weight) - b.score * (a.weight / b.weight))
            .map((i) => ({
                item: i.item,
                score: i.score,
                weight: i.weight,
                refIndex: i.refIndex,
            }));

        const newList = searchedList.map((item: FuseResult<Element>) => item.item as HTMLElement);
        // #endregion

        // #region Clear the list and add the new items
        this._list!.innerHTML = "";
        this._list!.append(...newList.map((item) => item.cloneNode(true) as HTMLElement));
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
                newNode.innerHTML = this.highlightText(text, this._input!.value);
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
    public toggleList(
        newValue: boolean = this._input!.getAttribute("aria-expanded") === "true",
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
    public focusItem(item: HTMLElement): void {
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
        if (!this._list) fetchList.call(this);
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
    public selectItem(item: HTMLElement, grabFocus = true): void {
        if (!this._input) fetchInput.call(this);

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
     * Selects an item in the list by its value
     * @private
     * @param {string} value The value of the item to select
     * @memberof ComboboxFramework
     * @returns {void}
     */
    private selectItemByValue(value: string | null, grabFocus = true): void {
        if (!value) return;
        if (!this._list) fetchList.call(this);
        const item = this._list!.querySelector(`[data-value="${value}"]`) as HTMLElement;
        if (!item) return;
        this.selectItem(item, grabFocus);
    }

    /**
     * Clears the input element, focuses it and closes the list
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    public clearInput(grabFocus = true): void {
        // #region Check if required variables are set
        if (!this._input) fetchInput.call(this);
        // #endregion

        // #region Clear the input element
        this._input!.value = "";
        if (grabFocus) this._input!.focus();
        this.toggleList(false);
        // #endregion
    }

    /**
     * Forces the value of the input element to the first item in the list if the input element is not empty
     * @private
     * @memberof ComboboxFramework
     * @returns {void}
     */
    public forceValue(): void {
        // #region Check if required variables are set
        if (!this._input) fetchInput.call(this);
        if (!this._list) fetchList.call(this);
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
}

// #region Register the component
customElements.define("combobox-framework", ComboboxFramework);
// #endregion
