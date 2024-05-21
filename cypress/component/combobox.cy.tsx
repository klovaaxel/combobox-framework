import React from "react";
import { ComboboxWrapper } from "./react-wrapper/combobox-wrapper";

describe("Component ", () => {
    beforeEach(() => {
        cy.mount(
            <ComboboxWrapper
                items={[
                    { value: 1, display: "one" },
                    { value: 2, display: "two" },
                ]}
            />,
        );
    });

    it("mounts", () => {
        cy.getByTestAttr("input").should("exist");
        cy.getByTestAttr("listbox").should("exist").should("not.be.visible");
    });

    describe("Has working mouse navigation for", () => {
        describe("Combobox ", () => {
            it("opens the popup when clicked", () => {
                cy.getByTestAttr("input").click();
                cy.getByTestAttr("listbox").should("be.visible");
            });

            it("closes the popup when clicked outside", () => {
                cy.getByTestAttr("input").click();
                cy.get("body").click();
                cy.getByTestAttr("listbox").should("not.be.visible");
            });
        });

        describe("Listbox", () => {
            it("closes the popup and selects the item when clicked", () => {
                cy.getByTestAttr("input").click();
                cy.getByTestAttr("listbox").children().eq(0).click();
                cy.getByTestAttr("listbox").should("not.be.visible");
                cy.getByTestAttr("input").should("have.value", "one");
            });
        });
    });

    describe("Has working keyboard navigation for", () => {
        describe("Combobox ", () => {
            it("moves focus into the popup (first element) when downarrow is clicked", () => {
                cy.getByTestAttr("input").should("exist").focus();
                cy.getByTestAttr("input").type("one");
                cy.pressKey("ArrowDown");
                cy.getByTestAttr("listbox").should("be.visible");
                cy.focused().should("have.attr", "role", "option");
            });

            it("moves focus into the popup (last element) when uparrow is clicked", () => {
                cy.getByTestAttr("input").focus();
                cy.pressKey("ArrowUp");
                cy.getByTestAttr("listbox").should("be.visible");
                cy.focused().should("have.attr", "role", "option");
            });

            it("dismisses the popup if it is visible when escape is clicked", () => {
                cy.getByTestAttr("input").focus();
                cy.pressKey("Escape");
                cy.getByTestAttr("listbox").should("not.be.visible");
            });

            it("clears the combobox if popoup is hidden and escape is clicked", () => {
                cy.getByTestAttr("input").focus();
                cy.getByTestAttr("input").type("one");
                cy.pressKey("Escape");
                cy.pressKey("Escape");
                cy.getByTestAttr("input").should("have.value", "");
            });

            it("displays the popup without moving focus when alt and downarrow are clicked", () => {
                cy.getByTestAttr("input").focus();
                cy.pressKey("Escape"); // Close the popup so we acn open it
                cy.pressKey("Alt");
                cy.pressKey("ArrowDown");
                cy.getByTestAttr("listbox").should("be.visible");
                cy.focused().should("have.attr", "role", "combobox");
            });
        });

        describe("Listbox", () => {
            beforeEach(() => {
                cy.getByTestAttr("input").should("exist").focus();
                cy.getByTestAttr("1").focus();
            });

            it("accepts the selected item when enter is clicked", () => {
                cy.pressKey("Enter");
                cy.getByTestAttr("input").should("have.value", "one");
            });

            it("closes the popup and returns focus to the combobox (also clears it) when escape is clicked", () => {
                cy.pressKey("Escape");
                cy.getByTestAttr("listbox").should("not.be.visible");
                cy.focused().should("have.attr", "role", "combobox");
                cy.getByTestAttr("input").should("have.value", "");
            });

            it("moves focus to the next item in the list when arrowdown is clicked", () => {
                cy.pressKey("ArrowDown");
                cy.focused().should("have.text", "two");
            });

            it("focuses the first item in the list when arrowdown is clicked on the last item", () => {
                cy.pressKey("ArrowDown");
                cy.pressKey("ArrowDown");
                cy.focused().should("have.text", "one");
            });

            it("moves focus to the previous item in the list when arrowup is clicked", () => {
                cy.pressKey("ArrowDown");
                cy.pressKey("ArrowUp");
                cy.focused().should("have.text", "one");
            });

            it("focuses the first item in the list when arrowdown is clicked on the last item", () => {
                cy.pressKey("ArrowUp");
                cy.focused().should("have.text", "two");
            });

            it("returns focus to the combobox when home is clicked", () => {
                cy.pressKey("Home");
                cy.focused().should("have.attr", "role", "combobox");
            });

            it("returns focus to the combobox and places the cursor after the last character when end is clicked", () => {
                cy.getByTestAttr("input").type("one");
                cy.pressKey("ArrowDown");
                cy.pressKey("End");
                cy.focused().should("have.attr", "role", "combobox");
                cy.getByTestAttr("input").should("satisfy", (input) => {
                    const el = input[0] as HTMLInputElement;
                    return el.selectionStart === el.value.length;
                });
            });

            it("returns focus to the combobox and deletes the character prior to the cursor when backspace is clicked", () => {
                cy.getByTestAttr("input").type("one");
                cy.pressKey("ArrowDown");
                cy.pressKey("Backspace");
                cy.focused().should("have.attr", "role", "combobox");
                //cy.getByTestAttr("input").should("have.value", "on"); // Can't seem to mock this whith only js events
            });

            it("returns focus to the combobox when delete is clicked", () => {
                cy.getByTestAttr("input").type("one");
                cy.pressKey("ArrowDown");
                cy.pressKey("Delete");
                cy.focused().should("have.attr", "role", "combobox");
            });

            it("Returns focus to the combobox closing the popup when alt and uparrow are clicked", () => {
                cy.pressKey("Alt");
                cy.pressKey("ArrowUp");
                cy.getByTestAttr("listbox").should("not.be.visible");
                cy.focused().should("have.attr", "role", "combobox");
            });
        });
    });

    describe("Handles options with special characters correctly", () => {
        beforeEach(() => {
            cy.mount(
                <ComboboxWrapper
                    items={[
                        { value: 1, display: "[one\\|]" },
                        { value: 2, display: "Something days 1-3" },
                        { value: 3, display: "thre&" },
                        { value: 4, display: "<h1>test<h1>" },
                    ]}
                />,
            );
        });

        it("searches for the item with special characters correctly", () => {
            cy.getByTestAttr("input").type("[one\\|]");
            cy.getByTestAttr("listbox").children().should("have.length", 1);
            cy.getByTestAttr("listbox").children().eq(0).should("have.text", "[one\\|]");
        });

        it("selects the item with special characters correctly", () => {
            cy.getByTestAttr("input").click();
            cy.getByTestAttr("listbox").children().eq(0).click();
            cy.getByTestAttr("input").should("have.value", "[one\\|]");
        });

        it("does not htmlify the display text of options containing tags", () => {
            cy.getByTestAttr("input").type("test");
            cy.getByTestAttr("listbox").children().eq(0).should("have.text", "<h1>test<h1>");
        });
    });

    describe("Handles listbox attribute correctly", () => {
        it("does not force value when listbox is set to false", () => {
            document
                .getElementsByTagName("combobox-framework")[0]
                .setAttribute("data-listbox", "false");
            cy.getByTestAttr("input").type("o");
            cy.getByTestAttr("input").blur();
            cy.getByTestAttr("input").should("have.value", "o");
        });

        it("does not force value when listbox is missing", () => {
            cy.getByTestAttr("input").type("o");
            cy.getByTestAttr("input").blur();
            cy.getByTestAttr("input").should("have.value", "o");
        });

        it("does force value when listbox is set to true", () => {
            document
                .getElementsByTagName("combobox-framework")[0]
                .setAttribute("data-listbox", "true");
            cy.getByTestAttr("input").type("o");
            cy.getByTestAttr("input").blur();
            cy.getByTestAttr("input").should("have.value", "one");
        });

        it("does force value when listbox is set to something", () => {
            document
                .getElementsByTagName("combobox-framework")[0]
                .setAttribute("data-listbox", "something");
            cy.getByTestAttr("input").type("o");
            cy.getByTestAttr("input").blur();
            cy.getByTestAttr("input").should("have.value", "one");
        });
    });
});
