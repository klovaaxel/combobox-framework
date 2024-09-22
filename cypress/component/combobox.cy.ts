import "../../src/combobox-framework";
import ComboboxFramework from "../../src/combobox-framework";

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
                        (item) => `
                        <li key=${item.value} data-value=${item.value} data-display=${item.display}>
                            ${item.display}
                        </li>
                    `,
                    )}
                </ul>
            </combobox-framework>`);
    });

    describe("mounts", () => {
        it("is visible", () => {
            cy.get("input").should("exist");
            cy.get("[data-cy='listbox']").should("exist").should("not.be.visible");
        });

        it("has the correct attributes", () => {
            const listId = document.querySelector("[data-cy='listbox']")?.id;
            cy.get("input").should("have.attr", "role", "combobox");
            cy.get("input").should("have.attr", "aria-controls", listId);
            cy.get("input").should("have.attr", "aria-expanded", "false");
            cy.get("input").should("have.attr", "aria-autocomplete", "list");
            cy.get("input").should("have.attr", "autocomplete", "off");

            cy.get("[data-cy='listbox']").should("have.attr", "role", "listbox");
            cy.get("[data-cy='listbox']").should("have.attr", "aria-multiselectable", "false");
            cy.get("[data-cy='listbox']").should("have.attr", "tabindex", "-1");

            cy.get("[data-cy='listbox']").children().should("have.length", 2);
            cy.get("[data-cy='listbox']")
                .children()
                .each((el) => {
                    cy.wrap(el).should("have.attr", "role", "option");
                    cy.wrap(el).should("have.attr", "aria-selected", "false");
                    cy.wrap(el).should("have.attr", "tabindex", "-1");
                });
        });
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
            describe("When ArrowDown is clicked", () => {
                it("should open the list and focus the first item in the list", () => {
                    cy.get("input").should("exist").focus();

                    cy.pressKey("Escape"); // Ugly hack to close the popup
                    cy.get("[data-cy='listbox']").should("not.be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "false");

                    cy.pressKey("ArrowDown");
                    cy.get("[data-cy='listbox']").should("be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "true");
                    cy.focused().should("have.attr", "role", "option");
                    cy.focused().should("have.attr", "data-display", "one");
                });

                it("should focus the first item in the list when the list is already open", () => {
                    cy.get("input").should("exist").focus();
                    cy.get("[data-cy='listbox']").should("be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "true");

                    cy.pressKey("ArrowDown");
                    cy.get("[data-cy='listbox']").should("be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "true");
                    cy.focused().should("have.attr", "role", "option");
                    cy.focused().should("have.attr", "data-display", "one");
                });

                it("should only open the list if alt is also pressed", () => {
                    cy.get("input").should("exist").focus();

                    cy.pressKey("Escape"); // Ugly hack to close the popup
                    cy.get("[data-cy='listbox']").should("not.be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "false");

                    cy.pressKey("Alt");
                    cy.pressKey("ArrowDown");
                    cy.get("[data-cy='listbox']").should("be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "true");
                    cy.focused().should("have.attr", "role", "combobox");
                });
            });

            describe("When ArrowUp is clicked", () => {
                it("moves focus into the popup (last element) when uparrow is clicked", () => {
                    cy.get("input").focus();
                    cy.get("[data-cy='listbox']").should("be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "true");

                    cy.pressKey("ArrowUp");
                    cy.get("[data-cy='listbox']").should("be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "true");
                    cy.focused().should("have.attr", "role", "option");
                    cy.focused().should("have.attr", "data-display", "two");
                });

                it("should only prevent default if the list is closed", () => {
                    cy.get("input").should("exist").focus();

                    cy.pressKey("Escape"); // Ugly hack to close the popup
                    cy.get("[data-cy='listbox']").should("not.be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "false");

                    cy.pressKey("ArrowUp");
                    cy.get("[data-cy='listbox']").should("not.be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "false");
                    cy.focused().should("have.attr", "role", "combobox");
                });
            });

            describe("When Escape is clicked", () => {
                it("dismisses the popup if it is visible when escape is clicked", () => {
                    cy.get("input").focus();
                    cy.pressKey("Escape");
                    cy.get("[data-cy='listbox']").should("not.be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "false");
                });

                it("clears the combobox if popoup is hidden and escape is clicked", () => {
                    cy.get("input").focus();
                    cy.get("input").type("one");
                    cy.pressKey("Escape");
                    cy.pressKey("Escape");
                    cy.get("input").should("have.value", "");
                });
            });

            describe("When Enter is clicked", () => {
                it("autocompletes the combobox with the first suggestion", () => {
                    cy.get("input").focus();
                    cy.pressKey("ArrowDown");
                    cy.pressKey("Enter");
                    cy.get("input").should("have.value", "one");
                });

                it("does nothing if the list is not visible", () => {
                    cy.get("input").focus();

                    cy.pressKey("Escape"); // Ugly hack to close the popup
                    cy.get("[data-cy='listbox']").should("not.be.visible");
                    cy.get("input").should("have.attr", "aria-expanded", "false");

                    cy.pressKey("Enter");
                    cy.get("input").should("have.value", "");
                });
            });

            describe("When Alt is clicked", () => {
                it("sets the alt modifier to true", () => {
                    cy.get("input").focus();
                    cy.get("combobox-framework").then((el) => {
                        expect((el[0] as ComboboxFramework).isAltModifierPressed).to.be.false;
                    });

                    cy.pressKey("Alt");
                    cy.get("combobox-framework").then((el) => {
                        expect((el[0] as ComboboxFramework).isAltModifierPressed).to.be.true;
                    });

                    cy.releaseKey("Alt");
                    cy.get("combobox-framework").then((el) => {
                        expect((el[0] as ComboboxFramework).isAltModifierPressed).to.be.false;
                    });
                });
            });
        });

        describe("listbox", () => {
            beforeEach(() => {
                cy.get("input").should("exist").focus();
                cy.get("[data-value='1']").focus();
            });

            describe("When Enter is clicked", () => {
                it("accepts the selected item", () => {
                    cy.pressKey("Enter");
                    cy.get("input").should("have.value", "one");
                });
            });

            describe("When Escape is clicked", () => {
                it("closes the list, clears the input and focuses the input", () => {
                    cy.pressKey("Escape");
                    cy.get("[data-cy='listbox']").should("not.be.visible");
                    cy.focused().should("have.attr", "role", "combobox");
                    cy.get("input").should("have.value", "");
                });
            });

            describe("When ArrowDown is clicked", () => {
                it("moves focus to the next item in the list when arrowdown is clicked", () => {
                    cy.get("input").focus();
                    cy.get("[data-value='1']").focus();
                    cy.pressKey("ArrowDown");
                    cy.focused().should("have.attr", "data-display", "two");
                });

                it("focuses the first item in the list when on the last item", () => {
                    cy.get("input").focus();
                    cy.get("[data-value='2']").focus();
                    cy.pressKey("ArrowDown");
                    cy.focused().should("have.attr", "data-display", "one");
                });
            });

            describe("When ArrowUp is clicked", () => {
                it("moves focus to the previous item in the list", () => {
                    cy.get("input").focus();
                    cy.get("[data-value='2']").focus();
                    cy.pressKey("ArrowUp");
                    cy.focused().should("have.attr", "data-display", "one");
                });

                it("focuses the first item in the list when on the last item", () => {
                    cy.pressKey("ArrowUp");
                    cy.focused().should("have.attr", "data-display", "two");
                });

                it("Returns focus to the combobox closing the popup when alt is also clicked", () => {
                    cy.pressKey("Alt");
                    cy.pressKey("ArrowUp");
                    cy.get("[data-cy='listbox']").should("not.be.visible");
                    cy.focused().should("have.attr", "role", "combobox");
                });
            });

            describe("When ArrowLeft is clicked", () => {
                it("should return focus to the combobox without closing the list", () => {
                    cy.pressKey("ArrowLeft");
                    cy.focused().should("have.attr", "role", "combobox");
                    cy.get("[data-cy='listbox']").should("be.visible");
                });
            });

            describe("When ArrowRight is clicked", () => {
                it("should return focus to the combobox without closing the list", () => {
                    cy.pressKey("ArrowRight");
                    cy.focused().should("have.attr", "role", "combobox");
                    cy.get("[data-cy='listbox']").should("be.visible");
                });
            });

            describe("When Home is clicked", () => {
                it("returns focus to the combobox and keeps the list open", () => {
                    cy.pressKey("Home");
                    cy.focused().should("have.attr", "role", "combobox");
                    cy.get("[data-cy='listbox']").should("be.visible");
                });
            });

            describe("When End is clicked", () => {
                it("returns focus to the combobox and places the cursor after the last character", () => {
                    cy.get("input").type("one");
                    cy.pressKey("ArrowDown");
                    cy.pressKey("End");
                    cy.focused().should("have.attr", "role", "combobox");
                    cy.get("input").should("satisfy", (input) => {
                        const el = input[0] as HTMLInputElement;
                        return el.selectionStart === el.value.length;
                    });
                });
            });

            describe("When Backspace is clicked", () => {
                it("returns focus to the combobox and deletes the character prior to the cursor when backspace is clicked", () => {
                    cy.get("input").type("one");
                    cy.pressKey("ArrowDown");
                    cy.pressKey("Backspace");
                    cy.focused().should("have.attr", "role", "combobox");
                    //cy.get("input").should("have.value", "on"); // Can't seem to mock this whith only js events
                });
            });

            describe("When Delete is clicked", () => {
                it("returns focus to the combobox", () => {
                    cy.get("input").type("one");
                    cy.pressKey("ArrowDown");
                    cy.pressKey("Delete");
                    cy.focused().should("have.attr", "role", "combobox");
                });
            });

            describe("When Alt is clicked", () => {
                it("should seet the alt modifier to true", () => {
                    cy.get("combobox-framework").then((el) => {
                        expect((el[0] as ComboboxFramework).isAltModifierPressed).to.be.false;
                    });

                    cy.pressKey("Alt");
                    cy.get("combobox-framework").then((el) => {
                        expect((el[0] as ComboboxFramework).isAltModifierPressed).to.be.true;
                    });

                    cy.releaseKey("Alt");
                    cy.get("combobox-framework").then((el) => {
                        expect((el[0] as ComboboxFramework).isAltModifierPressed).to.be.false;
                    });
                });
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
                        (item) => `
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

    describe("Handles forcing values correctly", () => {
        it("does not force value when [data-listbox] is set to false", () => {
            document
                .getElementsByTagName("combobox-framework")[0]
                .setAttribute("data-listbox", "false");
            cy.get("input").type("o");
            cy.get("input").blur();
            cy.get("input").should("have.value", "o");
        });

        it("does not force value when [data-listbox is missing", () => {
            cy.get("input").type("o");
            cy.get("input").blur();
            cy.get("input").should("have.value", "o");
        });

        it("does force value when [data-listbox] is set to true", () => {
            document
                .getElementsByTagName("combobox-framework")[0]
                .setAttribute("data-listbox", "true");
            cy.get("input").type("o");
            cy.get("input").blur();
            cy.get("input").should("have.value", "one");
        });
    });
});
