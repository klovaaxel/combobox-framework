import { expect, test, describe } from "bun:test";
import { fetchInput, fetchList, fetchOriginalList, setBasicAttribbutes } from "../src/helpers";
import "../dist/combobox-framework";
import ComboboxFramework from "../src/combobox-framework";

describe("fetchList", () => {
    test("gets element with marked with slot list", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        combobox._list = null;
        expect(combobox._list).toEqual(null);
        fetchList.call(combobox);
        expect(combobox._list).toEqual(combobox.querySelector("#list-element"));
    });

    test("gets element marked with data-list if present", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />
        <div slot="list">
            <ul id="list-element" data-list>
                <li data-value="1">Item 1</li>
                <li data-value="2">Item 2</li>
                <li data-value="3">Item 3</li>
                <li data-value="4">Item 4</li>
            </ul>
        </div>`;

        combobox._list = null;
        expect(combobox._list).toEqual(null);
        fetchList.call(combobox);
        expect(combobox._list).toEqual(combobox.querySelector("#list-element"));
    });

    test("does not get element marked with data-list if outside slot list", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />
        <div data-list></div>
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        combobox._list = null;
        expect(combobox._list).toEqual(null);
        fetchList.call(combobox);
        expect(combobox._list).toEqual(combobox.querySelector("#list-element"));
    });

    test("throws error if no list element is found", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />`;

        combobox._list = null;
        expect(combobox._list).toEqual(null);
        expect(() => fetchList.call(combobox)).toThrowError("List element not found");
    });

    test("does nothing if list element is already stored", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />
        <ul slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        const something = document.createElement("ul");

        combobox._list = something;
        expect(combobox._list).toEqual(something);
        fetchList.call(combobox);
        expect(combobox._list).toEqual(something);
    });
});

describe("fetchInput", () => {
    test("gets element with marked with slot input", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input id="input-element" placeholder="Click me" type="text" slot="input" />
        <ul slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        combobox._input = null;
        expect(combobox._input).toEqual(null);
        fetchInput.call(combobox);
        expect(combobox._input).toEqual(combobox.querySelector("#input-element"));
    });

    test("throws error if no input element is found", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <ul slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        combobox._input = null;
        expect(combobox._input).toEqual(null);
        expect(() => fetchInput.call(combobox)).toThrowError("Input element not found");
    });

    test("does nothing if input element is already stored", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input id="input-element" placeholder="Click me" type="text" slot="input" />
        <ul slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        const something = document.createElement("input");

        combobox._input = something;
        expect(combobox._input).toEqual(something);
        fetchInput.call(combobox);
        expect(combobox._input).toEqual(something);
    });
});

describe("fetchOriginalList", () => {
    test("does nothing if original list element is already stored", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input id="input-element" placeholder="Click me" type="text" slot="input" />
        <ul slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        const something = document.createElement("ul");

        combobox._originalList = something;
        expect(combobox._originalList).toEqual(something);
        fetchOriginalList.call(combobox);
        expect(combobox._originalList).toEqual(something);
    });

    test("gets a clone of the list element if list element is already stored", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input id="input-element" placeholder="Click me" type="text" slot="input" />
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        combobox._list = combobox.querySelector("#list-element");
        combobox._originalList = null;
        expect(combobox._originalList).toEqual(null);
        fetchOriginalList.call(combobox);
        expect(combobox._originalList).toEqual(combobox._list!.cloneNode(true));
    });

    test("if no list is stored calls fetchList and sets original list to clone of list", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input id="input-element" placeholder="Click me" type="text" slot="input" />
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        combobox._list = null;
        combobox._originalList = null;
        expect(combobox._originalList).toEqual(null);
        fetchOriginalList.call(combobox);
        expect(combobox._originalList).toEqual(combobox._list!.cloneNode(true));
    });
});

describe("setBasicAttributes", () => {
    describe("id", () => {
        test("if no id is set on input, generates a new one", () => {
            const combobox = document.createElement("combobox-framework") as ComboboxFramework;
            combobox.innerHTML = `
            <input placeholder="Click me" type="text" slot="input" />
            <ul slot="list">
                <li data-value="1">Item 1</li>
                <li data-value="2">Item 2</li>
                <li data-value="3">Item 3</li>
                <li data-value="4">Item 4</li>
            </ul>`;

            fetchInput.call(combobox);
            fetchList.call(combobox);

            setBasicAttribbutes.call(combobox);

            expect(combobox._input!.id).not.toEqual("");
            expect(combobox._input!.id.split("-")[0]).toEqual("input");

            expect(combobox._list!.id).not.toEqual("");
            expect(combobox._list!.id.split("-")[0]).toEqual("list");
        });

        test("if id is set on input, does not generate a new one", () => {
            const combobox = document.createElement("combobox-framework") as ComboboxFramework;
            combobox.innerHTML = `
            <input id="input-element" placeholder="Click me" type="text" slot="input" />
            <ul id="list-element" slot="list">
                <li data-value="1">Item 1</li>
                <li data-value="2">Item 2</li>
                <li data-value="3">Item 3</li>
                <li data-value="4">Item 4</li>
            </ul>`;

            fetchInput.call(combobox);
            fetchList.call(combobox);

            setBasicAttribbutes.call(combobox);

            expect(combobox._input!.id).toEqual("input-element");
            expect(combobox._list!.id).toEqual("list-element");
        });
    });

    test("sets aria attributes", () => {
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input id="input-element" placeholder="Click me" type="text" slot="input" />
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        fetchInput.call(combobox);
        fetchList.call(combobox);

        setBasicAttribbutes.call(combobox);

        expect(combobox._input!.getAttribute("role")).toEqual("combobox");
        expect(combobox._input!.getAttribute("aria-controls")).toEqual("list-element");
        expect(combobox._input!.getAttribute("aria-expanded")).toEqual("false");
        expect(combobox._input!.getAttribute("aria-autocomplete")).toEqual("list");
        expect(combobox._input!.getAttribute("autocomplete")).toEqual("off");

        expect(combobox._list!.getAttribute("role")).toEqual("listbox");
        expect(combobox._list!.getAttribute("aria-multiselectable")).toEqual("false");
        expect(combobox._list!.getAttribute("anchor")).toEqual("input-element");
        expect(combobox._list!.tabIndex).toEqual(-1);

        const listItems = combobox._list!.querySelectorAll("li");
        for (const item of listItems) {
            expect(item.getAttribute("role")).toEqual("option");
            expect(item.getAttribute("aria-selected")).toEqual("false");
            expect(item.tabIndex).toEqual(-1);
        }
    });
});
