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

            it.skip("moves focus into the popup (last element) when uparrow is clicked", () => {
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

            it("Returns focus to the combobox without closing the popup when alt and uparrow are clicked", () => {
                cy.getByTestAttr("input").focus();
                cy.pressKey("Alt");
                cy.pressKey("ArrowUp");
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

            it.skip("returns focus to the combobox, removes the selected state if a suggestion was selected when delete is clicked", () => {
                cy.getByTestAttr("input").type("one");
                cy.pressKey("ArrowDown");
                cy.pressKey("Delete");
                cy.focused().should("have.attr", "role", "combobox");
                cy.getByTestAttr("input").should("have.value", "");
            });
        });
    });
});
