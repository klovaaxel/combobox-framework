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
    public input: HTMLInputElement | null = null;
    public list: HTMLElement | null = null;
    public listContainer: HTMLElement | null = null;
    public originalList: HTMLElement | null = null;
    public isAltModifierPressed = false;
    public shouldForceValue = false;
    public lastValue: string | undefined = undefined;
    public limit: number = Infinity;

    // #region Fuzzy search Fuse.js
    public _fuse: Fuse<Element> | null = null;
    public _fuseOptions = {
        includeScore: true,
        keys: ["dataset.display", "dataset.value", "innerText"],
    };
    // #endregion

    private abortController = new AbortController();
    private initFuseObj = () => {
        const originalList = this.originalList ?? fetchOriginalList.call(this);
        const elementArray = Array.from((originalList.cloneNode(true) as HTMLElement).children);

        return new Fuse(Array.from(elementArray), this._fuseOptions);
    };

    constructor() {
        super();

        this.abortController ??= new AbortController();
        this.attachShadow({ mode: "open" });
    }

    static get observedAttributes(): string[] {
        return ["data-value", "data-fuse-options", "data-listbox", "data-limit"];
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (oldValue === newValue) return;

        switch (name) {
            case "data-value":
                this.selectItemByValue(newValue, false);
                break;
            case "data-fuse-options":
                this._fuseOptions = JSON.parse(newValue);
                this._fuse = this.initFuseObj();
                this.searchList();
                break;
            case "data-listbox":
                if (newValue === "false") this.shouldForceValue = false;
                else this.shouldForceValue = !!newValue;
                break;
            case "data-limit":
                this.limit = parseInt(newValue);
                break;
        }
    }

    public connectedCallback(): void {
        const shadow = this.shadowRoot as ShadowRoot;

        // #region Create the shadow DOM
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

        this.originalList = fetchOriginalList.call(this);
        this._fuse ??= this.initFuseObj.call(this);

        this.searchList();
        this.addEventListeners();
        this.forcedValue();
    }

    public disconnectedCallback(): void {
        this.abortController.abort();
    }

    public toggleList(
        newValue: boolean = this.input?.getAttribute("aria-expanded") !== true.toString(),
    ): void {
        const input = fetchInput.call(this);

        input.setAttribute("aria-expanded", `${newValue}`);
        if (newValue) {
            this.listContainer?.showPopover();
        } else {
            this.listContainer?.hidePopover();
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
        if (!this.input) fetchInput.call(this);
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

        this.addEventListenersToListItems();
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
        this._fuse ??= this.initFuseObj();
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
                    .slice(0, this.limit)
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
        let searchedList = this._fuse.search(input.value).slice(0, this.limit);

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
        const html = text.replace(regex, "<strong>$&</strong>");

        const sanitizedHtml = html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, "<strong>$1</strong>");

        return sanitizedHtml;
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

    public forcedValue(): void {
        // #region Check if required variables are set
        const list = fetchList.call(this);
        // #endregion

        // #region If forceValue is true and we don't have a value selected, select the first item (best match) in the list or empty the input and value
        if (this.shouldForceValue && !!this.input?.value && !this.dataset.value) {
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
        if (this.dataset.value === this.lastValue) return;
        const event = new Event("change");
        this.dispatchEvent(event);
        this.lastValue = this.dataset.value;
    }
}

customElements.define("combobox-framework", ComboboxFramework);
