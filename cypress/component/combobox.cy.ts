import "../../src/combobox-framework";

describe("Component ", () => {
    beforeEach(() => {
        const items = [
            { value: 1, display: "one" },
            { value: 2, display: "two" },
        ];

        cy.mount(`<combobox-framework>
                <input placeholder={placeholder} type="text" slot="input" data-cy="input" />
                <ul slot="list" data-cy="listbox">
                    ${items.map(
                        (item, index) => `
                        <li key=${item.value} data-value=${item.value} data-display=${item.display}>
                            ${item.display}
                        </li>
                    `,
                    )}
                </ul>
            </combobox-framework>`);
    });

    it("mounts", () => {
        cy.get("input").should("exist");
        cy.get("[data-cy='listbox']").should("exist").should("not.be.visible");
    });

    describe("Has working mouse navigation for", () => {
        describe("Combobox ", () => {
            it("opens the popup when clicked", () => {
                cy.get("input").click();
                cy.get("[data-cy='listbox']").should("be.visible");
            });

            it("closes the popup when clicked outside", () => {
                cy.get("input").click();
                cy.get("body").click();
                cy.get("[data-cy='listbox']").should("not.be.visible");
            });
        });

        describe("listbox", () => {
            it("closes the popup and selects the item when clicked", () => {
                cy.get("input").click();
                cy.get("[data-cy='listbox']").children().eq(0).click();
                cy.get("[data-cy='listbox']").should("not.be.visible");
                cy.get("input").should("have.value", "one");
            });
        });
    });

    describe("Has working keyboard navigation for", () => {
        describe("Combobox ", () => {
            it("moves focus into the popup (first element) when downarrow is clicked", () => {
                cy.get("input").should("exist").focus();
                cy.get("input").type("one");
                cy.pressKey("ArrowDown");
                cy.get("[data-cy='listbox']").should("be.visible");
                cy.focused().should("have.attr", "role", "option");
            });

            it("moves focus into the popup (last element) when uparrow is clicked", () => {
                cy.get("input").focus();
                cy.pressKey("ArrowUp");
                cy.get("[data-cy='listbox']").should("be.visible");
                cy.focused().should("have.attr", "role", "option");
            });

            it("dismisses the popup if it is visible when escape is clicked", () => {
                cy.get("input").focus();
                cy.pressKey("Escape");
                cy.get("[data-cy='listbox']").should("not.be.visible");
            });

            it("clears the combobox if popoup is hidden and escape is clicked", () => {
                cy.get("input").focus();
                cy.get("input").type("one");
                cy.pressKey("Escape");
                cy.pressKey("Escape");
                cy.get("input").should("have.value", "");
            });

            it("displays the popup without moving focus when alt and downarrow are clicked", () => {
                cy.get("input").focus();
                cy.pressKey("Escape"); // Close the popup so we acn open it
                cy.pressKey("Alt");
                cy.pressKey("ArrowDown");
                cy.get("[data-cy='listbox']").should("be.visible");
                cy.focused().should("have.attr", "role", "combobox");
            });
        });

        describe("listbox", () => {
            beforeEach(() => {
                cy.get("input").should("exist").focus();
                cy.get("[data-value='1']").focus();
            });

            it("accepts the selected item when enter is clicked", () => {
                cy.pressKey("Enter");
                cy.get("input").should("have.value", "one");
            });

            it("closes the popup and returns focus to the combobox (also clears it) when escape is clicked", () => {
                cy.pressKey("Escape");
                cy.get("[data-cy='listbox']").should("not.be.visible");
                cy.focused().should("have.attr", "role", "combobox");
                cy.get("input").should("have.value", "");
            });

            it("moves focus to the next item in the list when arrowdown is clicked", () => {
                cy.get("input").focus();
                cy.get("[data-value='1']").focus();
                cy.pressKey("ArrowDown");
                cy.focused().should("have.attr", "data-display", "two");
            });

            it("focuses the first item in the list when arrowdown is clicked on the last item", () => {
                cy.get("input").focus();
                cy.get("[data-value='2']").focus();
                cy.pressKey("ArrowDown");
                cy.focused().should("have.attr", "data-display", "one");
            });

            it("moves focus to the previous item in the list when arrowup is clicked", () => {
                cy.get("input").focus();
                cy.get("[data-value='2']").focus();
                cy.pressKey("ArrowUp");
                cy.focused().should("have.attr", "data-display", "one");
            });

            it("focuses the first item in the list when arrowdown is clicked on the last item", () => {
                cy.pressKey("ArrowUp");
                cy.focused().should("have.attr", "data-display", "two");
            });

            it("returns focus to the combobox when home is clicked", () => {
                cy.pressKey("Home");
                cy.focused().should("have.attr", "role", "combobox");
            });

            it("returns focus to the combobox and places the cursor after the last character when end is clicked", () => {
                cy.get("input").type("one");
                cy.pressKey("ArrowDown");
                cy.pressKey("End");
                cy.focused().should("have.attr", "role", "combobox");
                cy.get("input").should("satisfy", (input) => {
                    const el = input[0] as HTMLInputElement;
                    return el.selectionStart === el.value.length;
                });
            });

            it("returns focus to the combobox and deletes the character prior to the cursor when backspace is clicked", () => {
                cy.get("input").type("one");
                cy.pressKey("ArrowDown");
                cy.pressKey("Backspace");
                cy.focused().should("have.attr", "role", "combobox");
                //cy.get("input").should("have.value", "on"); // Can't seem to mock this whith only js events
            });

            it("returns focus to the combobox when delete is clicked", () => {
                cy.get("input").type("one");
                cy.pressKey("ArrowDown");
                cy.pressKey("Delete");
                cy.focused().should("have.attr", "role", "combobox");
            });

            it("Returns focus to the combobox closing the popup when alt and uparrow are clicked", () => {
                cy.pressKey("Alt");
                cy.pressKey("ArrowUp");
                cy.get("[data-cy='listbox']").should("not.be.visible");
                cy.focused().should("have.attr", "role", "combobox");
            });
        });
    });

    describe("Handles options with special characters correctly", () => {
        beforeEach(() => {
            const items = [
                { value: 1, display: "[one\\|]" },
                { value: 2, display: "Something days 1-3" },
                { value: 3, display: "thre&" },
            ];

            cy.mount(`<combobox-framework>
                <input placeholder={placeholder} type="text" slot="input" />
                <ul slot="list" data-cy="listbox">
                    ${items.map(
                        (item, index) => `
                        <li key=${item.value} data-value=${item.value} data-display=${item.display}>${item.display}</li>
                    `,
                    )}
                </ul>
            </combobox-framework>`);
        });

        it("searches for the item with special characters correctly", () => {
            cy.get("input").type("[one\\|]");
            cy.get("[data-cy='listbox']").children().should("have.length", 1);
            cy.get("[data-cy='listbox']").children().eq(0).should("have.text", "[one\\|]");
        });

        it("selects the item with special characters correctly", () => {
            cy.get("input").click();
            cy.get("[data-cy='listbox']").children().eq(0).click();
            cy.get("input").should("have.value", "[one\\|]");
        });
    });

    describe("Handles listbox attribute correctly", () => {
        it("does not force value when [data-cy='listbox'] is set to false", () => {
            document
                .getElementsByTagName("combobox-framework")[0]
                .setAttribute("data-listbox", "false");
            cy.get("input").type("o");
            cy.get("input").blur();
            cy.get("input").should("have.value", "o");
        });

        it("does not force value when listbox is missing", () => {
            cy.get("input").type("o");
            cy.get("input").blur();
            cy.get("input").should("have.value", "o");
        });

        it("does force value when listbox is set to true", () => {
            document
                .getElementsByTagName("combobox-framework")[0]
                .setAttribute("data-listbox", "true");
            cy.get("input").type("o");
            cy.get("input").blur();
            cy.get("input").should("have.value", "one");
        });

        it("does force value when [data-cy='listbox'] is set to something", () => {
            document
                .getElementsByTagName("combobox-framework")[0]
                .setAttribute("data-listbox", "something");
            cy.get("input").type("o");
            cy.get("input").blur();
            cy.get("input").should("have.value", "one");
        });
    });

    it("Handles attributes being set directly", () => {
        cy.get("combobox-framework").should("have.attr", "data-value", "");
        cy.get("combobox-framework").invoke("attr", "data-value", "2");
        cy.get("combobox-framework").should("have.attr", "data-value", "2");
        cy.get("input").should("have.value", "two");
    });
});
