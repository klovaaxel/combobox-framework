import Fuse, { FuseResult } from "fuse.js";
import { handleBlur, handleComboBoxKeyPress, handleKeyUp, handleListKeyPress } from "./handlers";
import { setBasicAttributes } from "./helpers";

export default class ComboboxFramework extends HTMLElement {
    public isAltModifierPressed = false;
    public shouldForceValue = false;
    public lastValue: string | undefined = undefined;
    public limit: number = Infinity;

    public get list(): HTMLElement | null {
        if (this._list) return this._list;
        this._list = this.querySelector('[slot="list"] [data-list]') as HTMLElement;
        if (!this._list) this._list = this.querySelector('[slot="list"]') as HTMLElement;
        if (!this._list) throw new Error("List element not found");

        this._originalList ??= this._list.cloneNode(true) as HTMLElement;
        return this._list;
    }

    public set list(value: HTMLElement | null) {
        this._list = value;
    }

    public get input(): HTMLInputElement | null {
        if (this._input) return this._input;
        const input = this.querySelector('[slot="input"]') as HTMLInputElement;
        if (!input) throw new Error("Input element not found");
        this._input = input;

        return this._input;
    }

    public set input(value: HTMLInputElement | null) {
        this._input = value;
    }

    public get listContainer(): HTMLElement | null {
        if (this._listContainer) return this._listContainer;
        this._listContainer = this.querySelector('[slot="list"]') as HTMLElement;
        return this._listContainer;
    }

    public set listContainer(value: HTMLElement | null) {
        this._listContainer = value;
    }

    public get originalList(): HTMLElement | null {
        if (this._originalList) return this._originalList;
        this._originalList = this.list?.cloneNode(true) as HTMLElement;
        return this._originalList;
    }

    public set originalList(value: HTMLElement | null) {
        this._originalList = value;
    }

    private _list: HTMLElement | null = null;
    private _input: HTMLInputElement | null = null;
    private _listContainer: HTMLElement | null = null;
    private _originalList: HTMLElement | null = null;

    // #region Fuzzy search Fuse.js
    public _fuse: Fuse<Element> | null = null;
    public _fuseOptions = {
        includeScore: true,
        keys: ["dataset.display", "dataset.value", "innerText"],
    };
    // #endregion

    private abortController = new AbortController();
    private initFuseObj = () => {
        if (!this.originalList) return new Fuse([], this._fuseOptions);

        const elementArray = Array.from(
            (this.originalList.cloneNode(true) as HTMLElement).children,
        );

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
                if (newValue.toLowerCase() === "false") this.shouldForceValue = false;
                else this.shouldForceValue = !!newValue;
                break;
            case "data-limit":
                this.limit = parseInt(newValue);
                break;
        }
    }

    public connectedCallback(): void {
        const shadow = this.shadowRoot as ShadowRoot;
        shadow.innerHTML = `<slot name="input"></slot><slot name="list"></slot>`;
        setBasicAttributes.call(this);

        this.originalList;
        this._fuse ??= this.initFuseObj.call(this);

        this.searchList();
        this.addEventListeners();
        this.forceValue();
    }

    public disconnectedCallback(): void {
        this.abortController.abort();
    }

    public toggleList(
        newValue: boolean = this.input?.getAttribute("aria-expanded") !== true.toString(),
    ): void {
        this.input?.setAttribute("aria-expanded", `${newValue}`);
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

    public selectItem(item: HTMLElement, grabFocus = true): void {
        // #region Set the value of the input element
        // If the item has a data-display attribute, use that as the value
        if (this.input && item.dataset.display) this.input.value = item.dataset.display;
        // Else If the element does not have any children or only has strong children, use the innerText as the value
        else if (
            this.input &&
            (item.children.length ||
                Array.from(item.children).every((c) => c.nodeName === "STRONG"))
        )
            this.input.value = item.innerText;
        // Else If the element has a data-value attribute, use that as the value
        else if (this.input && item.dataset.value) this.input.value = item.dataset.value;
        // Else fallback to a empty string
        else if (this.input) this.input.value = "";
        // #endregion

        if (item.dataset.value) this.dataset.value = item.dataset.value;
        if (grabFocus) this.input?.focus();
        this.toggleList(false);
        this.searchList(false, false);
        this.sendChangeEvent();
    }

    public clearInput(grabFocus = true): void {
        if (this.input) this.input.value = "";
        if (this.input && grabFocus) this.input.focus();
        this.toggleList(false);
    }

    public forceValue(): void {
        if (!this.shouldForceValue) return;
        if (this.dataset.value) return;
        if (!this.input?.value) return;

        const bestMatch = this.list?.children[0] as HTMLElement;
        if (bestMatch) {
            this.selectItem(bestMatch, false);
        } else {
            this.clearInput(false); // Clear the input
            this.dataset.value = ""; // Clear the value
            this.sendChangeEvent(); // Send a change event
        }
    }

    private addEventListeners(): void {
        // #region Add event listeners to the framework element
        this.addEventListener("focusout", handleBlur.bind(this), {
            signal: this.abortController.signal,
        });
        // #endregion

        // #region Add event listeners to the input element
        this.input?.addEventListener("input", this.searchList.bind(this, true, true), {
            signal: this.abortController.signal,
        });
        this.input?.addEventListener("focus", this.toggleList.bind(this, true), {
            signal: this.abortController.signal,
        });
        this.input?.addEventListener("keydown", handleComboBoxKeyPress.bind(this), {
            signal: this.abortController.signal,
        });
        this.input?.addEventListener("keyup", handleKeyUp.bind(this), {
            signal: this.abortController.signal,
        });
        // #endregion

        this.addEventListenersToListItems();
    }

    private addEventListenersToListItems(): void {
        // #region Add event listeners to the list item elements
        const children = this.list?.children;
        if (!children) return;
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
        if (!this.input) return;

        // #region Check if required variables are set
        this._fuse ??= this.initFuseObj();
        // #endregion

        // #region Clear the selected item
        if (clearValue) {
            this.dataset.value = "";
            this.sendChangeEvent();
        }
        // #endregion

        // #region If the input is empty, show the original list and return
        if ((this.originalList && !this.input) || this.input?.value === "") {
            if (this.list) this.list.innerHTML = "";
            this.list?.append(
                ...Array.from((this.originalList!.cloneNode(true) as HTMLElement).children)
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

        // #region Sort the list based on the weight of the items if they have a weight and a score
        let searchedList = this._fuse.search(this.input.value).slice(0, this.limit);
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
        if (this.list) {
            this.list.innerHTML = "";
            this.list.append(...newList.map((item) => item.cloneNode(true) as HTMLElement));
        }
        // #endregion

        // #region Highlight the search string in the list items (or nested childrens) text content
        const highlightTextContent = (node: Element) => {
            if (
                this.input &&
                node.nodeType === Node.TEXT_NODE &&
                node.textContent?.trim() !== "" &&
                node.textContent?.trim() !== "\n"
            ) {
                const text = node.textContent ?? "";
                const newNode = document.createElement("template");
                newNode.innerHTML = this.highlightText(text, this.input.value);
                node.replaceWith(newNode.content);
            } else {
                for (const childNode of node.childNodes) {
                    highlightTextContent(childNode as Element);
                }
            }
        };

        for (const item of this.list?.children ?? []) {
            highlightTextContent(item);
        }
        // #endregion

        this.addEventListenersToListItems();
        this.toggleList(openList);
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
        for (const item of this.list?.querySelectorAll("[aria-selected]") ?? [])
            item.removeAttribute("aria-selected");
    }

    private selectItemByValue(value: string | null, grabFocus = true): void {
        if (!value) return;
        const item = this.list?.querySelector(`[data-value="${value}"]`) as HTMLElement;
        if (!item) return;
        this.selectItem(item, grabFocus);
    }

    private sendChangeEvent(): void {
        if (this.dataset.value === this.lastValue) return;
        const event = new Event("change");
        this.dispatchEvent(event);
        this.lastValue = this.dataset.value;
    }
}

customElements.define("combobox-framework", ComboboxFramework);
