import ComboboxFramework from "./combobox-framework";
import { fetchInput, fetchList } from "./helpers";

/**
 * Handles the key press event on the input element
 * @param event {KeyboardEvent} The key press event
 * @memberof ComboboxFramework
 * @returns {void}
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction
 */
export function handleComboBoxKeyPress(this: ComboboxFramework, event: KeyboardEvent): void {
    // #region Check if required variables are set
    if (!this._input) fetchInput.call(this);
    if (!this._list) fetchList.call(this);
    // #endregion

    // #region Handle the key press
    switch (event.key) {
        case "ArrowDown":
            // If the popup is available, moves focus into the popup: If the autocomplete behavior automatically selected a suggestion before Down Arrow was pressed, focus is placed on the suggestion following the automatically selected suggestion. Otherwise, places focus on the first focusable element in the popup.
            if (this._input!.getAttribute("aria-expanded") !== "true") {
                this.toggleList(true);
                if (!this._isAltModifierPressed)
                    this.focusItem(this._list!.children[0] as HTMLElement);
            } else {
                this.focusItem(this._list!.children[0] as HTMLElement);
            }
            event.preventDefault(); // prevent scrolling
            break;
        case "UpArrow":
            // (Optional): If the popup is available, places focus on the last focusable element in the popup.
            if (this._input!.getAttribute("aria-expanded") !== "true") {
                this.toggleList(true);
                this.focusItem(
                    this._list!.children[this._list!.children.length - 1] as HTMLElement,
                );
            }
            event.preventDefault(); // prevent scrolling
            break;
        case "Escape":
            // Dismisses the popup if it is visible. Optionally, if the popup is hidden before Escape is pressed, clears the combobox.
            if (this._input!.getAttribute("aria-expanded") === "true") {
                this.toggleList(false);
            } else {
                this._input!.value = "";
            }
            this._input!.focus();
            break;
        case "Enter":
            // Autocompletes the combobox with the first suggestion
            if (this._input!.getAttribute("aria-expanded") === "true") {
                this.selectItem(this._list!.children[0] as HTMLElement);
            }
            break;
        case "Alt":
            this._isAltModifierPressed = true;
            break;
    }
    // #endregion
}

/**
 * Handles the key press event on the list element
 * @param event {KeyboardEvent} The key press event
 * @memberof ComboboxFramework
 * @returns {void}
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction
 */
export function handleListKeyPress(this: ComboboxFramework, event: KeyboardEvent): void {
    // #region Check if required variables are set
    if (!this._input) fetchInput.call(this);
    if (!this._list) fetchList.call(this);
    // #endregion

    // #region Handle the key press
    const li = event.target as HTMLElement;
    switch (event.key) {
        case "Enter":
            // Select the item and close the list
            this.selectItem(li);
            break;
        case "Escape":
            // Close the list and focus the input
            this.clearInput();
            break;
        case "ArrowDown": {
            // Move focus to the next item in the list
            const nextLi = li.nextElementSibling as HTMLElement;
            if (nextLi) this.focusItem(nextLi);
            else this.focusItem(this._list!.children[0] as HTMLElement);
            event.preventDefault(); // prevent scrolling
            break;
        }
        case "ArrowUp": {
            // If alt is pressed, close the list and focus the input
            if (this._isAltModifierPressed) {
                this._input!.focus();
                this.toggleList(false);
                event.preventDefault(); // prevent scrolling
                break;
            }

            // Move focus to the previous item in the list
            const previousLi = li.previousElementSibling as HTMLElement;
            if (previousLi) this.focusItem(previousLi);
            else
                this.focusItem(
                    this._list!.children[this._list!.children.length - 1] as HTMLElement,
                );
            event.preventDefault(); // prevent scrolling
            break;
        }
        case "ArrowRight":
            // returns focus to the combobox without closing the popup
            this._input!.focus();
            break;
        case "ArrowLeft":
            // returns focus to the combobox without closing the popup
            this._input!.focus();
            break;
        case "Home":
            // Move focus to the first item in the list
            this._input!.focus();
            break;
        case "End":
            // Move focus to the last item in the list
            this._input!.focus();
            break;
        case "Backspace":
            // Move focus to the last item in the list
            this._input!.focus();
            break;
        case "Delete":
            // Move focus to the last item in the list
            this._input!.focus();
            break;
        case "Alt":
            this._isAltModifierPressed = true;
            break;
        default:
            // If the key is not handled, return focus to the input
            this._input!.focus();
            break;
    }
    // #endregion
}

/**
 * Handles the key up event on the input element and list element
 * @returns { void }
 * @param { ComboboxFramework } combobox combobox-framework element
 * @param { KeyboardEvent } event The key up event
 */
export function handleKeyUp(this: ComboboxFramework, event: KeyboardEvent): void {
    // #region Handle the key press
    switch (event.key) {
        case "Alt":
            this._isAltModifierPressed = false;
            break;
    }
    // #endregion
}

/**
 * Toggles the expanded state of the combobox if the focus is lost
 * @param event {FocusEvent} The blur event
 * @memberof ComboboxFramework
 * @returns {void}
 */
export function handleBlur(this: ComboboxFramework): void {
    // Set a timeout to force the focus event on the list item to fire before the foucsout event on the input element
    setTimeout(() => {
        if (this.querySelector(":focus")) return;

        // #region If forceValue is true, select the first item in the list
        this.forceValue();
        // #endregion

        this.toggleList(false);
    }, 0);
}
