import ComboboxFramework from "./combobox-framework";
import { KeyCode, fetchInput, fetchList } from "./helpers";

export function handleComboBoxKeyPress(this: ComboboxFramework, event: KeyboardEvent): void {
    // #region Check if required variables are set
    const input = fetchInput.call(this);
    const list = fetchList.call(this);
    // #endregion

    const isInputExpanded = () => input.getAttribute("aria-expanded") === "true";

    // #region Handle the key press
    switch (event.key) {
        case KeyCode.ArrowDown:
            // If the popup is available, moves focus into the popup: If the autocomplete behavior automatically selected a suggestion before Down Arrow was pressed, focus is placed on the suggestion following the automatically selected suggestion. Otherwise, places focus on the first focusable element in the popup.
            if (!isInputExpanded()) {
                this.toggleList(true);
                if (!this.isAltModifierPressed) this.focusItem(list.children[0] as HTMLElement);
            } else {
                this.focusItem(list.children[0] as HTMLElement);
            }
            event.preventDefault(); // prevent scrolling
            break;
        case KeyCode.ArrowUp:
            // (Optional): If the popup is available, places focus on the last focusable element in the popup.
            if (isInputExpanded()) {
                this.focusItem(list.children[list.children.length - 1] as HTMLElement);
            }
            event.preventDefault(); // prevent scrolling
            break;
        case KeyCode.Escape:
            // Dismisses the popup if it is visible. Optionally, if the popup is hidden before Escape is pressed, clears the combobox.
            if (isInputExpanded()) {
                this.toggleList(false);
            } else {
                input.value = "";
            }
            input.focus();
            break;
        case KeyCode.Enter:
            // Autocompletes the combobox with the first suggestion
            if (isInputExpanded()) {
                this.selectItem(list.children[0] as HTMLElement);
            }
            break;
        case KeyCode.Alt:
            this.isAltModifierPressed = true;
            break;
    }
    // #endregion
}

export function handleListKeyPress(this: ComboboxFramework, event: KeyboardEvent): void {
    // #region Check if required variables are set
    const input = fetchInput.call(this);
    const list = fetchList.call(this);
    // #endregion

    // #region Handle the key press
    const li = event.target as HTMLElement;
    switch (event.key) {
        case KeyCode.Enter:
            // Select the item and close the list
            this.selectItem(li);
            break;
        case KeyCode.Escape:
            // Close the list and focus the input
            this.clearInput();
            break;
        case KeyCode.ArrowDown: {
            // Move focus to the next item in the list
            const nextLi = li.nextElementSibling as HTMLElement;
            if (nextLi) this.focusItem(nextLi);
            else this.focusItem(list.children[0] as HTMLElement);
            event.preventDefault(); // prevent scrolling
            break;
        }
        case KeyCode.ArrowUp: {
            // If alt is pressed, close the list and focus the input
            if (this.isAltModifierPressed) {
                input.focus();
                this.toggleList(false);
                event.preventDefault(); // prevent scrolling
                break;
            }

            // Move focus to the previous item in the list
            const previousLi = li.previousElementSibling as HTMLElement;
            if (previousLi) this.focusItem(previousLi);
            else this.focusItem(list.children[list.children.length - 1] as HTMLElement);
            event.preventDefault(); // prevent scrolling
            break;
        }
        case KeyCode.ArrowRight:
            // returns focus to the combobox without closing the popup
            input.focus();
            break;
        case KeyCode.ArrowLeft:
            // returns focus to the combobox without closing the popup
            input.focus();
            break;
        case KeyCode.Home:
            // Move focus to the first item in the list
            input.focus();
            break;
        case KeyCode.End:
            // Move focus to the last item in the list
            input.focus();
            break;
        case KeyCode.Backspace:
            // Move focus to the last item in the list
            input.focus();
            break;
        case KeyCode.Delete:
            // Move focus to the last item in the list
            input.focus();
            break;
        case KeyCode.Alt:
            this.isAltModifierPressed = true;
            break;
        default:
            // If the key is not handled, return focus to the input
            input.focus();
            break;
    }
    // #endregion
}

export function handleKeyUp(this: ComboboxFramework, event: KeyboardEvent): void {
    // #region Handle the key press
    switch (event.key) {
        case "Alt":
            this.isAltModifierPressed = false;
            break;
    }
    // #endregion
}

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
