import Fuse, { FuseResult } from "fuse.js";
import { handleBlur, handleComboBoxKeyPress, handleKeyUp, handleListKeyPress } from "./handlers";
import {
    fetchInput,
    fetchList,
    fetchListContainer,
    fetchOriginalList,
    setBasicAttributes,
} from "./helpers";

export default class ComboboxFramework extends HTMLElement {
    public _input: HTMLInputElement | null = null;
    public _list: HTMLElement | null = null;
    public _listContainer: HTMLElement | null = null;
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

    private abortController = new AbortController();

    static get observedAttributes(): string[] {
        return ["data-value", "data-fuse-options", "data-listbox", "data-limit"];
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (oldValue === newValue) return; // If the value is the same, do nothing

        // #region Handle the attribute change
        switch (name) {
            case "data-value":
                this.selectItemByValue(newValue, false);
                break;
            case "data-fuse-options": {
                // #region If the fuse object is not created, save the options and return
                if (!this._fuse) {
                    this._fuseOptions = JSON.parse(newValue);
                    return;
                }
                // #endregion

                // #region If the fuse object is created, recreate it and search the list
                const originalList = fetchOriginalList.call(this);

                this._fuseOptions = JSON.parse(newValue);
                this._fuse = new Fuse(
                    Array.from((originalList.cloneNode(true) as HTMLElement).children),
                    this._fuseOptions,
                );
                this.searchList();
                // #endregion
                break;
            }
            case "data-listbox":
                if (newValue === "false") this._forceValue = false;
                else this._forceValue = !!newValue;
                break;
            case "data-limit":
                this._limit = parseInt(newValue);
                break;
        }
        // #endregion
    }

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
        fetchListContainer.call(this);
        fetchList.call(this);
        // #endregion

        setBasicAttributes.call(this);

        // #region Save the original list
        // This is done to have a original copy of the list to later sort, filter, etc.
        const originalList = fetchOriginalList.call(this);
        // #endregion

        // #region Create the fuse object
        this._fuse = new Fuse(
            Array.from((originalList.cloneNode(true) as HTMLElement).children),
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

    public disconnectedCallback(): void {
        // #region Send signal to remove all event listeners
        this.abortController.abort();
        // #endregion
    }

    public toggleList(
        newValue: boolean = this._input?.getAttribute("aria-expanded") !== true.toString(),
    ): void {
        const input = fetchInput.call(this);

        input.setAttribute("aria-expanded", `${newValue}`);
        if (newValue) {
            this._listContainer?.showPopover();
        } else {
            this._listContainer?.hidePopover();
            this.unfocusAllItems();
        }
    }

    public focusItem(item: HTMLElement): void {
        if (!item) return;
        this.unfocusAllItems();
        item.focus();
        item.setAttribute("aria-selected", "true");
    }

    private addEventListeners(): void {
        const input = fetchInput.call(this);

        // #region Add event listeners to the framework element
        this.addEventListener("focusout", handleBlur.bind(this), {
            signal: this.abortController.signal,
        });
        // #endregion

        // #region Add event listeners to the input element
        if (!this._input) fetchInput.call(this);
        input.addEventListener("input", this.searchList.bind(this, true, true), {
            signal: this.abortController.signal,
        });
        input.addEventListener("focus", this.toggleList.bind(this, true), {
            signal: this.abortController.signal,
        });
        // #endregion

        // #region Add event listeners to framework element
        input.addEventListener("keydown", handleComboBoxKeyPress.bind(this), {
            signal: this.abortController.signal,
        });
        input.addEventListener("keyup", handleKeyUp.bind(this), {
            signal: this.abortController.signal,
        });
        // #endregion

        // #region Add event listeners to the list element
        this.addEventListenersToListItems();
        // #endregion
    }

    private addEventListenersToListItems(): void {
        // #region Add event listeners to the list item elements
        const list = fetchList.call(this);
        const children = list.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            child.addEventListener("keydown", handleListKeyPress.bind(this), {
                signal: this.abortController.signal,
            });
            child.addEventListener("keyup", handleKeyUp.bind(this), {
                signal: this.abortController.signal,
            });
            child.addEventListener("click", this.selectItem.bind(this, child, true), {
                signal: this.abortController.signal,
            });
        }
        // #endregion
    }

    private searchList(openList = true, clearValue = true): void {
        // #region Check if required variables are set
        if (!this._fuse) throw new Error("Fuse object not found");
        const input = fetchInput.call(this);
        const list = fetchList.call(this);
        const originalList = fetchOriginalList.call(this);
        // #endregion

        // #region Clear the selected item
        if (clearValue) {
            this.dataset.value = "";
            this.sendChangeEvent();
        }
        // #endregion

        // #region If the input is empty, show the original list and return
        if (input.value === "") {
            list.innerHTML = "";
            list.append(
                ...Array.from((originalList.cloneNode(true) as HTMLElement).children)
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
        let searchedList = this._fuse.search(input.value).slice(0, this._limit);

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
        list.innerHTML = "";
        list.append(...newList.map((item) => item.cloneNode(true) as HTMLElement));
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
                newNode.innerHTML = this.highlightText(text, input.value);
                node.replaceWith(newNode.content);
            } else {
                for (const childNode of node.childNodes) {
                    highlightTextContent(childNode as Element);
                }
            }
        };

        for (const item of list.children) {
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

    private highlightText(text: string, searchString: string): string {
        const escapedSearchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`[${escapedSearchString}]+`, "gmi");
        return text.replace(regex, "<strong>$&</strong>");
    }

    private unfocusAllItems(): void {
        // #region Check if required variables are set
        const list = fetchList.call(this);
        // #endregion

        // #region Unfocus all items in the list
        for (const item of list.querySelectorAll("[aria-selected]"))
            item.removeAttribute("aria-selected");
        // #endregion
    }

    public selectItem(item: HTMLElement, grabFocus = true): void {
        const input = fetchInput.call(this);

        // #region Set the value of the input element
        // If the item has a data-display attribute, use that as the value
        if (item.dataset.display) input.value = item.dataset.display;
        // Else If the element does not have any children or only has strong children, use the innerText as the value
        else if (
            item.children.length ||
            Array.from(item.children).every((c) => c.nodeName === "STRONG")
        )
            input.value = item.innerText;
        // Else If the element has a data-value attribute, use that as the value
        else if (item.dataset.value) input.value = item.dataset.value;
        // Else fallback to a empty string
        else input.value = "";
        // #endregion

        if (item.dataset.value) this.dataset.value = item.dataset.value;
        if (grabFocus) input.focus();
        this.toggleList(false);
        this.searchList(false, false);
        this.sendChangeEvent();
    }

    private selectItemByValue(value: string | null, grabFocus = true): void {
        if (!value) return;
        const list = fetchList.call(this);
        const item = list.querySelector(`[data-value="${value}"]`) as HTMLElement;
        if (!item) return;
        this.selectItem(item, grabFocus);
    }

    public clearInput(grabFocus = true): void {
        // #region Check if required variables are set
        const input = fetchInput.call(this);
        // #endregion

        // #region Clear the input element
        input.value = "";
        if (grabFocus) input.focus();
        this.toggleList(false);
        // #endregion
    }

    public forceValue(): void {
        // #region Check if required variables are set
        const list = fetchList.call(this);
        // #endregion

        // #region If forceValue is true and we don't have a value selected, select the first item (best match) in the list or empty the input and value
        if (this._forceValue && !!this._input?.value && !this.dataset.value) {
            const bestMatch = list.children[0] as HTMLElement;
            if (bestMatch) this.selectItem(bestMatch, false);
            else {
                this.clearInput(false); // Clear the input
                this.dataset.value = ""; // Clear the value
                this.sendChangeEvent(); // Send a change event
            }
        }
        // #endregion
    }

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
