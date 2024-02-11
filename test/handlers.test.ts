import { expect, test, describe, beforeEach, mock } from "bun:test";
import ComboboxFramework from "../src/combobox-framework";
import {
    handleBlur,
    handleComboBoxKeyPress,
    handleKeyUp,
    handleListKeyPress,
} from "../src/handlers";
import { fetchInput, fetchList } from "../src/helpers";

describe("handleComboBoxKeyPress", () => {
    let combobox: ComboboxFramework;

    beforeEach(() => {
        combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <combobox-framework>
            <input placeholder="Click me" type="text" slot="input" />
            <ul id="list-element" slot="list">
                <li data-value="1">Item 1</li>
                <li data-value="2">Item 2</li>
                <li data-value="3">Item 3</li>
                <li data-value="4">Item 4</li>
            </ul>
        </combobox-framework>`;

        fetchInput.call(combobox);
        fetchList.call(combobox);
        combobox._input!.setAttribute("aria-expanded", "false");

        combobox.clearInput = mock(() => void 0);
        combobox.focusItem = mock(() => void 0);
        combobox.selectItem = mock(() => void 0);
        combobox.toggleList = mock((boolean) =>
            combobox._list!.setAttribute("aria-expanded", boolean.toString()),
        );

        document.body.appendChild(combobox);
    });

    describe("ArrowDown", () => {
        test("should open the list and focus the first item in the list", () => {
            // Arrange
            const event = {
                ...new KeyboardEvent("keyDown", { key: "ArrowDown" }),
                preventDefault: mock(() => void 0),
            } as KeyboardEvent;

            // Act
            handleComboBoxKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox._input!.getAttribute("aria-expanded")).toBe("true");
                expect(combobox.focusItem).toHaveBeenCalledTimes(1);
                expect(combobox.toggleList).toHaveBeenCalledTimes(1);
                expect(document.activeElement).toBe(combobox._list!.children[3]);
            }, 100);
        });

        test("should not open the list if the list is already open", () => {
            // Arrange
            combobox._input!.setAttribute("aria-expanded", "true");
            const event = new KeyboardEvent("keyDown", { key: "ArrowDown" });

            // Act
            handleComboBoxKeyPress.call(combobox, event);

            // Assert
            expect(combobox.toggleList).toHaveBeenCalledTimes(0);
        });
    });

    describe("ArrowUp", () => {
        test("if the list is open focus the last item in the list", () => {
            // Arrange
            combobox._input!.setAttribute("aria-expanded", "true");
            const event = {
                ...new KeyboardEvent("keyDown", { key: "ArrowUp" }),
                preventDefault: mock(() => void 0),
            } as KeyboardEvent;

            // Act
            handleComboBoxKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox.focusItem).toHaveBeenCalledTimes(1);
                expect(event.preventDefault).toHaveBeenCalledTimes(1);
                expect(document.activeElement).toBe(combobox._list!.children[3]);
            }, 100);
        });

        test("if the list is closed only prevents default", () => {
            // Arrange
            combobox._input!.setAttribute("aria-expanded", "true");
            const event = {
                ...new KeyboardEvent("keyDown", { key: "ArrowUp" }),
                preventDefault: mock(() => void 0),
            } as KeyboardEvent;

            // Act
            handleComboBoxKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(event.preventDefault).toHaveBeenCalledTimes(1);
            }, 100);
        });
    });

    describe("Escape", () => {
        test("only dismisses the popup if it is visible", () => {
            // Arrange
            combobox._input!.setAttribute("aria-expanded", "true");
            combobox._input!.value = "test";
            const event = new KeyboardEvent("keyDown", { key: "Escape" });

            // Act
            handleComboBoxKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox.toggleList).toHaveBeenCalledTimes(1);
                expect(combobox.clearInput).toHaveBeenCalledTimes(0);
                expect(combobox._input!.value).toBe("test");
            }, 100);
        });

        test("clears the input if the popup is not visible", () => {
            // Arrange
            combobox._input!.setAttribute("aria-expanded", "false");
            combobox._input!.value = "test";
            const event = new KeyboardEvent("keyDown", { key: "Escape" });

            // Act
            handleComboBoxKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox.toggleList).toHaveBeenCalledTimes(0);
                expect(combobox.clearInput).toHaveBeenCalledTimes(1);
                expect(combobox._input!.value).toBe("");
            }, 100);
        });
    });

    describe("Enter", () => {
        test("autocompletes the combobox with the first suggestion if the list is open", () => {
            // Arrange
            combobox._input!.setAttribute("aria-expanded", "true");
            const event = new KeyboardEvent("keyDown", { key: "Enter" });

            // Act
            handleComboBoxKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox.selectItem).toHaveBeenCalledTimes(1);
            }, 100);
        });

        test("does nothing if the list is closed", () => {
            // Arrange
            combobox._input!.setAttribute("aria-expanded", "false");
            const event = new KeyboardEvent("keyDown", { key: "Enter" });

            // Act
            handleComboBoxKeyPress.call(combobox, event);

            // Assert
            expect(combobox.selectItem).toHaveBeenCalledTimes(0);
        });
    });
});

describe("handleListKeyPress", () => {
    let combobox: ComboboxFramework;

    beforeEach(() => {
        combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <combobox-framework>
            <input placeholder="Click me" type="text" slot="input" />
            <ul id="list-element" slot="list">
                <li data-value="1">Item 1</li>
                <li data-value="2">Item 2</li>
                <li data-value="3">Item 3</li>
                <li data-value="4">Item 4</li>
            </ul>
        </combobox-framework>`;

        fetchInput.call(combobox);
        fetchList.call(combobox);
        combobox._input!.setAttribute("aria-expanded", "true");

        combobox.clearInput = mock(() => void 0);
        combobox.focusItem = mock(() => void 0);
        combobox.selectItem = mock(() => void 0);

        document.body.appendChild(combobox);
    });

    describe("Enter", () => {
        test("should select the item and close the list", () => {
            // Arrange
            const event = {
                ...new KeyboardEvent("keyDown", { key: "Enter" }),
                target: combobox._list!.children[0],
            } as KeyboardEvent;

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox._input!.getAttribute("aria-expanded")).toBe("false");
                expect(combobox.selectItem).toHaveBeenCalledTimes(1);
            }, 100);
        });
    });

    describe("Escape", () => {
        test("should close the list and clear the input", () => {
            // Arrange
            const event = {
                ...new KeyboardEvent("keyDown", { key: "Escape" }),
                target: combobox._list!.children[0],
            } as KeyboardEvent;

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox._input!.getAttribute("aria-expanded")).toBe("false");
                expect(combobox.clearInput).toHaveBeenCalledTimes(1);
            }, 100);
        });
    });

    describe("ArrowDown", () => {
        test("should move focus to the next item in the list", () => {
            // Arrange
            const event = {
                ...new KeyboardEvent("keyDown", { key: "ArrowDown" }),
                target: combobox._list!.children[1],
                preventDefault: mock(() => void 0),
            } as KeyboardEvent;

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox.focusItem).toHaveBeenCalledTimes(1);
                expect(event.preventDefault).toHaveBeenCalledTimes(1);
                expect(document.activeElement).toBe(combobox._list!.children[2]); // FIXME: This is borken, can be any item, so test does not really work
            }, 100);
        });

        test("should move focus to the first item in the list if the last item is focused", () => {
            // Arrange
            const event = {
                ...new KeyboardEvent("keyDown", { key: "ArrowDown" }),
                target: combobox._list!.children[3],
                preventDefault: mock(() => void 0),
            } as KeyboardEvent;

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox.focusItem).toHaveBeenCalledTimes(1);
                expect(event.preventDefault).toHaveBeenCalledTimes(1);
                expect(document.activeElement).toBe(combobox._list!.children[0]); // FIXME: This is borken, can be any item, so test does not really work
            }, 100);
        });
    });

    describe("ArrowUp", () => {
        test("should move focus to the previous item in the list", () => {
            // Arrange
            const event = {
                ...new KeyboardEvent("keyDown", { key: "ArrowUp" }),
                target: combobox._list!.children[1],
                preventDefault: mock(() => void 0),
            } as KeyboardEvent;

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox.focusItem).toHaveBeenCalledTimes(1);
                expect(event.preventDefault).toHaveBeenCalledTimes(1);
                expect(document.activeElement).toBe(combobox._list!.children[0]); // FIXME: This is borken, can be any item, so test does not really work
            }, 100);
        });

        test("should move focus to the last item in the list if the first item is focused", () => {
            // Arrange
            const event = {
                ...new KeyboardEvent("keyDown", { key: "ArrowUp" }),
                target: combobox._list!.children[3],
                preventDefault: mock(() => void 0),
            } as KeyboardEvent;

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(combobox.focusItem).toHaveBeenCalledTimes(1);
                expect(event.preventDefault).toHaveBeenCalledTimes(1);
                expect(document.activeElement).toBe(combobox._list!.children[0]); // FIXME: This is borken, can be any item, so test does not really work
            }, 100);
        });
    });

    describe("ArrowRight", () => {
        test("should return focus to the combobox without closing the list", () => {
            // Arrange
            (combobox._list!.children[1] as HTMLElement).focus();
            const event = new KeyboardEvent("keyDown", { key: "ArrowRight" });

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(document.activeElement).toBe(combobox._input);
            }, 100);
        });
    });

    describe("ArrowLeft", () => {
        test("should return focus to the combobox without closing the list", () => {
            // Arrange
            (combobox._list!.children[1] as HTMLElement).focus();
            const event = new KeyboardEvent("keyDown", { key: "ArrowLeft" });

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(document.activeElement).toBe(combobox._input);
            }, 100);
        });
    });

    describe("Home", () => {
        test("should return focus to the combobox without closing the list", () => {
            // Arrange
            (combobox._list!.children[1] as HTMLElement).focus();
            const event = new KeyboardEvent("keyDown", { key: "Home" });

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(document.activeElement).toBe(combobox._input);
            }, 100);
        });
    });

    describe("End", () => {
        test("should return focus to the combobox without closing the list", () => {
            // Arrange
            (combobox._list!.children[1] as HTMLElement).focus();
            const event = new KeyboardEvent("keyDown", { key: "End" });

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(document.activeElement).toBe(combobox._input);
            }, 100);
        });
    });

    describe("Backspace", () => {
        test("should return focus to the combobox without closing the list", () => {
            // Arrange
            (combobox._list!.children[1] as HTMLElement).focus();
            const event = new KeyboardEvent("keyDown", { key: "Backspace" });

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(document.activeElement).toBe(combobox._input);
            }, 100);
        });
    });

    describe("Delete", () => {
        test("should return focus to the combobox without closing the list", () => {
            // Arrange
            (combobox._list!.children[1] as HTMLElement).focus();
            const event = new KeyboardEvent("keyDown", { key: "Delete" });

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            setTimeout(() => {
                expect(document.activeElement).toBe(combobox._input);
            }, 100);
        });
    });

    describe("Alt", () => {
        test("should set isAltModifierPressed to true when the Alt key is pressed", () => {
            // Arrange
            const event = new KeyboardEvent("keyDown", { key: "Alt" });

            // Act
            handleListKeyPress.call(combobox, event);

            // Assert
            expect(combobox._isAltModifierPressed).toBe(true);
        });
    });
});

describe("handleKeyUp", () => {
    test("should set isAltModifierPressed to false when the Alt key is released", () => {
        // Arrange
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        combobox._isAltModifierPressed = true;
        const event = new KeyboardEvent("keyUp", { key: "Alt" });

        // Act
        handleKeyUp.call(combobox, event);

        // Assert
        expect(combobox._isAltModifierPressed).toBe(false);
    });
});

describe("hanldeBlur", () => {
    test("should close the list when the input element loses focus", () => {
        // Arrange
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        fetchInput.call(combobox);
        fetchList.call(combobox);
        combobox._input!.setAttribute("aria-expanded", "true");

        // Act
        handleBlur.call(combobox);

        // Assert
        setTimeout(() => {
            expect(combobox._input!.getAttribute("aria-expanded")).toBe("false");
        }, 100);
    });

    test("should not close the list when we change focus within the combobox", () => {
        // Arrange
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        fetchInput.call(combobox);
        fetchList.call(combobox);
        combobox._input!.setAttribute("aria-expanded", "true");

        // Act
        combobox._list!.focus();
        handleBlur.call(combobox);

        // Assert
        setTimeout(() => {
            expect(combobox._input!.getAttribute("aria-expanded")).toBe("true");
        }, 0);
    });

    test("should force value when the input element loses focus and forceValue is true", () => {
        // Arrange
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        fetchInput.call(combobox);
        fetchList.call(combobox);
        combobox._input!.setAttribute("aria-expanded", "true");
        combobox.setAttribute("force-value", "true");

        // Act
        handleBlur.call(combobox);

        // Assert
        setTimeout(() => {
            expect(combobox._input!.value).toBe("Item 1");
        }, 100);
    });

    test("should not force value when the input element loses focus and forceValue is false", () => {
        // Arrange
        const combobox = document.createElement("combobox-framework") as ComboboxFramework;
        combobox.innerHTML = `
        <input placeholder="Click me" type="text" slot="input" />
        <ul id="list-element" slot="list">
            <li data-value="1">Item 1</li>
            <li data-value="2">Item 2</li>
            <li data-value="3">Item 3</li>
            <li data-value="4">Item 4</li>
        </ul>`;

        fetchInput.call(combobox);
        fetchList.call(combobox);
        combobox._input!.setAttribute("aria-expanded", "true");
        combobox.setAttribute("force-value", "");

        // Act
        handleBlur.call(combobox);

        // Assert
        setTimeout(() => {
            expect(combobox._input!.value).toBe("");
        }, 100);
    });
});
